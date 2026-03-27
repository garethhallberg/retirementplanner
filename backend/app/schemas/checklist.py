from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ChecklistItemCreate(BaseModel):
    title: str
    description: str | None = None
    category: str
    due_date: datetime | None = None
    sort_order: int = 0


class ChecklistItemResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    category: str
    is_completed: bool
    due_date: datetime | None
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChecklistItemUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    is_completed: bool | None = None
    due_date: datetime | None = None
    sort_order: int | None = None
