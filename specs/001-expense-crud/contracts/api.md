# API Contract: Expense CRUD

## Base URL

`http://localhost:8000`

## Endpoints

### GET /expenses

List all expenses sorted by creation date (newest first).

**Response 200**:
```json
{
  "expenses": [
    {
      "id": "uuid-string",
      "description": "Lunch",
      "amount_cents": 1550,
      "amount_display": "$15.50",
      "created_at": "2026-06-18T12:00:00Z"
    }
  ]
}
```

---

### POST /expenses

Create a new expense.

**Request**:
```json
{
  "description": "Lunch",
  "amount_cents": 1550
}
```

**Validation**:
- `description`: required, string, 1-200 chars
- `amount_cents`: required, integer, > 0

**Response 201**:
```json
{
  "id": "uuid-string",
  "description": "Lunch",
  "amount_cents": 1550,
  "amount_display": "$15.50",
  "created_at": "2026-06-18T12:00:00Z"
}
```

**Response 422** (validation error):
```json
{
  "detail": [
    {
      "loc": ["body", "amount_cents"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error"
    }
  ]
}
```

---

### PUT /expenses/{id}

Update an existing expense.

**Request**:
```json
{
  "description": "Updated Lunch",
  "amount_cents": 2000
}
```

**Response 200**: Updated expense object (same shape as POST response)

**Response 404**: `{"detail": "Expense not found"}`

---

### DELETE /expenses/{id}

Delete an expense.

**Response 204**: No content

**Response 404**: `{"detail": "Expense not found"}`

---

### GET /expenses/total

Get the sum of all expenses.

**Response 200**:
```json
{
  "total_cents": 3550,
  "total_display": "$35.50"
}
```
