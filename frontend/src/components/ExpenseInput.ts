import { showError } from "./Toast.js";
import { playError } from "./Sound.js";

interface ExpenseInputProps {
  onAdd: (description: string, amountCents: number) => void;
}

export function createExpenseInput(props: ExpenseInputProps): HTMLElement {
  const container = document.createElement("div");
  container.className = "expense-input";
  container.innerHTML = `
    <input type="text" id="desc-input" placeholder="Description" maxlength="200" />
    <input type="number" id="amount-input" class="no-spinner" placeholder="Amount (Rs)" min="0.01" step="0.01" />
    <button id="add-btn">Add</button>
  `;

  const descInput = container.querySelector("#desc-input") as HTMLInputElement;
  const amountInput = container.querySelector("#amount-input") as HTMLInputElement;
  const addBtn = container.querySelector("#add-btn") as HTMLButtonElement;

  function clearError() {
    descInput.classList.remove("input-error");
    amountInput.classList.remove("input-error");
  }

  descInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      clearError();
      amountInput.focus();
    }
  });

  descInput.addEventListener("input", clearError);
  amountInput.addEventListener("input", clearError);

  amountInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      clearError();
      addBtn.click();
    }
  });

  addBtn.addEventListener("click", () => {
    const desc = descInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!desc) {
      descInput.classList.add("input-error");
      playError();
      showError("Enter your description", () => descInput.classList.remove("input-error"));
      descInput.focus();
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      amountInput.classList.add("input-error");
      playError();
      showError("Enter a valid amount", () => amountInput.classList.remove("input-error"));
      amountInput.focus();
      return;
    }

    clearError();
    const amountCents = Math.round(amount * 100);
    props.onAdd(desc, amountCents);
    descInput.value = "";
    amountInput.value = "";
    descInput.focus();
  });

  return container;
}
