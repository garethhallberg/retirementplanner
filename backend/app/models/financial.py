import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class FinancialAccount(Base):
    __tablename__ = "financial_accounts"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    account_type = Column(String, nullable=False)  # pension, ISA, savings, investment, property
    balance = Column(Float, default=0.0)
    currency = Column(String, default="GBP")
    provider = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="financial_accounts")


class NetWorthSnapshot(Base):
    __tablename__ = "net_worth_snapshots"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    total_assets = Column(Float, default=0.0)
    total_liabilities = Column(Float, default=0.0)
    net_worth = Column(Float, default=0.0)
    snapshot_date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="net_worth_snapshots")
