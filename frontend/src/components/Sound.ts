const successAudio = new Audio("/assets/sounds/success.mp3");
const errorAudio = new Audio("/assets/sounds/error.mp3");
const warningAudio = new Audio("/assets/sounds/warning.mp3");

export function playSuccess() {
  successAudio.currentTime = 0;
  successAudio.play().catch(() => {});
}

export function playError() {
  errorAudio.currentTime = 0;
  errorAudio.play().catch(() => {});
}

export function playWarning() {
  warningAudio.currentTime = 0;
  warningAudio.play().catch(() => {});
}
