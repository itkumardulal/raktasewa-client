/** Lightweight Web Audio tones — no binary sound files required. */

let audioCtx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

/** Call once after a user gesture (e.g. login / first click) so browsers allow playback. */
export async function unlockNotificationAudio() {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      /* ignore */
    }
  }
}

function tone({ frequency, durationMs, type = "sine", gain = 0.08, startAt = 0 }) {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.value = 0.0001;
  osc.connect(g);
  g.connect(ctx.destination);

  const t0 = ctx.currentTime + startAt;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);

  osc.start(t0);
  osc.stop(t0 + durationMs / 1000 + 0.02);
}

/** Urgent-style alert for new blood requests */
export function playRequestAlertSound() {
  unlockNotificationAudio();
  tone({ frequency: 880, durationMs: 160, type: "square", gain: 0.06, startAt: 0 });
  tone({ frequency: 660, durationMs: 180, type: "square", gain: 0.05, startAt: 0.18 });
  tone({ frequency: 990, durationMs: 220, type: "square", gain: 0.06, startAt: 0.38 });
}

/** Soft happy chime for new donor applications */
export function playDonorHappySound() {
  unlockNotificationAudio();
  tone({ frequency: 523.25, durationMs: 140, type: "sine", gain: 0.07, startAt: 0 }); // C5
  tone({ frequency: 659.25, durationMs: 140, type: "sine", gain: 0.07, startAt: 0.12 }); // E5
  tone({ frequency: 783.99, durationMs: 220, type: "sine", gain: 0.08, startAt: 0.24 }); // G5
}
