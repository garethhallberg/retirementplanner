from datetime import date

from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/countdown", tags=["countdown"])


@router.get("/")
def get_countdown(current_user: User = Depends(get_current_user)):
    if not current_user.retirement_date:
        return {
            "retirement_date": None,
            "days_remaining": None,
            "is_retired": False,
            "message": "No retirement date set. Update your profile to start the countdown.",
        }

    today = date.today()
    delta = current_user.retirement_date - today
    days_remaining = delta.days
    is_retired = days_remaining <= 0

    if is_retired:
        message = "Congratulations — you're retired!"
    elif days_remaining == 1:
        message = "Tomorrow's the big day!"
    elif days_remaining <= 7:
        message = f"Almost there — just {days_remaining} days to go!"
    elif days_remaining <= 30:
        message = f"{days_remaining} days — the home stretch!"
    elif days_remaining <= 365:
        months = days_remaining // 30
        message = f"Roughly {months} month{'s' if months != 1 else ''} to go."
    else:
        years = days_remaining // 365
        message = f"About {years} year{'s' if years != 1 else ''} to go — plenty of time to plan."

    return {
        "retirement_date": current_user.retirement_date.isoformat(),
        "days_remaining": max(days_remaining, 0),
        "is_retired": is_retired,
        "message": message,
    }
