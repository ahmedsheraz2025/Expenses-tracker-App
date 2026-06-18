import { createExpenseInput } from "./components/ExpenseInput.js";
import { createExpenseList, renderExpenses } from "./components/ExpenseList.js";
import { createTotalAmount, updateTotalDisplay } from "./components/TotalAmount.js";
import { createSalaryInput } from "./components/SalaryInput.js";
import { showToast } from "./components/Toast.js";
import { showConfirm, showEditPrompt } from "./components/Modal.js";
import { playSuccess } from "./components/Sound.js";

const API_BASE = "";

interface Expense {
  id: string;
  description: string;
  amount_display: string;
  amount_cents: number;
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

async function handleEdit(exp: Expense) {
  const amountVal = (exp.amount_cents / 100).toFixed(2);
  const result = await showEditPrompt(exp.description, amountVal);
  if (!result) return;
  await apiRequest("PUT", `/expenses/${exp.id}`, {
    description: result.description,
    amount_cents: result.amountCents,
  });
  playSuccess();
  showToast("Edited");
  loadExpenses();
}

async function handleDelete(id: string) {
  const confirmed = await showConfirm("Delete this expense?");
  if (!confirmed) return;
  await apiRequest("DELETE", `/expenses/${id}`);
  showToast("Deleted");
  loadExpenses();
}

function loadMainApp() {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = `
    <div class="app-header">
      <h1>Expenses Tracker</h1>
      <button id="theme-toggle" class="theme-btn" aria-label="Toggle theme">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </div>
    <div id="total-container"></div>
    <div id="input-container"></div>
    <div id="list-container"></div>
  `;

  initThemeToggle();
  loadTotalContainer();
  loadInputContainer();
  loadListContainer();
  loadExpenses();
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
      playSuccess();
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

const moonSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const sunSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const theme = localStorage.getItem("theme") || "light";
  btn.innerHTML = theme === "dark" ? sunSvg : moonSvg;
  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    btn.innerHTML = next === "dark" ? sunSvg : moonSvg;
  });
}

async function init() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = "";

  const salaryData = await apiRequest<{ salary_cents: number }>("GET", "/salary");

  if (salaryData.salary_cents > 0) {
    loadMainApp();
  } else {
    const salaryEl = createSalaryInput(async (cents) => {
      await apiRequest("PUT", "/salary", { amount_cents: cents });
      loadMainApp();
    });
    app.appendChild(salaryEl);
  }
}

document.addEventListener("DOMContentLoaded", init);
