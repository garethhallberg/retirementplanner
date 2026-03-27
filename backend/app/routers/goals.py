from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalResponse, GoalUpdate

router = APIRouter(prefix="/api/goals", tags=["goals"])


@router.post("/{user_id}", response_model=GoalResponse, status_code=201)
def create_goal(user_id: UUID, goal_in: GoalCreate, db: Session = Depends(get_db)):
    goal = Goal(user_id=user_id, **goal_in.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.get("/{user_id}", response_model=list[GoalResponse])
def list_goals(user_id: UUID, category: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Goal).filter(Goal.user_id == user_id)
    if category:
        query = query.filter(Goal.category == category)
    return query.order_by(Goal.created_at.desc()).all()


@router.patch("/{goal_id}", response_model=GoalResponse)
def update_goal(goal_id: UUID, goal_in: GoalUpdate, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    for field, value in goal_in.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: UUID, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
