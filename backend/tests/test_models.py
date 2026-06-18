import pytest
from pydantic import ValidationError
from src.expenses.models import ExpenseCreate, ExpenseUpdate


class TestExpenseCreate:
    def test_valid_expense(self):
        expense = ExpenseCreate(description="Lunch", amount_cents=1550)
        assert expense.description == "Lunch"
        assert expense.amount_cents == 1550

    def test_empty_description_raises(self):
        with pytest.raises(ValidationError):
            ExpenseCreate(description="", amount_cents=100)

    def test_negative_amount_raises(self):
        with pytest.raises(ValidationError):
            ExpenseCreate(description="Lunch", amount_cents=-100)

    def test_zero_amount_raises(self):
        with pytest.raises(ValidationError):
            ExpenseCreate(description="Lunch", amount_cents=0)

    def test_description_too_long_raises(self):
        with pytest.raises(ValidationError):
            ExpenseCreate(description="x" * 201, amount_cents=100)


class TestExpenseUpdate:
    def test_partial_update(self):
        update = ExpenseUpdate(description="New Lunch")
        assert update.description == "New Lunch"
        assert update.amount_cents is None

    def test_empty_update(self):
        update = ExpenseUpdate()
        assert update.description is None
        assert update.amount_cents is None

    def test_negative_amount_raises(self):
        with pytest.raises(ValidationError):
            ExpenseUpdate(amount_cents=-10)
