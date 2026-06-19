interface Expense {
  id: string;
  description: string;
  amount_display: string;
  amount_cents: number;
  created_at: string;
}

export function createExpenseList(): HTMLElement {
  const container = document.createElement("div");
  container.className = "expense-list";
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Amount</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="expense-tbody"></tbody>
    </table>
  `;
  return container;
}

export function renderExpenses(
  tbodyId: string,
  expenses: Expense[],
  onEdit: (exp: Expense) => void | Promise<void>,
  onDelete: (id: string) => void
) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = "";

  if (expenses.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4">No expenses yet</td>`;
    tbody.appendChild(row);
    return;
  }

  for (const exp of expenses) {
    const row = document.createElement("tr");
    const date = new Date(exp.created_at).toLocaleDateString();
    row.innerHTML = `
      <td>${exp.description}</td>
      <td>${exp.amount_display}</td>
      <td>${date}</td>
      <td>
        <button class="action-btn edit-btn" data-id="${exp.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg> Edit
        </button>
        <button class="action-btn delete-btn" data-id="${exp.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg> Delete
        </button>
      </td>
    `;
    row.querySelector(".edit-btn")?.addEventListener("click", () => onEdit(exp));
    row.querySelector(".delete-btn")?.addEventListener("click", () => onDelete(exp.id));
    tbody.appendChild(row);
  }
}
