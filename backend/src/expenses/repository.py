import uuid
from datetime import datetime, timezone
from typing import Optional

from src.db.database import get_connection


class ExpenseRepository:
    async def add(self, description: str, amount_cents: int) -> dict:
        expense_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        conn = await get_connection()
        try:
            await conn.execute(
                "INSERT INTO expenses (id, description, amount_cents, created_at) VALUES (?, ?, ?, ?)",
                (expense_id, description, amount_cents, created_at),
            )
            await conn.commit()
            return {
                "id": expense_id,
                "description": description,
                "amount_cents": amount_cents,
                "created_at": created_at,
            }
        finally:
            await conn.close()

    async def get_by_id(self, expense_id: str) -> Optional[dict]:
        conn = await get_connection()
        try:
            cursor = await conn.execute(
                "SELECT id, description, amount_cents, created_at FROM expenses WHERE id = ?",
                (expense_id,),
            )
            row = await cursor.fetchone()
            if row is None:
                return None
            return dict(row)
        finally:
            await conn.close()

    async def update(
        self, expense_id: str, description: Optional[str], amount_cents: Optional[int]
    ) -> Optional[dict]:
        expense = await self.get_by_id(expense_id)
        if expense is None:
            return None
        new_desc = description if description is not None else expense["description"]
        new_amount = amount_cents if amount_cents is not None else expense["amount_cents"]
        conn = await get_connection()
        try:
            await conn.execute(
                "UPDATE expenses SET description = ?, amount_cents = ? WHERE id = ?",
                (new_desc, new_amount, expense_id),
            )
            await conn.commit()
            return {
                "id": expense_id,
                "description": new_desc,
                "amount_cents": new_amount,
                "created_at": expense["created_at"],
            }
        finally:
            await conn.close()

    async def delete(self, expense_id: str) -> bool:
        conn = await get_connection()
        try:
            cursor = await conn.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
            await conn.commit()
            return cursor.rowcount > 0
        finally:
            await conn.close()

    async def list_all(self) -> list[dict]:
        conn = await get_connection()
        try:
            cursor = await conn.execute(
                "SELECT id, description, amount_cents, created_at FROM expenses ORDER BY created_at DESC"
            )
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            await conn.close()

    async def get_total_cents(self) -> int:
        conn = await get_connection()
        try:
            cursor = await conn.execute(
                "SELECT COALESCE(SUM(amount_cents), 0) as total FROM expenses"
            )
            row = await cursor.fetchone()
            return row["total"]
        finally:
            await conn.close()
