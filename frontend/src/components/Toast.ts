export function showToast(message: string, showIcon = true) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  container.innerHTML = "";
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = showIcon ? `<span class="toast-icon">&#10003;</span>${message}` : message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2500);
}

export function showError(message: string, onClose?: () => void) {
  const container = document.getElementById("error-container");
  if (!container) return;
  if (container.children.length > 0) return;
  const el = document.createElement("div");
  el.className = "error-toast";
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.remove();
    onClose?.();
  }, 2500);
}
