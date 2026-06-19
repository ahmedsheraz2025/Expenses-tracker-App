const PER_PAGE = 10;
let currentPage = 1;
let allExpenses: Expense[] = [];
let currentOnEdit: ((exp: Expense) => void | Promise<void>) | null = null;
let currentOnDelete: ((id: string) => void) | null = null;

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
    <div id="pagination" class="pagination"></div>
  `;
  return container;
}

export function renderExpenses(
  tbodyId: string,
  expenses: Expense[],
  onEdit: (exp: Expense) => void | Promise<void>,
  onDelete: (id: string) => void
) {
  allExpenses = expenses;
  currentOnEdit = onEdit;
  currentOnDelete = onDelete;

  const totalPages = Math.max(1, Math.ceil(expenses.length / PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = expenses.slice(start, start + PER_PAGE);

  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = "";

  if (pageItems.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4">No expenses yet</td>`;
    tbody.appendChild(row);
  } else {
    for (const exp of pageItems) {
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

  renderPagination();
}

function renderPagination() {
  const container = document.getElementById("pagination");
  if (!container) return;
  const totalPages = Math.max(1, Math.ceil(allExpenses.length / PER_PAGE));
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = `
    <button class="page-btn" id="page-prev" ${currentPage <= 1 ? "disabled" : ""}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <span class="page-info">${currentPage} / ${totalPages}</span>
    <button class="page-btn" id="page-next" ${currentPage >= totalPages ? "disabled" : ""}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  `;
  container.querySelector("#page-prev")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      refreshCurrentPage();
    }
  });
  container.querySelector("#page-next")?.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(allExpenses.length / PER_PAGE));
    if (currentPage < totalPages) {
      currentPage++;
      refreshCurrentPage();
    }
  });
}

function refreshCurrentPage() {
  if (!currentOnEdit || !currentOnDelete) return;
  renderExpenses("expense-tbody", allExpenses, currentOnEdit, currentOnDelete);
}
