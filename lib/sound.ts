"use client";

import { useEffect, useSyncExternalStore, type RefObject } from "react";

/*
  One soundtrack at a time. Each film carries its own music; the hero film
  owns the sound by default, and another film can take it over while it is
  on screen, then hand it back. Visitors switch sound on or off once, for
  the whole page.
*/

const DEFAULT_OWNER = "hero";

type State = {
  enabled: boolean;
  owner: string;
  /** The visitor has used a sound button, so the first-click auto-start must not override them. */
  userChose: boolean;
};

let state: State = { enabled: false, owner: DEFAULT_OWNER, userChose: false };
const listeners = new Set<() => void>();

function update(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export const sound = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  get: () => state,
  /** Turn sound on automatically (first click), unless the visitor already chose. */
  autoStart() {
    if (!state.userChose && !state.enabled) update({ enabled: true });
  },
  /** The visitor pressed a sound button. */
  toggle() {
    update({ enabled: !state.enabled, userChose: true });
  },
  claim(id: string) {
    if (state.owner !== id) update({ owner: id });
  },
  release(id: string) {
    if (state.owner === id) update({ owner: DEFAULT_OWNER });
  },
};

export function useSoundEnabled() {
  return useSyncExternalStore(
    sound.subscribe,
    () => state.enabled,
    () => false,
  );
}

const FADE_MS = 700;

/**
 * Plays a video's own soundtrack whenever sound is on and this video owns it,
 * fading the volume in and out so hand-overs between films are smooth.
 */
export function useSoundtrack(id: string, ref: RefObject<HTMLVideoElement>, volume: number) {
  useEffect(() => {
    let raf = 0;

    const apply = () => {
      const video = ref.current;
      if (!video) return;
      const audible = state.enabled && state.owner === id;
      cancelAnimationFrame(raf);

      if (audible) {
        video.muted = false;
        if (video.paused) {
          video.play().catch(() => {
            // The browser refused playback with sound; keep the picture going.
            video.muted = true;
            video.play().catch(() => {});
          });
        }
      }

      // Volume is read-only on iOS; there the sound simply switches.
      const from = video.volume;
      const to = audible ? volume : 0;
      // Time from the first frame's own timestamp: a frame can be stamped
      // slightly before performance.now(), which would overshoot the fade.
      let start = -1;
      const step = (now: number) => {
        if (start < 0) start = now;
        const k = Math.min(1, Math.max(0, (now - start) / FADE_MS));
        video.volume = Math.min(1, Math.max(0, from + (to - from) * k));
        if (k < 1) raf = requestAnimationFrame(step);
        else if (!audible) video.muted = true;
      };
      raf = requestAnimationFrame(step);
    };

    apply();
    const unsubscribe = sound.subscribe(apply);
    return () => {
      unsubscribe();
      cancelAnimationFrame(raf);
    };
  }, [id, ref, volume]);
}
