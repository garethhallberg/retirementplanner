from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ChatMessageSend(BaseModel):
    message: str
    conversation_id: UUID | None = None


class ChatMessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: UUID
    title: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationDetailResponse(ConversationResponse):
    messages: list[ChatMessageResponse]
