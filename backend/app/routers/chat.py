from datetime import datetime
from uuid import UUID

import anthropic
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.conversation import Conversation, Message
from app.models.user import User
from app.schemas.chat import (
    ChatMessageResponse,
    ChatMessageSend,
    ConversationDetailResponse,
    ConversationResponse,
)
from app.services.coach_context import build_user_context
from app.services.coach_prompt import build_system_prompt

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/", response_model=ChatMessageResponse)
def send_message(
    body: ChatMessageSend,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="AI coach is not configured. Set ANTHROPIC_API_KEY.")

    # Get or create conversation
    if body.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == body.conversation_id,
            Conversation.user_id == current_user.id,
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(user_id=current_user.id)
        db.add(conversation)
        db.flush()

    # Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=body.message,
    )
    db.add(user_msg)
    db.flush()

    # Build context and message history
    user_context = build_user_context(db, current_user)
    system_prompt = build_system_prompt(user_context)

    prior_messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at)
        .all()
    )

    api_messages = [{"role": m.role, "content": m.content} for m in prior_messages]

    # Call Claude
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = client.messages.create(
        model=settings.ANTHROPIC_MODEL,
        max_tokens=1024,
        system=system_prompt,
        messages=api_messages,
    )

    assistant_content = response.content[0].text

    # Save assistant message
    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=assistant_content,
    )
    db.add(assistant_msg)

    # Auto-title from first exchange
    if not conversation.title and len(prior_messages) <= 1:
        conversation.title = body.message[:80]

    conversation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg


@router.get("/conversations", response_model=list[ConversationResponse])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation
