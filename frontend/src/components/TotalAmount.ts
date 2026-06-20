export function createTotalAmount(): HTMLElement {
  const container = document.createElement("div");
  container.className = "total-amount";
  container.innerHTML = `<h2>TOTAL SPENT</h2><span id="total-display">Rs 0.00</span>`;
  return container;
}

export function updateTotalDisplay(totalCents: number) {
  const el = document.getElementById("total-display");
  if (!el) return;
  const rupees = Math.floor(totalCents / 100);
  const paise = totalCents % 100;
  el.textContent = `Rs ${rupees.toLocaleString()}.${paise.toString().padStart(2, "0")}`;
}

export function setTotalColorRed() {
  const el = document.getElementById("total-display");
  if (!el) return;
  el.style.color = "#ef4444";
}

export function resetTotalColor() {
  const el = document.getElementById("total-display");
  if (!el) return;
  el.style.color = "";
}
