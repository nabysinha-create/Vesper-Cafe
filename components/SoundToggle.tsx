"use client";

import { sound, useSoundEnabled } from "@/lib/sound";

/** The page-wide music on/off button. Every film's button controls the same switch. */
export default function SoundToggle({ className = "" }: { className?: string }) {
  const on = useSoundEnabled();

  return (
    <button
      type="button"
      onClick={() => sound.toggle()}
      // Keep the button's own press from also triggering the first-click auto-start.
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      aria-pressed={on}
      aria-label={on ? "Mute background music" : "Play background music"}
      className={`flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 text-cream/80 transition-colors duration-500 hover:border-gold hover:text-gold ${className}`}
    >
      {on ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
          <path
            d="M16.5 8.5a5 5 0 0 1 0 7M19 6a9 9 0 0 1 0 12"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
          <path d="M15.5 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
