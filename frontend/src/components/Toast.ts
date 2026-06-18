export function showToast(message: string) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span class="toast-icon">&#10003;</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2000);
}
