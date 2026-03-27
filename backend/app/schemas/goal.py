from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class GoalCreate(BaseModel):
    title: str
    description: str | None = None
    category: str
    target_date: datetime | None = None


class GoalResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    category: str
    status: str
    target_date: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class GoalUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    status: str | None = None
    target_date: datetime | None = None
