# Implementation Plan: Core Expense CRUD

**Branch**: `001-expense-crud` | **Date**: 2026-06-18 | **Spec**: [spec.md](../001-expense-crud/spec.md)

**Input**: Feature specification from `/specs/001-expense-crud/spec.md`

## Summary

Build the core expense tracking CRUD: add, edit, delete expenses with a list view, running total, and toast notifications. Local-first with SQLite storage and CLI backend + frontend UI.

## Technical Context

**Language/Version**: Python 3.12+ (backend), TypeScript (frontend)

**Primary Dependencies**: Click or Typer (CLI framework), pytest (testing), ruff (formatting)

**Storage**: SQLite (local, via repository pattern)

**Testing**: pytest

**Target Platform**: Desktop browser (frontend served locally)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: All CRUD operations complete in under 1 second

**Constraints**: Offline-capable, local-only storage, no external dependencies

**Scale/Scope**: Single-user, single-currency

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Check | Status |
|-----------|-----------|--------|
| I. Simplicity First | Only CRUD + total + toasts — no speculative features | ✅ Pass |
| II. Data Privacy & Security | Local SQLite storage, no data leaves device | ✅ Pass |
| III. Test-Driven Development | All business logic must follow TDD | ✅ Pass |
| IV. Offline-First | SQLite works fully offline | ✅ Pass |

## Project Structure

### Documentation (this feature)

```text
specs/001-expense-crud/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── expenses/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── repository.py
│   │   └── service.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── db/
│   │   ├── __init__.py
│   │   └── database.py
│   └── main.py
├── tests/
│   ├── test_models.py
│   ├── test_service.py
│   └── test_api.py
├── pyproject.toml
└── README.md

frontend/
├── src/
│   ├── components/
│   │   ├── ExpenseInput.ts
│   │   ├── ExpenseList.ts
│   │   └── TotalAmount.ts
│   ├── app.ts
│   └── styles.css
└── index.html
```

**Structure Decision**: Web application with `backend/` (Python CLI/API) and `frontend/` (TypeScript/HTML). Backend serves REST API, frontend consumes it in browser.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | All gates passed | N/A |
