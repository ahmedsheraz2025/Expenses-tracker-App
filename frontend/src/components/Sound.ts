const successAudio = new Audio("/success.mp3");
const errorAudio = new Audio("/error.mp3");

export function playSuccess() {
  successAudio.currentTime = 0;
  successAudio.play().catch(() => {});
}

export function playError() {
  errorAudio.currentTime = 0;
  errorAudio.play().catch(() => {});
}
