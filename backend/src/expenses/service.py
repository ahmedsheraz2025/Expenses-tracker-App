from src.expenses.repository import ExpenseRepository
from src.expenses.models import ExpenseCreate, ExpenseUpdate


def _format_amount(amount_cents: int) -> str:
    rupees = amount_cents // 100
    paise = amount_cents % 100
    return f"Rs {rupees}.{paise:02d}"


def _to_response(expense: dict) -> dict:
    return {
        "id": expense["id"],
        "description": expense["description"],
        "amount_cents": expense["amount_cents"],
        "amount_display": _format_amount(expense["amount_cents"]),
        "created_at": expense["created_at"],
    }


class ExpenseService:
    def __init__(self, repo: ExpenseRepository | None = None):
        self.repo = repo or ExpenseRepository()

    async def create(self, data: ExpenseCreate) -> dict:
        expense = await self.repo.add(data.description, data.amount_cents)
        return _to_response(expense)

    async def update(self, expense_id: str, data: ExpenseUpdate) -> dict | None:
        expense = await self.repo.update(expense_id, data.description, data.amount_cents)
        if expense is None:
            return None
        return _to_response(expense)

    async def list_all(self) -> list[dict]:
        expenses = await self.repo.list_all()
        return [_to_response(e) for e in expenses]

    async def delete(self, expense_id: str) -> bool:
        return await self.repo.delete(expense_id)
