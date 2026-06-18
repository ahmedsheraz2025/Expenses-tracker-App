# Quickstart: Core Expense CRUD

## Prerequisites

- Python 3.12+
- uv (package manager)
- Node.js 18+ (for TypeScript compilation)
- npm (for frontend dependencies)

## Setup

```bash
# Backend
cd backend
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv sync

# Frontend
cd ../frontend
npm install
```

## Run

```bash
# Start backend (serves API + frontend static files)
cd backend
uv run uvicorn src.main:app --reload

# Open in browser
# http://localhost:8000
```

## Validation Scenarios

### Scenario 1: Add Expense

```bash
curl -X POST http://localhost:8000/expenses \
  -H "Content-Type: application/json" \
  -d '{"description": "Lunch", "amount_cents": 1550}'
```

**Expected**: 201 response with expense object containing id, description, amount_cents, created_at

### Scenario 2: List Expenses

```bash
curl http://localhost:8000/expenses
```

**Expected**: 200 response with expenses array containing the added expense

### Scenario 3: View Total

```bash
curl http://localhost:8000/expenses/total
```

**Expected**: 200 response with `{"total_cents": 1550, "total_display": "$15.50"}`

### Scenario 4: Edit Expense

```bash
curl -X PUT http://localhost:8000/expenses/{id} \
  -H "Content-Type: application/json" \
  -d '{"description": "Updated Lunch", "amount_cents": 2000}'
```

**Expected**: 200 response with updated expense

### Scenario 5: Delete Expense

```bash
curl -X DELETE http://localhost:8000/expenses/{id}
```

**Expected**: 204 response

### Scenario 6: Validation Error

```bash
curl -X POST http://localhost:8000/expenses \
  -H "Content-Type: application/json" \
  -d '{"description": "", "amount_cents": -5}'
```

**Expected**: 422 response with validation errors

### Scenario 7: Full UI Flow

1. Open `http://localhost:8000` in browser
2. Type "Groceries" in description, "45.50" in amount, click Add
3. Verify expense appears in list
4. Verify total shows "$45.50"
5. Click Edit, change amount to "50.00", save
6. Verify total updates to "$50.00"
7. Verify toast shows "Edited" with green checkmark
8. Click Delete on the expense
9. Verify expense disappears and total becomes "$0.00"
10. Verify toast shows "Deleted"
