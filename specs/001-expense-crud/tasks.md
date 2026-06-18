---

description: "Task list for Core Expense CRUD feature"

---

# Tasks: Core Expense CRUD

**Input**: Design documents from `specs/001-expense-crud/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: TDD is mandated by the constitution — test tasks are included for all business logic.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend directory structure: `backend/src/expenses/`, `backend/src/api/`, `backend/src/db/`, `backend/tests/`
- [X] T002 Create frontend directory structure: `frontend/src/components/`, `frontend/`
- [X] T003 [P] Initialize Python project with `pyproject.toml` at `backend/pyproject.toml` using uv (dependencies: fastapi, uvicorn, aiosqlite, click, pydantic)
- [X] T004 [P] Initialize frontend project with `package.json` at `frontend/package.json` (dependencies: typescript)
- [X] T005 [P] Configure TypeScript `tsconfig.json` at `frontend/tsconfig.json`
- [X] T006 [P] Configure ruff formatter/linter at `backend/pyproject.toml` (ruff section)
- [X] T007 Create `frontend/index.html` as the single-page entry point linking to compiled JS and CSS

⏸️ **PAUSE**: Awaiting human review before proceeding to Phase 2

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Create database connection module in `backend/src/db/database.py` with aiosqlite async connection management
- [X] T009 Create Expense Pydantic models (request/response schemas) in `backend/src/expenses/models.py`
- [X] T010 Create database initialization with expenses table creation in `backend/src/db/database.py` (init_db function)
- [X] T011 Create ExpenseRepository base class with interface in `backend/src/expenses/repository.py`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

⏸️ **PAUSE**: Awaiting human review before proceeding to Phase 3

---

## Phase 3: User Story 1 - Add, Edit, Delete Expenses (Priority: P1) 🎯 MVP

**Goal**: User can add, edit, and delete expenses via backend API and frontend UI

**Independent Test**: Add an expense via POST /expenses, verify 201 response with expense data. Edit with PUT /expenses/{id}, verify 200. Delete with DELETE /expenses/{id}, verify 204.

### Tests for User Story 1

- [X] T012 [P] [US1] Write test for Expense model validation in `backend/tests/test_models.py` (test valid/invalid description and amount_cents)
- [X] T013 [P] [US1] Write contract test for POST /expenses in `backend/tests/test_api.py` (test 201, 422 responses)
- [X] T014 [P] [US1] Write contract test for PUT /expenses/{id} in `backend/tests/test_api.py` (test 200, 404 responses)
- [X] T015 [P] [US1] Write contract test for DELETE /expenses/{id} in `backend/tests/test_api.py` (test 204, 404 responses)

### Implementation for User Story 1

- [X] T016 [P] [US1] Implement Expense CRUD repository methods in `backend/src/expenses/repository.py` (add, update, delete)
- [X] T017 [US1] Implement ExpenseService in `backend/src/expenses/service.py` (business logic for add, update, delete with validation)
- [X] T018 [US1] Implement POST, PUT, DELETE API routes in `backend/src/api/routes.py`
- [X] T019 [US1] Create FastAPI app entry point with static files mount in `backend/src/main.py`
- [X] T020 [P] [US1] Create ExpenseInput component in `frontend/src/components/ExpenseInput.ts` (description + amount form, Add button)
- [X] T021 [US1] Wire frontend Add/Edit/Delete to backend API in `frontend/src/app.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional — expenses can be added, edited, and deleted via both API and UI

⏸️ **PAUSE**: Awaiting human review before proceeding to Phase 4

---

## Phase 4: User Story 2 - View Expense List (Priority: P1)

**Goal**: User can view all expenses in a list showing description, amount, and date

**Independent Test**: Add 2+ expenses via POST, call GET /expenses, verify all are returned. Frontend: verify list renders all entries.

### Tests for User Story 2

- [X] T022 [P] [US2] Write contract test for GET /expenses in `backend/tests/test_api.py` (test 200 with expense list, test empty list)

