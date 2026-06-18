from fastapi import APIRouter, HTTPException
from src.expenses.models import ExpenseCreate, ExpenseUpdate, ExpenseListResponse
from src.expenses.service import ExpenseService
from src.expenses.repository import ExpenseRepository

router = APIRouter()
repo = ExpenseRepository()
service = ExpenseService(repo)


@router.get("/expenses")
async def list_expenses():
    expenses = await service.list_all()
    return {"expenses": expenses}


@router.post("/expenses", status_code=201)
async def create_expense(data: ExpenseCreate):
    return await service.create(data)


@router.put("/expenses/{expense_id}")
async def update_expense(expense_id: str, data: ExpenseUpdate):
    result = await service.update(expense_id, data)
    if result is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return result


@router.get("/expenses/total")
async def total_expenses():
    total = await repo.get_total_cents()
    dollars = total // 100
    cents = total % 100
    return {"total_cents": total, "total_display": f"${dollars}.{cents:02d}"}


@router.delete("/expenses/{expense_id}", status_code=204)
async def delete_expense(expense_id: str):
    deleted = await service.delete(expense_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Expense not found")
