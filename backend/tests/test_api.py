import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app
from src.db.database import init_db, get_connection


@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()


@pytest.fixture(autouse=True)
async def clear_db():
    conn = await get_connection()
    try:
        await conn.execute("DELETE FROM expenses")
        await conn.commit()
    finally:
        await conn.close()


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


class TestListExpenses:
    async def test_list_expenses_returns_200_with_expenses(self, client):
        await client.post("/expenses", json={"description": "Lunch", "amount_cents": 1550})
        await client.post("/expenses", json={"description": "Dinner", "amount_cents": 2500})
        response = await client.get("/expenses")
        assert response.status_code == 200
        data = response.json()
        assert len(data["expenses"]) == 2

    async def test_list_expenses_empty_returns_200(self, client):
        response = await client.get("/expenses")
        assert response.status_code == 200
        data = response.json()
        assert data["expenses"] == []


class TestTotalExpenses:
    async def test_total_returns_correct_sum(self, client):
        await client.post("/expenses", json={"description": "A", "amount_cents": 1000})
        await client.post("/expenses", json={"description": "B", "amount_cents": 2500})
        response = await client.get("/expenses/total")
        assert response.status_code == 200
        data = response.json()
        assert data["total_cents"] == 3500
        assert data["total_display"] == "$35.00"

    async def test_total_zero_when_no_expenses(self, client):
        response = await client.get("/expenses/total")
        assert response.status_code == 200
        data = response.json()
        assert data["total_cents"] == 0

    async def test_total_updates_after_delete(self, client):
        resp = await client.post("/expenses", json={"description": "A", "amount_cents": 1000})
        expense_id = resp.json()["id"]
        await client.post("/expenses", json={"description": "B", "amount_cents": 2000})
        await client.delete(f"/expenses/{expense_id}")
        response = await client.get("/expenses/total")
        assert response.json()["total_cents"] == 2000


class TestCreateExpense:
    async def test_create_expense_returns_201(self, client):
        response = await client.post(
            "/expenses", json={"description": "Lunch", "amount_cents": 1550}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["description"] == "Lunch"
        assert data["amount_cents"] == 1550
        assert "id" in data
        assert "created_at" in data

    async def test_create_expense_empty_description_returns_422(self, client):
        response = await client.post("/expenses", json={"description": "", "amount_cents": 100})
        assert response.status_code == 422

    async def test_create_expense_negative_amount_returns_422(self, client):
        response = await client.post(
            "/expenses", json={"description": "Lunch", "amount_cents": -10}
        )
        assert response.status_code == 422


class TestUpdateExpense:
    async def test_update_existing_expense_returns_200(self, client):
        create_resp = await client.post(
            "/expenses", json={"description": "Lunch", "amount_cents": 1550}
        )
        expense_id = create_resp.json()["id"]
        response = await client.put(
            f"/expenses/{expense_id}", json={"description": "Updated Lunch", "amount_cents": 2000}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Updated Lunch"
        assert data["amount_cents"] == 2000

    async def test_update_nonexistent_expense_returns_404(self, client):
        response = await client.put(
            "/expenses/nonexistent-id", json={"description": "Test", "amount_cents": 100}
        )
        assert response.status_code == 404


class TestDeleteExpense:
    async def test_delete_existing_expense_returns_204(self, client):
        create_resp = await client.post(
            "/expenses", json={"description": "Lunch", "amount_cents": 1550}
        )
        expense_id = create_resp.json()["id"]
        response = await client.delete(f"/expenses/{expense_id}")
        assert response.status_code == 204

    async def test_delete_nonexistent_expense_returns_404(self, client):
        response = await client.delete("/expenses/nonexistent-id")
        assert response.status_code == 404
