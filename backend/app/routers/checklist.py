from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.checklist import ChecklistItem
from app.schemas.checklist import ChecklistItemCreate, ChecklistItemResponse, ChecklistItemUpdate

router = APIRouter(prefix="/api/checklist", tags=["checklist"])


@router.post("/{user_id}", response_model=ChecklistItemResponse, status_code=201)
def create_item(user_id: UUID, item_in: ChecklistItemCreate, db: Session = Depends(get_db)):
    item = ChecklistItem(user_id=user_id, **item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{user_id}", response_model=list[ChecklistItemResponse])
def list_items(user_id: UUID, category: str | None = None, db: Session = Depends(get_db)):
    query = db.query(ChecklistItem).filter(ChecklistItem.user_id == user_id)
    if category:
        query = query.filter(ChecklistItem.category == category)
    return query.order_by(ChecklistItem.sort_order).all()


@router.patch("/item/{item_id}", response_model=ChecklistItemResponse)
def update_item(item_id: UUID, item_in: ChecklistItemUpdate, db: Session = Depends(get_db)):
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    for field, value in item_in.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/item/{item_id}", status_code=204)
def delete_item(item_id: UUID, db: Session = Depends(get_db)):
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    db.delete(item)
    db.commit()
