# Feature Specification: Core Expense CRUD

**Feature Branch**: `001-expense-crud`

**Created**: 2026-06-18

**Status**: Draft

**Input**: User description: "Core expense tracking features from constitution App Features section"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add, Edit, Delete Expenses (Priority: P1)

User can add a new expense by entering a description and amount, edit an existing expense, or delete one.

**Why this priority**: Core functionality — without CRUD there is no app.

**Independent Test**: Can be fully tested by adding an expense, verifying it appears, editing the amount, verifying the update, deleting it, and verifying removal.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** user enters "Lunch" with amount "15.50" and clicks Add, **Then** a new expense "Lunch - $15.50" appears in the list
2. **Given** an expense exists in the list, **When** user clicks Edit and changes the amount, **Then** the expense updates with the new amount
3. **Given** an expense exists in the list, **When** user clicks Delete, **Then** the expense is removed from the list

---

### User Story 2 - View Expense List (Priority: P1)

Display all expenses in a list/table with description, amount, and date.

**Why this priority**: Users must see their expenses to manage them.

**Independent Test**: Can be tested by adding multiple expenses and verifying they all appear in the list with correct details.

**Acceptance Scenarios**:

1. **Given** multiple expenses exist, **When** user views the main screen, **Then** all expenses are displayed in a list with description, amount, and date
2. **Given** no expenses exist, **When** user views the main screen, **Then** an empty list or placeholder message is shown

---

### User Story 3 - Total Amount Display (Priority: P2)

Show the sum of all expenses, auto-updating when expenses are added, edited, or deleted.

**Why this priority**: Running total is a key insight but CRUD works without it.

**Independent Test**: Add expenses with known amounts and verify total equals expected sum; edit/delete and verify total updates.

**Acceptance Scenarios**:

1. **Given** expenses of $10 and $20 exist, **When** user views the app, **Then** total shows $30
2. **Given** expenses totaling $30, **When** user deletes a $10 expense, **Then** total updates to $20
3. **Given** expenses totaling $20, **When** user edits an expense from $20 to $25, **Then** total updates to $25

---

### User Story 4 - Action Notifications (Priority: P2)

Show a toast notification when Add, Edit, or Delete is performed.

**Why this priority**: Feedback improves UX but is non-critical.

**Acceptance Scenarios**:

1. **Given** user adds an expense, **When** the action completes, **Then** a toast appears at bottom with green checkmark, "Added" message, transparent background with white borders
2. **Given** user edits an expense, **When** the action completes, **Then** a toast appears with "Edited" message
3. **Given** user deletes an expense, **When** the action completes, **Then** a toast appears with "Deleted" message
4. **Given** a toast is visible, **When** 2 seconds pass, **Then** the toast auto-dismisses

---

### Edge Cases

- What happens when user tries to add an expense with empty description?
- What happens when user tries to add an expense with negative or zero amount?
- What happens when user tries to add an expense with non-numeric amount?
- What happens when user edits an expense and clears the amount field?
- How does the system handle extremely long descriptions?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow user to add a new expense with description (text) and amount (positive number)
- **FR-002**: System MUST allow user to edit the description and amount of an existing expense
- **FR-003**: System MUST allow user to delete an existing expense
- **FR-004**: System MUST display all expenses in a list showing description, amount, and date
- **FR-005**: System MUST calculate and display the sum of all expenses
- **FR-006**: The total MUST auto-update when expenses are added, edited, or deleted
- **FR-007**: System MUST show a toast notification after every Add, Edit, or Delete action
- **FR-008**: Toast MUST display a green checkmark (✓) and relevant message ("Added", "Edited", "Deleted")
- **FR-009**: Toast MUST have transparent background with small white borders
- **FR-010**: Toast MUST auto-dismiss after 2 seconds
- **FR-011**: System MUST validate that amount is a positive number before accepting an expense
- **FR-012**: System MUST validate that description is non-empty

### Key Entities *(include if feature involves data)*

- **Expense**: Represents a single financial entry with id, description (string), amount (positive number/currency), date (timestamp)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User can complete full CRUD cycle (add, view, edit, delete) in under 30 seconds
- **SC-002**: Total amount updates within 1 second of any add/edit/delete action
- **SC-003**: Toast notification appears within 500ms of action completion

## Assumptions

- Single-user app; no authentication needed for v1
- Local-only storage; no sync for this version
- Amounts stored as integers (cents) to avoid floating-point errors
- Only one currency supported per instance
