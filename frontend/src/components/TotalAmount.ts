export function createTotalAmount(): HTMLElement {
  const container = document.createElement("div");
  container.className = "total-amount";
  container.innerHTML = `<h2>Total Expenses</h2><span id="total-display">Rs 0.00</span>`;
  return container;
}

export function updateTotalDisplay(totalCents: number) {
  const el = document.getElementById("total-display");
  if (!el) return;
  const rupees = Math.floor(totalCents / 100);
  const paise = totalCents % 100;
  el.textContent = `Rs ${rupees}.${paise.toString().padStart(2, "0")}`;
}
