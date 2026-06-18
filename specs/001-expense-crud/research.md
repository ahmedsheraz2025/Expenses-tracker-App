# Research: Core Expense CRUD

## Technology Decisions

### Backend: Python 3.12+ with FastAPI + Click CLI

- **Decision**: FastAPI for REST API, Click for CLI
- **Rationale**: FastAPI provides automatic OpenAPI docs, async support, and type validation via Pydantic. Click is the standard Python CLI framework.
- **Alternatives considered**: Flask (less built-in validation), Typer (newer, Click-based)

### Frontend: Vanilla TypeScript

- **Decision**: Vanilla TypeScript without a framework
- **Rationale**: Single-page expense tracker with minimal state — doesn't warrant React/Vue overhead. Constitution principle I (Simplicity First).
- **Alternatives considered**: React (overkill for this scope), Vue (similar overkill)

### Storage: SQLite via aiosqlite (async)

- **Decision**: SQLite with aiosqlite for async Python
- **Rationale**: Local-first, zero-config, matches Offline-First principle. aiosqlite integrates cleanly with FastAPI async handlers.
- **Alternatives considered**: JSON file (no querying), PostgreSQL (overkill for local-only)

### Testing: pytest with httpx for API tests

- **Decision**: pytest with httpx async client and pytest-asyncio
- **Rationale**: Industry standard for Python async testing.
- **Alternatives considered**: unittest (verbose), nose (deprecated)

### Formatting/Linting: ruff

- **Decision**: ruff for both formatting and linting
- **Rationale**: Fast, single tool, replaces flake8 + black + isort.
- **Alternatives considered**: black + flake8 (slower, more config)

## Data Design

### Expense Model

- **id**: UUID (string) — primary key
- **description**: TEXT — non-empty, max 200 chars
- **amount_cents**: INTEGER — positive, stored as cents (avoid float issues)
- **created_at**: TEXT — ISO 8601 timestamp

### Repository Pattern

- Database operations abstracted behind `ExpenseRepository` interface
- Allows unit testing business logic with mock repository
- Single table: `expenses`

## API Contract

### REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /expenses | List all expenses |
| POST | /expenses | Create new expense |
| PUT | /expenses/{id} | Update expense |
| DELETE | /expenses/{id} | Delete expense |
| GET | /expenses/total | Get total amount |

### CLI Commands

| Command | Args | Description |
|---------|------|-------------|
| add | --desc, --amount | Add expense |
| list | | List expenses |
| edit | --id, --desc, --amount | Edit expense |
| delete | --id | Delete expense |
| total | | Show total |

## Frontend Architecture

- Single HTML page served by FastAPI static files
- TypeScript compiled to JS, fetched by browser
- Components: ExpenseInput, ExpenseList, TotalAmount
- Toast notification system for user feedback
- Fetches from backend REST API
