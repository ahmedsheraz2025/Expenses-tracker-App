import { createExpenseInput } from "./components/ExpenseInput.js";
import { createExpenseList, renderExpenses } from "./components/ExpenseList.js";
import { createTotalAmount, updateTotalDisplay, setTotalColorRed, resetTotalColor } from "./components/TotalAmount.js";
import { createSalaryInput } from "./components/SalaryInput.js";
import { showToast } from "./components/Toast.js";
import { showConfirm, showEditPrompt, showExpenseWarning, showRecoverConfirm, showRecoveredPopup } from "./components/Modal.js";
import { playSuccess, playWarning } from "./components/Sound.js";
import { initVoiceInput } from "./components/VoiceInput.js";

const API_BASE = "";
const WARNING_THRESHOLD_CENTS = 5000000;

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
let warningAcknowledged = false;
let currentExpenses: Expense[] = [];

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
  currentExpenses = data.expenses;
  renderExpenses("expense-tbody", data.expenses, handleEdit, handleDelete);
  await loadTotal();
  await checkExpenseWarning(data.expenses);
}

async function checkExpenseWarning(expenses: Expense[]) {
  if (warningAcknowledged) return;
  const totalData = await apiRequest<{ total_cents: number }>("GET", "/expenses/total");
  if (totalData.total_cents <= WARNING_THRESHOLD_CENTS) return;
  if (expenses.length === 0) return;

  setTotalColorRed();
  const choice = await showExpenseWarning();
  if (choice === "continue") {
    warningAcknowledged = true;
  } else {
    warningAcknowledged = true;
    resetTotalColor();
    const recentExpense = expenses[0];
    await apiRequest("DELETE", `/expenses/${recentExpense.id}`);
    showToast("Deleted");
    const data = await apiRequest<{ expenses: Expense[] }>("GET", "/expenses");
    currentExpenses = data.expenses;
    renderExpenses("expense-tbody", data.expenses, handleEdit, handleDelete);
    await loadTotal();
  }
}

async function loadTotal() {
  const data = await apiRequest<{ total_cents: number }>("GET", "/expenses/total");
  updateTotalDisplay(data.total_cents);
  if (data.total_cents >= WARNING_THRESHOLD_CENTS) {
    setTotalColorRed();
  } else {
    resetTotalColor();
    warningAcknowledged = false;
  }
}

async function handleEdit(exp: Expense) {
  const amountVal = (exp.amount_cents / 100).toFixed(2);
  const result = await showEditPrompt(exp.description, amountVal);
  if (!result) return;
  await apiRequest("PUT", `/expenses/${exp.id}`, {
    description: capitalize(result.description),
    amount_cents: result.amountCents,
  });
  playSuccess();
  showToast("Edited");
  loadExpenses();
}

