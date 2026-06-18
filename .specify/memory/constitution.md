# Expenses Tracker App Constitution

## Core Principles

### I. Simplicity First
Build only what is needed. Avoid over-engineering. Every feature must justify its existence. Use YAGNI (You Ain't Gonna Need It) — no speculative features.

### II. Data Privacy & Security
All financial data must be stored securely. Never log raw transaction details. Support local-first storage with optional cloud sync. No data leaves the device without explicit user consent.

### III. Test-Driven Development
TDD mandatory for all business logic: Write test → Test fails → Implement → Test passes → Refactor. Maintain minimum 80% code coverage on core expense logic.

### IV. Offline-First
The app must work fully offline. Sync is a separate concern. Local data is the source of truth; cloud is a backup.

## App Features

### Expense Input
A text input field where the user writes the expense description and amount.

### Action Buttons
- **Add** — Add a new expense
- **Edit** — Modify an existing expense
- **Delete** — Remove an expense

### Total Amount Display
Show the sum of all expenses at the top or bottom of the list. Auto-updates when an expense is added, edited, or deleted.

### Expense List
Display all expenses in a list/table showing description, amount, and date.

### Action Notifications
When Add, Edit, or Delete is performed, show a popup/toast notification at the bottom with:
- **Transparent background** with small white borders
- **Green checkmark (✓) logo**
- **Message text**: "Added", "Edited", or "Deleted"
- Auto-dismiss after 2 seconds

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | TypeScript (Vanilla or React) |
| Backend Language | Python 3.12+ |
| Package Management | uv |
| CLI Framework | Click or Typer |
| Data Storage | SQLite (local) |
| Testing | pytest |
| Formatting | ruff |

## Project Structure

```
expenses-tracker-app/
├── src/                          # Backend source code
│   ├── expenses/                 # Core business logic
│   │   ├── __init__.py
│   │   ├── models.py             # Data models
│   │   ├── repository.py         # Database operations
│   │   └── service.py            # Business logic
│   ├── api/                      # API layer
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── db/                       # Database setup
│   │   ├── __init__.py
│   │   └── database.py
│   └── main.py                   # Entry point
├── frontend/                     # Frontend source code
│   ├── src/
│   │   ├── components/           # UI components
│   │   │   ├── ExpenseInput.ts
│   │   │   ├── ExpenseList.ts
│   │   │   └── TotalAmount.ts
│   │   ├── app.ts                # App entry
│   │   └── styles.css
│   └── index.html
├── tests/                        # Test files
│   ├── test_models.py
│   ├── test_service.py
│   └── test_api.py
├── .specify/                     # Spec Kit artifacts
├── .opencode/                    # OpenCode config
├── AGENTS.md                     # Agent instructions
├── pyproject.toml                # Python project config (uv)
├── package.json                  # Frontend dependencies
└── README.md
```

## Development Workflow

1. **Constitution first** — All work must align with this constitution
2. **Spec → Plan → Tasks → Implement** — Follow the speckit workflow sequentially
3. **Package manager**: Use `uv` for all Python dependency management
4. **Quality gates**: All tests must pass before marking a task complete
5. **Commit discipline**: Atomic commits with clear messages; never commit secrets

## Governance

This constitution supersedes all other practices. Amendments require documented discussion and team approval. All PRs must verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-06-17 | **Last Amended**: 2026-06-17
