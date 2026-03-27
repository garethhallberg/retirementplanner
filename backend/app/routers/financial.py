from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.financial import FinancialAccount, NetWorthSnapshot
from app.schemas.financial import (
    FinancialAccountCreate,
    FinancialAccountResponse,
    FinancialAccountUpdate,
    NetWorthSnapshotResponse,
)

router = APIRouter(prefix="/api/financial", tags=["financial"])


@router.post("/accounts/{user_id}", response_model=FinancialAccountResponse, status_code=201)
def create_account(user_id: UUID, account_in: FinancialAccountCreate, db: Session = Depends(get_db)):
    account = FinancialAccount(user_id=user_id, **account_in.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.get("/accounts/{user_id}", response_model=list[FinancialAccountResponse])
def list_accounts(user_id: UUID, db: Session = Depends(get_db)):
    return db.query(FinancialAccount).filter(FinancialAccount.user_id == user_id).all()


@router.patch("/accounts/{account_id}", response_model=FinancialAccountResponse)
def update_account(account_id: UUID, account_in: FinancialAccountUpdate, db: Session = Depends(get_db)):
    account = db.query(FinancialAccount).filter(FinancialAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    for field, value in account_in.model_dump(exclude_unset=True).items():
        setattr(account, field, value)
    db.commit()
    db.refresh(account)
    return account


@router.delete("/accounts/{account_id}", status_code=204)
def delete_account(account_id: UUID, db: Session = Depends(get_db)):
    account = db.query(FinancialAccount).filter(FinancialAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(account)
    db.commit()


@router.get("/net-worth/{user_id}", response_model=list[NetWorthSnapshotResponse])
def list_net_worth_snapshots(user_id: UUID, db: Session = Depends(get_db)):
    return (
        db.query(NetWorthSnapshot)
        .filter(NetWorthSnapshot.user_id == user_id)
        .order_by(NetWorthSnapshot.snapshot_date.desc())
        .all()
    )