async function handleDelete(id: string, description?: string) {
  const msg = description ? `Confirm removal of <strong>${description}</strong> expense?` : "Delete this expense?";
  const confirmed = await showConfirm(msg);
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
      <div class="header-actions">
        <button id="extra-btn" class="theme-btn" aria-label="Extra action">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
          </svg>
        </button>
        <button id="theme-toggle" class="theme-btn" aria-label="Toggle theme">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </div>
    <div id="total-container"></div>
    <div id="input-container"></div>
    <div id="list-container"></div>
    <div id="fab-container"></div>
  `;

  initThemeToggle();
  initExtraBtn();
  loadTotalContainer();
  loadInputContainer();
  loadListContainer();
  loadFabButton();
  loadExpenses();
}

function loadInputContainer() {
  const container = document.getElementById("input-container");
  if (!container) return;
  const inputEl = createExpenseInput({
    async onAdd(description, amountCents) {
      await apiRequest("POST", "/expenses", {
        description: capitalize(description),
        amount_cents: amountCents,
      });
      const totalData = await apiRequest<{ total_cents: number }>("GET", "/expenses/total");
      if (totalData.total_cents > WARNING_THRESHOLD_CENTS) {
        playWarning();
      } else {
        playSuccess();
      }
      showToast("Added");
      await loadExpenses();
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

function initExtraBtn() {
  const btn = document.getElementById("extra-btn");
  if (!btn) return;
  const actionsEl = document.querySelector(".header-actions");
  if (!actionsEl) return;

  const dropdown = document.createElement("div");
  dropdown.className = "extra-dropdown";
  dropdown.innerHTML = `
    <button class="dropdown-item delete-all-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      <span>Delete all expenses</span>
    </button>
    <button class="dropdown-item recover-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
      <span>Recover your deleted Expenses</span>
    </button>
  `;
  actionsEl.appendChild(dropdown);

  function closeDropdown() {
    if (dropdown.classList.contains("open")) {
      dropdown.classList.remove("open");
      dropdown.classList.add("closing");
      setTimeout(() => dropdown.classList.remove("closing"), 200);
    }
  }

  function openDropdown() {
    dropdown.classList.remove("closing");
    void dropdown.offsetWidth;
    dropdown.classList.add("open");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (dropdown.classList.contains("open")) {
      closeDropdown();
    } else if (dropdown.classList.contains("closing")) {
      dropdown.classList.remove("closing");
      openDropdown();
    } else {
      openDropdown();
    }
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target as Node) && e.target !== btn) {
      if (dropdown.classList.contains("open")) {
        closeDropdown();
      } else if (dropdown.classList.contains("closing")) {
        dropdown.classList.remove("closing");
      }
    }
  });

  const deleteAllBtn = dropdown.querySelector(".delete-all-btn") as HTMLButtonElement;
  deleteAllBtn.addEventListener("click", async () => {
    closeDropdown();
    const confirmed = await showConfirm("Delete all expenses?");
    if (!confirmed) return;
    await apiRequest("DELETE", "/expenses");
    showToast("All expenses deleted");
    warningAcknowledged = false;
    loadExpenses();
  });

  const recoverBtn = dropdown.querySelector(".recover-btn") as HTMLButtonElement;
  recoverBtn.addEventListener("click", async () => {
    closeDropdown();
    const confirmed = await showRecoverConfirm();
    if (!confirmed) return;
    await apiRequest("POST", "/expenses/recover");
    showRecoveredPopup();
    warningAcknowledged = false;
    loadExpenses();
  });
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

  const [salaryData] = await Promise.all([
    apiRequest<{ salary_cents: number }>("GET", "/salary"),
    new Promise(r => setTimeout(r, 1500)),
  ]);
  app.innerHTML = "";

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

function loadFabButton() {
  const container = document.getElementById("fab-container");
  if (!container) return;
  const wrapper = document.createElement("div");
  wrapper.className = "fab-wrapper";
  wrapper.innerHTML = `
    <button id="fab-btn" class="fab-btn" aria-label="Voice input">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
    </button>
    <span class="fab-tooltip">Click to use this app with your voice</span>
  `;
  container.appendChild(wrapper);

  const micBtn = wrapper.querySelector("#fab-btn") as HTMLElement;
  if (!micBtn) return;

  initVoiceInput(micBtn, {
    async addExpense(description, amountCents) {
      await apiRequest("POST", "/expenses", { description: capitalize(description), amount_cents: amountCents });
      const totalData = await apiRequest<{ total_cents: number }>("GET", "/expenses/total");
      if (totalData.total_cents > WARNING_THRESHOLD_CENTS) {
        playWarning();
      } else {
        playSuccess();
      }
      showToast("Added");
      await loadExpenses();
    },
    toggleTheme() {
      document.getElementById("theme-toggle")?.click();
    },
    async deleteExpense(index: number) {
      const exp = currentExpenses[index];
      if (!exp) return;
      await handleDelete(exp.id, exp.description);
    },
    async editExpense(index: number) {
      const exp = currentExpenses[index];
      if (!exp) return;
      await handleEdit(exp);
    },
    getExpenses() {
      return currentExpenses;
    },
  });
}

document.addEventListener("DOMContentLoaded", init);
