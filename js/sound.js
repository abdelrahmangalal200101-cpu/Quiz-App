const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration = 150, type = "sine") {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();

  // smooth fade out
  gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration / 1000
  );

  oscillator.stop(audioCtx.currentTime + duration / 1000);
}

export function playCorrectSound() {
  playSound(900, 150, "sine");
}

export function playWrongSound() {
  playSound(200, 300, "square");
}

export function playTimeUpSound() {
  playSound(120, 400, "sawtooth");
}

export function playGameEndSound() {
  playSound(600, 150);
  setTimeout(() => playSound(800, 150), 150);
  setTimeout(() => playSound(1000, 200), 300);
}