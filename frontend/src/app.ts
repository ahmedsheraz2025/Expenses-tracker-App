import { createExpenseInput } from "./components/ExpenseInput.js";
import { createExpenseList, renderExpenses } from "./components/ExpenseList.js";
import { createTotalAmount, updateTotalDisplay } from "./components/TotalAmount.js";
import { showToast } from "./components/Toast.js";

const API_BASE = "";

interface Expense {
  id: string;
  description: string;
  amount_display: string;
  created_at: string;
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const opts: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }
  const resp = await fetch(`${API_BASE}${path}`, opts);
  if (!resp.ok && resp.status !== 204) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${resp.status}`);
  }
  if (resp.status === 204) return undefined as T;
  return resp.json();
}

async function loadExpenses() {
  const data = await apiRequest<{ expenses: Expense[] }>("GET", "/expenses");
  renderExpenses("expense-tbody", data.expenses, handleEdit, handleDelete);
  await loadTotal();
}

async function loadTotal() {
  const data = await apiRequest<{ total_cents: number }>("GET", "/expenses/total");
  updateTotalDisplay(data.total_cents);
}

function handleEdit(id: string) {
  const desc = prompt("New description:");
  if (!desc) return;
  const amountStr = prompt("New amount:");
  if (!amountStr) return;
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    alert("Amount must be a positive number");
    return;
  }
  apiRequest("PUT", `/expenses/${id}`, {
    description: desc,
    amount_cents: Math.round(amount * 100),
  }).then(() => {
    showToast("Edited");
    loadExpenses();
  });
}

function handleDelete(id: string) {
  if (!confirm("Delete this expense?")) return;
  apiRequest("DELETE", `/expenses/${id}`).then(() => {
    showToast("Deleted");
    loadExpenses();
  });
}

function loadInputContainer() {
  const container = document.getElementById("input-container");
  if (!container) return;
  const inputEl = createExpenseInput({
    async onAdd(description, amountCents) {
      await apiRequest("POST", "/expenses", {
        description,
        amount_cents: amountCents,
      });
      showToast("Added");
      loadExpenses();
    },
  });
  container.appendChild(inputEl);
}

function loadListContainer() {
  const container = document.getElementById("list-container");
  if (!container) return;
  const listEl = createExpenseList();
  container.appendChild(listEl);
}

function loadTotalContainer() {
  const container = document.getElementById("total-container");
  if (!container) return;
  const totalEl = createTotalAmount();
  container.appendChild(totalEl);
}

document.addEventListener("DOMContentLoaded", () => {
  loadTotalContainer();
  loadInputContainer();
  loadListContainer();
  loadExpenses();
});
