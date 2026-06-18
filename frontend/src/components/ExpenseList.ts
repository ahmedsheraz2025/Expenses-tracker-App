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
          <i class="ti ti-edit" aria-hidden="true"></i> Edit
        </button>
        <button class="action-btn delete-btn" data-id="${exp.id}">
          <i class="ti ti-trash" aria-hidden="true"></i> Delete
        </button>
      </td>
    `;
    row.querySelector(".edit-btn")?.addEventListener("click", () => onEdit(exp));
    row.querySelector(".delete-btn")?.addEventListener("click", () => onDelete(exp.id));
    tbody.appendChild(row);
  }
}
