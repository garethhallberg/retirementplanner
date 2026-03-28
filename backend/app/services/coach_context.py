from datetime import date

from sqlalchemy.orm import Session

from app.models.checklist import ChecklistItem
from app.models.financial import FinancialAccount, NetWorthSnapshot
from app.models.goal import Goal
from app.models.user import User


def build_user_context(db: Session, user: User) -> str:
    """Build a structured context string from the user's retirement data."""
    sections = []

    # Profile
    sections.append("## Your User's Profile")
    sections.append(f"- Name: {user.full_name}")
    if user.retirement_date:
        days_remaining = (user.retirement_date - date.today()).days
        if days_remaining > 0:
            sections.append(f"- Retirement date: {user.retirement_date.strftime('%d %B %Y')} ({days_remaining} days away)")
        elif days_remaining == 0:
            sections.append(f"- Retirement date: {user.retirement_date.strftime('%d %B %Y')} (TODAY!)")
        else:
            sections.append(f"- Retirement date: {user.retirement_date.strftime('%d %B %Y')} (retired {abs(days_remaining)} days ago)")
    else:
        sections.append("- Retirement date: Not yet set")

    # Financial accounts
    accounts = db.query(FinancialAccount).filter(FinancialAccount.user_id == user.id).all()
    if accounts:
        sections.append("\n## Financial Accounts")
        by_type: dict[str, list[FinancialAccount]] = {}
        for acc in accounts:
            by_type.setdefault(acc.account_type, []).append(acc)
        for acc_type, accs in by_type.items():
            total = sum(a.balance for a in accs)
            sections.append(f"- {acc_type.title()} ({len(accs)} account{'s' if len(accs) != 1 else ''}): {accs[0].currency} {total:,.0f}")
            for a in accs:
                provider_str = f" ({a.provider})" if a.provider else ""
                sections.append(f"  - {a.name}{provider_str}: {a.currency} {a.balance:,.0f}")
    else:
        sections.append("\n## Financial Accounts\n- No accounts added yet")

    # Net worth
    snapshot = (
        db.query(NetWorthSnapshot)
        .filter(NetWorthSnapshot.user_id == user.id)
        .order_by(NetWorthSnapshot.snapshot_date.desc())
        .first()
    )
    if snapshot:
        sections.append(f"\n## Latest Net Worth (as of {snapshot.snapshot_date.strftime('%d %B %Y')})")
        sections.append(f"- Total assets: GBP {snapshot.total_assets:,.0f}")
        sections.append(f"- Total liabilities: GBP {snapshot.total_liabilities:,.0f}")
        sections.append(f"- Net worth: GBP {snapshot.net_worth:,.0f}")

    # Checklist
    items = db.query(ChecklistItem).filter(ChecklistItem.user_id == user.id).all()
    if items:
        sections.append("\n## Retirement Checklist Progress")
        by_cat: dict[str, list[ChecklistItem]] = {}
        for item in items:
            by_cat.setdefault(item.category, []).append(item)
        for cat, cat_items in by_cat.items():
            done = sum(1 for i in cat_items if i.is_completed)
            sections.append(f"- {cat.title()}: {done}/{len(cat_items)} complete")
            outstanding = [i for i in cat_items if not i.is_completed]
            if outstanding:
                for i in outstanding:
                    sections.append(f"  - Outstanding: \"{i.title}\"")
    else:
        sections.append("\n## Retirement Checklist\n- No checklist items yet")

    # Goals
    goals = db.query(Goal).filter(Goal.user_id == user.id).all()
    if goals:
        sections.append("\n## Retirement Goals")
        by_cat: dict[str, list[Goal]] = {}
        for g in goals:
            by_cat.setdefault(g.category, []).append(g)
        for cat, cat_goals in by_cat.items():
            goal_strs = [f"\"{g.title}\" ({g.status.replace('_', ' ')})" for g in cat_goals]
            sections.append(f"- {cat.title()} ({len(cat_goals)}): {', '.join(goal_strs)}")
    else:
        sections.append("\n## Retirement Goals\n- No goals added yet")

    return "\n".join(sections)
