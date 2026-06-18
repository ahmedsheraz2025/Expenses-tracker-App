const successAudio = new Audio("/success.mp3");

export function playSuccess() {
  successAudio.currentTime = 0;
  successAudio.play().catch(() => {});
}
