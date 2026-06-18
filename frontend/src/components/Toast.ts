export function showToast(message: string) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span class="toast-icon">&#10003;</span>${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2000);
}

export function showError(message: string, onClose?: () => void) {
  const container = document.getElementById("error-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "error-toast";
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.remove();
    onClose?.();
  }, 2000);
}
