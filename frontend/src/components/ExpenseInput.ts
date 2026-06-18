interface ExpenseInputProps {
  onAdd: (description: string, amountCents: number) => void;
}

export function createExpenseInput(props: ExpenseInputProps): HTMLElement {
  const container = document.createElement("div");
  container.className = "expense-input";
  container.innerHTML = `
    <input type="text" id="desc-input" placeholder="Description" maxlength="200" />
    <input type="number" id="amount-input" placeholder="Amount" min="0.01" step="0.01" />
    <button id="add-btn">Add</button>
  `;

  const descInput = container.querySelector("#desc-input") as HTMLInputElement;
  const amountInput = container.querySelector("#amount-input") as HTMLInputElement;
  const addBtn = container.querySelector("#add-btn") as HTMLButtonElement;

  addBtn.addEventListener("click", () => {
    const desc = descInput.value.trim();
    const amount = parseFloat(amountInput.value);
    if (!desc) {
      alert("Description is required");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert("Amount must be a positive number");
      return;
    }
    const amountCents = Math.round(amount * 100);
    props.onAdd(desc, amountCents);
    descInput.value = "";
    amountInput.value = "";
  });

  return container;
}
