export function createSalaryInput(onSubmit: (cents: number) => void): HTMLElement {
  const container = document.createElement("div");
  container.className = "salary-page";
  container.innerHTML = `
    <div class="salary-card">
      <div class="salary-icon">🎉</div>
      <h1 class="salary-heading">Congratulations!<br/>Enter your salary</h1>
      <div class="salary-field">
        <span class="salary-currency">Rs</span>
        <input type="number" id="salary-input" class="salary-input" placeholder="0.00" min="0.01" step="0.01" autofocus />
      </div>
      <button id="salary-btn" class="salary-btn">Get Started</button>
    </div>
  `;

  const input = container.querySelector("#salary-input") as HTMLInputElement;
  const btn = container.querySelector("#salary-btn") as HTMLButtonElement;

  function submit() {
    const val = parseFloat(input.value);
    if (isNaN(val) || val <= 0) {
      input.classList.add("input-error");
      return;
    }
    input.classList.remove("input-error");
    onSubmit(Math.round(val * 100));
  }

  btn.addEventListener("click", submit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });
  input.addEventListener("input", () => input.classList.remove("input-error"));

  return container;
}
