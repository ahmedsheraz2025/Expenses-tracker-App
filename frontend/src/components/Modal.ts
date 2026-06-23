export function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal">
        <p class="modal-message">${message}</p>
        <div class="modal-actions">
          <button class="modal-btn modal-cancel">Cancel</button>
          <button class="modal-btn modal-confirm">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const cancelBtn = overlay.querySelector(".modal-cancel") as HTMLButtonElement;
    const confirmBtn = overlay.querySelector(".modal-confirm") as HTMLButtonElement;

    cancelBtn.addEventListener("click", () => {
      overlay.remove();
      resolve(false);
    });
    confirmBtn.addEventListener("click", () => {
      overlay.remove();
      resolve(true);
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve(false);
      }
    });
    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        overlay.remove();
        resolve(false);
      }
      if (e.key === "Enter") {
        overlay.remove();
        resolve(true);
      }
    });
    setTimeout(() => cancelBtn.focus(), 50);
  });
}

export function showEditPrompt(
  currentDesc: string,
  currentAmount: string
): Promise<{ description: string; amountCents: number } | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal modal-form">
        <h3 class="modal-title">Edit Expense</h3>
        <div class="modal-field">
          <label for="modal-desc">Description</label>
          <input type="text" id="modal-desc" class="modal-input" value="${currentDesc}" maxlength="200" />
        </div>
        <div class="modal-field">
          <label for="modal-amount">Amount (Rs)</label>
          <input type="text" id="modal-amount" class="modal-input" value="${currentAmount}" inputmode="decimal" />
        </div>
        <div class="modal-actions">
          <button class="modal-btn modal-cancel">Cancel</button>
          <button class="modal-btn modal-save">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const descInput = overlay.querySelector("#modal-desc") as HTMLInputElement;
    const amountInput = overlay.querySelector("#modal-amount") as HTMLInputElement;

    const close = (result: { description: string; amountCents: number } | null) => {
      overlay.remove();
      resolve(result);
    };

    overlay.querySelector(".modal-cancel")?.addEventListener("click", () => close(null));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(null);
    });
    overlay.querySelector(".modal-save")?.addEventListener("click", () => {
      const desc = descInput.value.trim();
      const amount = parseFloat(amountInput.value);
      if (!desc) { descInput.focus(); return; }
      if (isNaN(amount) || amount <= 0) { amountInput.focus(); return; }
      close({ description: desc, amountCents: Math.round(amount * 100) });
    });

    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        close(null);
      }
    });
    descInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        amountInput.focus();
      }
    });
    amountInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        (overlay.querySelector(".modal-save") as HTMLButtonElement)?.click();
      }
    });

    setTimeout(() => {
      descInput.focus();
      descInput.setSelectionRange(descInput.value.length, descInput.value.length);
    }, 50);

    amountInput.addEventListener("focus", () => {
      setTimeout(() => {
        amountInput.setSelectionRange(amountInput.value.length, amountInput.value.length);
      }, 0);
    });
  });
}

export function showExpenseWarning(): Promise<"continue" | "remove"> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "warning-overlay";
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("show"));

    const banner = document.createElement("div");
    banner.className = "warning-banner";
    banner.innerHTML = `
      <p class="warning-banner-text">Expenses are increasing. Try to reduce your expenses</p>
      <div class="warning-banner-actions">
        <button class="modal-btn warning-remove">Remove recent expense</button>
        <button class="modal-btn warning-continue">Continue adding</button>
      </div>
    `;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add("show"));

    const close = (result: "continue" | "remove") => {
      overlay.classList.remove("show");
      banner.classList.remove("show");
      setTimeout(() => { overlay.remove(); banner.remove(); resolve(result); }, 300);
    };

    banner.querySelector(".warning-remove")?.addEventListener("click", () => close("remove"));
    banner.querySelector(".warning-continue")?.addEventListener("click", () => close("continue"));
  });
}

export function showRecoverConfirm(): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal">
        <p class="modal-message">Deleted your all Expenses by mistake? Don't worry press Recover to get back your Expenses</p>
        <div class="modal-actions">
          <button class="modal-btn modal-cancel">Cancel</button>
          <button class="modal-btn modal-confirm" style="background:#059669">Recover</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const cancelBtn = overlay.querySelector(".modal-cancel") as HTMLButtonElement;
    const confirmBtn = overlay.querySelector(".modal-confirm") as HTMLButtonElement;

    cancelBtn.addEventListener("click", () => {
      overlay.remove();
      resolve(false);
    });
    confirmBtn.addEventListener("click", () => {
      overlay.remove();
      resolve(true);
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve(false);
      }
    });
    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        overlay.remove();
        resolve(false);
      }
      if (e.key === "Enter") {
        overlay.remove();
        resolve(true);
      }
    });
    setTimeout(() => cancelBtn.focus(), 50);
  });
}

export function showRecoveredPopup(): void {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal" style="text-align:center">
      <p class="modal-message">Recovered</p>
      <button class="modal-btn modal-save" id="recovered-ok" style="margin-top:8px">OK</button>
    </div>
  `;
  document.body.appendChild(overlay);
  const okBtn = overlay.querySelector("#recovered-ok") as HTMLButtonElement;
  okBtn.addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}
