from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    retirement_date: date | None = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    retirement_date: date | None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: str | None = None
    retirement_date: date | None = None
