from pydantic import BaseModel, Field
from typing import Optional


class ExpenseCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=200)
    amount_cents: int = Field(..., gt=0)


class ExpenseUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1, max_length=200)
    amount_cents: Optional[int] = Field(None, gt=0)


class ExpenseResponse(BaseModel):
    id: str
    description: str
    amount_cents: int
    amount_display: str
    created_at: str


class ExpenseListResponse(BaseModel):
    expenses: list[ExpenseResponse]


class TotalResponse(BaseModel):
    total_cents: int
    total_display: str
