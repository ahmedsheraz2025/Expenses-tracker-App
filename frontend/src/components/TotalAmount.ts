export function createTotalAmount(): HTMLElement {
  const container = document.createElement("div");
  container.className = "total-amount";
  container.innerHTML = `<h2>Total: <span id="total-display">$0.00</span></h2>`;
  return container;
}

export function updateTotalDisplay(totalCents: number) {
  const el = document.getElementById("total-display");
  if (!el) return;
  const dollars = Math.floor(totalCents / 100);
  const cents = totalCents % 100;
  el.textContent = `$${dollars}.${cents.toString().padStart(2, "0")}`;
}
