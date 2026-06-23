import json
import uuid
from datetime import datetime, timezone
from typing import Optional

from src.db.database import get_connection


class ExpenseRepository:
    async def add(self, description: str, amount_cents: int) -> dict:
        expense_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        async with get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "INSERT INTO expenses (id, description, amount_cents, created_at) VALUES (%s, %s, %s, %s)",
                    (expense_id, description, amount_cents, created_at),
                )
            await conn.commit()
            return {
                "id": expense_id,
                "description": description,
                "amount_cents": amount_cents,
                "created_at": created_at,
            }

    async def get_by_id(self, expense_id: str) -> Optional[dict]:
        async with get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT id, description, amount_cents, created_at FROM expenses WHERE id = %s",
                    (expense_id,),
                )
                row = await cursor.fetchone()
                if row is None:
                    return None
                return dict(row)

    async def update(
        self, expense_id: str, description: Optional[str], amount_cents: Optional[int]
    ) -> Optional[dict]:
        expense = await self.get_by_id(expense_id)
        if expense is None:
            return None
        new_desc = description if description is not None else expense["description"]
        new_amount = amount_cents if amount_cents is not None else expense["amount_cents"]
        async with get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "UPDATE expenses SET description = %s, amount_cents = %s WHERE id = %s",
                    (new_desc, new_amount, expense_id),
                )
            await conn.commit()
            return {
                "id": expense_id,
                "description": new_desc,
                "amount_cents": new_amount,
                "created_at": expense["created_at"],
            }

    async def delete(self, expense_id: str) -> bool:
        async with get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "DELETE FROM expenses WHERE id = %s", (expense_id,)
                )
            await conn.commit()
            return cursor.rowcount > 0

    async def list_all(self) -> list[dict]:
        async with get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT id, description, amount_cents, created_at FROM expenses ORDER BY created_at DESC"
                )
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

    async def append_to_backup(self, expense: dict) -> None:
        existing = await self.get_backup()
        backup_list = json.loads(existing) if existing else []
        backup_list.append(expense)
        await self.save_backup(json.dumps(backup_list))

    async def save_backup(self, data: str) -> None:
        async with get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "REPLACE INTO settings (`key`, `value`) VALUES ('deleted_backup', %s)",
                    (data,),
                )
            await conn.commit()

    async def get_backup(self) -> str | None:
        async with get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT `value` FROM settings WHERE `key` = 'deleted_backup'"
                )
                row = await cursor.fetchone()
                return row["value"] if row else None

    async def clear_backup(self) -> None:
        async with get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "DELETE FROM settings WHERE `key` = 'deleted_backup'"
                )
            await conn.commit()

    async def list_all_raw(self) -> list[dict]:
        async with get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT id, description, amount_cents, created_at FROM expenses ORDER BY created_at DESC"
                )
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

    async def insert_raw(self, expense: dict) -> None:
        async with get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "INSERT INTO expenses (id, description, amount_cents, created_at) VALUES (%s, %s, %s, %s)",
                    (expense["id"], expense["description"], expense["amount_cents"], expense["created_at"]),
                )
            await conn.commit()

    async def delete_all(self) -> None:
        async with get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("DELETE FROM expenses")
            await conn.commit()

    async def get_total_cents(self) -> int:
        async with get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT COALESCE(SUM(amount_cents), 0) as total FROM expenses"
                )
                row = await cursor.fetchone()
                return int(row["total"])
