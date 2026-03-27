from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class FinancialAccountCreate(BaseModel):
    name: str
    account_type: str
    balance: float = 0.0
    currency: str = "GBP"
    provider: str | None = None
    notes: str | None = None


class FinancialAccountResponse(BaseModel):
    id: UUID
    name: str
    account_type: str
    balance: float
    currency: str
    provider: str | None
    notes: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class FinancialAccountUpdate(BaseModel):
    name: str | None = None
    account_type: str | None = None
    balance: float | None = None
    currency: str | None = None
    provider: str | None = None
    notes: str | None = None


class NetWorthSnapshotResponse(BaseModel):
    id: UUID
    total_assets: float
    total_liabilities: float
    net_worth: float
    snapshot_date: datetime

    class Config:
        from_attributes = True
