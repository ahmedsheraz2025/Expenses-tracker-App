# Data Model: Core Expense CRUD

## Entity: Expense

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID (string) | Primary key, auto-generated | Unique identifier |
| description | TEXT | Required, non-empty, max 200 chars | Expense description |
| amount_cents | INTEGER | Required, positive (>0) | Amount in smallest currency unit (cents) |
| created_at | TEXT | ISO 8601, auto-set on creation | Timestamp of expense creation |

### Validation Rules

- **description**: MUST be non-empty, MUST NOT exceed 200 characters
- **amount_cents**: MUST be positive integer (>0), stored as cents (e.g., $15.50 = 1550)
- **created_at**: Set automatically on creation, never modified

### JSON Representation

```json
{
  "id": "a1b2c3d4-...",
  "description": "Lunch",
  "amount_cents": 1550,
  "created_at": "2026-06-18T12:00:00Z"
}
```

## Database Schema

```sql
CREATE TABLE expenses (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
    created_at TEXT NOT NULL
);

CREATE INDEX idx_expenses_created_at ON expenses(created_at);
```
