let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function beep(freq: number, duration: number, gain = 0.05, type: OscillatorType = "sine") {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0008, ac.currentTime + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export function tickMatch() {
  beep(520, 0.07, 0.04, "triangle");
  window.setTimeout(() => beep(780, 0.09, 0.045, "triangle"), 70);
}

export function tickIncoming() {
  beep(440, 0.05, 0.035, "sine");
}