### Implementation for User Story 2

- [X] T023 [P] [US2] Implement GET /expenses route in `backend/src/api/routes.py` (list all, sorted by date desc)
- [X] T024 [P] [US2] Create ExpenseList component in `frontend/src/components/ExpenseList.ts` (table showing description, amount, date with Edit/Delete buttons)
- [X] T025 [US2] Wire frontend expense list to GET /expenses API in `frontend/src/app.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work — full CRUD with visible list

⏸️ **PAUSE**: Awaiting human review before proceeding to Phase 5

---

## Phase 5: User Story 3 - Total Amount Display (Priority: P2)

**Goal**: Running total of all expenses displayed and auto-updating on changes

**Independent Test**: Add expenses of $10 + $20, verify GET /expenses/total returns $30. Delete $10 expense, verify total updates to $20. Edit $20 to $25, verify total updates to $25.

### Tests for User Story 3

- [X] T026 [P] [US3] Write contract test for GET /expenses/total in `backend/tests/test_api.py` (test total calculation, test zero, test after delete/edit)

### Implementation for User Story 3

- [X] T027 [P] [US3] Implement repository total method in `backend/src/expenses/repository.py` (get_total_cents)
- [X] T028 [P] [US3] Implement GET /expenses/total route in `backend/src/api/routes.py`
- [X] T029 [P] [US3] Create TotalAmount component in `frontend/src/components/TotalAmount.ts` (displays formatted total)
- [X] T030 [US3] Wire total display to refresh after add/edit/delete in `frontend/src/app.ts`

**Checkpoint**: User Stories 1, 2, AND 3 work — CRUD with running total

⏸️ **PAUSE**: Awaiting human review before proceeding to Phase 6

---

## Phase 6: User Story 4 - Action Notifications (Priority: P2)

**Goal**: Toast notifications on Add, Edit, Delete with green checkmark and auto-dismiss

**Independent Test**: Perform Add/Edit/Delete actions, verify toast appears at bottom with correct message, green checkmark, transparent background with white borders, and dismisses after 2 seconds.

### Implementation for User Story 4

- [X] T031 [P] [US4] Create toast notification system in `frontend/src/components/Toast.ts` (show/dismiss, auto-dismiss timer, styling)
- [X] T032 [US4] Integrate toast notifications with Add/Edit/Delete actions in `frontend/src/app.ts`
- [X] T033 [US4] Add toast styles to `frontend/src/styles.css` (transparent background, white borders, green checkmark)

**Checkpoint**: All user stories should now be independently functional

⏸️ **PAUSE**: Awaiting human review before proceeding to Phase 7

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T034 [P] Create and verify all tests pass: run `cd backend && uv run pytest` from project root
- [X] T035 [P] Compile TypeScript: run `cd frontend && npx tsc`
- [X] T036 [P] Add README.md at `backend/README.md` with setup and usage instructions
- [X] T037 [P] Run ruff format on `backend/src/` and `backend/tests/`
- [X] T038 Code cleanup and consistency pass across all files
- [X] T039 Run quickstart.md validation scenarios to verify end-to-end functionality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (P1) → US2 (P1) → US3 (P2) → US4 (P2) in priority order
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD per constitution)
- Repository → Service → API routes → Frontend components

### Parallel Opportunities

- T003-T006 can all run in parallel (different config files)
- All test tasks within a story marked [P] can run in parallel
- T012-T015 (US1 tests) can run in parallel
- T016+T020 (repository + frontend component) can run in parallel
- T023+T024 (API route + frontend component) can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Add, Edit, Delete)
4. **STOP and VALIDATE**: Test US1 independently via API
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (CRUD) → Test independently → MVP!
3. Add US2 (List) → Test independently
4. Add US3 (Total) → Test independently
5. Add US4 (Toasts) → Test independently

### Full Feature

1. Complete all phases 1-7 sequentially
2. Run full test suite and quickstart validation
