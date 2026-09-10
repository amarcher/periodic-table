import type { EmitEvent } from './exploration';

/** Count visible playback and loop boundaries, including the browser's native loop seek. */
export class VideoPlaybackTracker {
  private previous: number | null = null;
  private loops = 0;
  private watched = 0;
  sample(time: number, duration: number, playing: boolean, seeking: boolean) {
    if (!playing || !Number.isFinite(duration) || duration <= 0) {
      this.previous = null;
      return false;
    }
    // Native HTML looping seeks back to zero. Preserve that boundary while
    // dropping ordinary seeks; there are no user seeking controls in this player.
    if (seeking && !(this.previous !== null && this.previous > duration * 0.75 &&
      time <= 0.05 && duration - this.previous + time <= 2)) {
      this.previous = null;
      return false;
    }
    let wrapped = false;
    if (this.previous !== null) {
      const delta = time - this.previous;
      if (delta >= 0 && delta <= 2) this.watched += delta;
      else if (this.previous > duration * 0.75 && time < duration * 0.25) {
        const wrapDelta = duration - this.previous + time;
        if (wrapDelta <= 2) { this.loops++; this.watched += wrapDelta; wrapped = true; }
      }
    }
    this.previous = time;
    return wrapped;
  }
  get loopCount() { return this.loops; }
  takeWatchedMs() { const ms = Math.round(this.watched * 1000); this.watched = 0; return ms; }
}

export class VoiceAttempt {
  private startedAt: number | null = null;
  private connectedAt: number | null = null;
  private emit: EmitEvent;
  private now: () => number;
  constructor(emit: EmitEvent, now = () => performance.now()) { this.emit = emit; this.now = now; }
  get active() { return this.startedAt !== null; }
  start() {
    if (this.active) return;
    this.startedAt = this.now();
    this.emit('voice_agent_activated');
  }
  connected() {
    if (!this.active || this.connectedAt !== null) return;
    this.connectedAt = this.now();
    this.emit('voice_connected', { connection_ms: Math.round(this.connectedAt - this.startedAt!) });
  }
  finish(reason: 'user' | 'remote' | 'page_exit' | 'microphone_denied' | 'microphone_timeout' | 'microphone_device' | 'connection_error') {
    if (!this.active) return;
    if (this.connectedAt !== null) {
      this.emit('voice_session_ended', { reason, duration_ms: Math.round(this.now() - this.connectedAt) });
    } else {
      this.emit(reason === 'user' || reason === 'page_exit' ? 'voice_cancelled' : 'voice_connection_failed', { reason });
    }
    this.startedAt = null;
    this.connectedAt = null;
  }
}

/** Stop late permission grants too, so a timeout cannot leave the microphone open. */
export async function checkMicrophone(getMedia: () => Promise<MediaStream>, timeoutMs = 5000) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const permission = getMedia().then(stream => { stream.getTracks().forEach(track => track.stop()); });
  try {
    await Promise.race([permission, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new DOMException('Microphone timed out', 'TimeoutError')), timeoutMs);
    })]);
  } finally { clearTimeout(timer); }
}
