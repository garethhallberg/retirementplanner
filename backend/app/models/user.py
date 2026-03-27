import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Column, Date, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    retirement_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    financial_accounts = relationship("FinancialAccount", back_populates="user")
    net_worth_snapshots = relationship("NetWorthSnapshot", back_populates="user")
    checklist_items = relationship("ChecklistItem", back_populates="user")
    goals = relationship("Goal", back_populates="user")
