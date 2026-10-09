"use client";

import { useEffect, useRef, useState } from "react";

// Only these count as a user gesture for unmuting; scroll and wheel do not,
// and unmuting without a gesture makes browsers pause the video.
const GESTURE_EVENTS = ["pointerdown", "keydown", "touchend"] as const;

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [musicOn, setMusicOn] = useState(false);
  // Set once the visitor uses the music button, so the auto-start never overrides them.
  const userChoseRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const video = videoRef.current;
    if (mq.matches && video) {
      video.pause();
    }
    if (video) {
      video.volume = 0.7;
    }
  }, []);

  // Browsers block autoplay with sound, so the music starts on the visitor's
  // first click, tap or key press anywhere on the page.
  useEffect(() => {
    const start = () => {
      const video = videoRef.current;
      if (video && !userChoseRef.current) {
        video.muted = false;
        video.play().catch(() => {});
        setMusicOn(true);
      }
      GESTURE_EVENTS.forEach((e) => window.removeEventListener(e, start));
    };
    GESTURE_EVENTS.forEach((e) => window.addEventListener(e, start, { once: true }));
    return () => GESTURE_EVENTS.forEach((e) => window.removeEventListener(e, start));
  }, []);

  function toggleMusic() {
    const video = videoRef.current;
    if (!video) return;
    userChoseRef.current = true;
    if (musicOn) {
      video.muted = true;
      setMusicOn(false);
    } else {
      // The soundtrack lives in the video itself, so it stays in sync.
      // Browsers only allow unmuting from a user gesture — this only ever
      // runs from the click handler below, so it's allowed.
      video.muted = false;
      video.play().catch(() => {});
      setMusicOn(true);
    }
  }

  return (
    <section
      id="top"
      className="relative flex h-[100svh] min-h-[560px] w-full items-end overflow-hidden bg-near-black"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/video/vesper-hero-720.mp4" type="video/mp4" media="(max-width: 768px)" />
        <source src="/video/vesper-hero-1080.mp4" type="video/mp4" />
      </video>

      {/* Shading only where text sits, so the video keeps its own light:
          a short fade under the nav, a fade into the next section at the
          bottom, and a left-side wash behind the headline. */}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-near-black/85 via-transparent via-35% to-transparent" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-black/60 via-black/15 via-45% to-transparent md:block" />
      {/* Phones: text spans the full width of the lower half, so shade that
          half instead and leave the top of the frame bright. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 via-50% to-black/5 md:hidden" />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-24 pt-[calc(var(--nav-h)+2rem)] sm:pb-28 md:px-10 md:pb-32">
        <p className="section-label mb-5 text-gold opacity-0 animate-fade-rise [animation-delay:200ms]">
          Café Vesper · Dubai
        </p>

        <h1 className="max-w-3xl font-serif text-[3.4rem] font-medium leading-[0.98] text-ivory opacity-0 animate-fade-rise [animation-delay:420ms] sm:text-[5rem] md:text-[6.5rem]">
          Stay
          <br />
          A Little
          <br />
          Longer.
        </h1>

        <p className="mt-7 max-w-md text-balance font-light text-cream/85 opacity-0 animate-fade-rise [animation-delay:680ms] sm:text-lg">
          Coffee, conversation, and beautifully unhurried moments.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4 opacity-0 animate-fade-rise [animation-delay:900ms]">
          <a
            href="#signature"
            className="section-label rounded-full bg-gold px-7 py-3.5 text-near-black transition-transform duration-500 ease-vesper hover:scale-[1.03] hover:bg-cream"
          >
            Explore the Menu
          </a>
          <a
            href="#visit"
            className="section-label rounded-full border border-cream/50 px-7 py-3.5 text-cream transition-colors duration-500 hover:border-gold hover:text-gold"
          >
            Reserve a Table
          </a>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 z-10 hidden justify-center opacity-0 animate-fade-in [animation-delay:1400ms] sm:flex">
        <div className="flex flex-col items-center gap-2 text-cream/60">
          <span className="section-label text-[0.62rem]">Scroll</span>
          <span className="relative h-10 w-px overflow-hidden bg-cream/25">
            <span className="absolute inset-x-0 top-0 h-4 w-px animate-[scrollline_2.2s_ease-in-out_infinite] bg-gold" />
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleMusic}
        // Keep the button's own press from also triggering the first-gesture handler.
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        aria-pressed={musicOn}
        aria-label={musicOn ? "Mute background music" : "Play background music"}
        className="group absolute bottom-6 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 text-cream/80 opacity-0 animate-fade-in [animation-delay:1400ms] transition-colors duration-500 hover:border-gold hover:text-gold sm:right-10 md:bottom-8"
      >
        {musicOn ? (
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
            <path
              d="M15.5 9.5l5 5m0-5l-5 5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      <style>{`
        @keyframes scrollline {
          0% { transform: translateY(-16px); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(40px); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
