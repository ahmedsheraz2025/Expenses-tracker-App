from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from src.expenses.models import ExpenseCreate, ExpenseUpdate, ExpenseListResponse
from src.expenses.service import ExpenseService
from src.expenses.repository import ExpenseRepository
from src.db.database import get_connection

router = APIRouter()
repo = ExpenseRepository()
service = ExpenseService(repo)


class SalarySet(BaseModel):
    amount_cents: int = Field(..., gt=0)


@router.get("/salary")
async def get_salary():
    async with get_connection() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT `value` FROM settings WHERE `key` = 'salary'")
            row = await cursor.fetchone()
            if row is None:
                return {"salary_cents": 0, "salary_display": "Rs 0.00"}
            cents = int(row["value"])
            rupees = cents // 100
            paise = cents % 100
            return {"salary_cents": cents, "salary_display": f"Rs {rupees}.{paise:02d}"}


@router.put("/salary", status_code=200)
async def set_salary(data: SalarySet):
    async with get_connection() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "REPLACE INTO settings (`key`, `value`) VALUES ('salary', %s)",
                (str(data.amount_cents),),
            )
        await conn.commit()
        rupees = data.amount_cents // 100
        paise = data.amount_cents % 100
        return {"salary_cents": data.amount_cents, "salary_display": f"Rs {rupees}.{paise:02d}"}


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
    rupees = total // 100
    paise = total % 100
    return {"total_cents": total, "total_display": f"Rs {rupees}.{paise:02d}"}


@router.delete("/expenses/{expense_id}", status_code=204)
async def delete_expense(expense_id: str):
    deleted = await service.delete(expense_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Expense not found")
