"use client";

import { useEffect, useRef, useState } from "react";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicOn, setMusicOn] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const video = videoRef.current;
    if (mq.matches && video) {
      video.pause();
    }
    if (audioRef.current) {
      audioRef.current.volume = 0.45;
    }
  }, []);

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) {
      audio.pause();
      setMusicOn(false);
    } else {
      // Browsers require a user gesture for audio-with-sound playback —
      // this only ever runs from the click handler below, so it's allowed.
      audio.play().catch(() => {});
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
        <source src="/video/vesper-hero.mp4" type="video/mp4" />
      </video>

      {/* Ambient score for the hero, off by default — browsers require a
          user gesture before audio can play with sound, and staying silent
          until asked is the more respectful default anyway. */}
      <audio ref={audioRef} loop preload="none" aria-hidden="true">
        <source src="/audio/hero-ambience.mp3" type="audio/mpeg" />
      </audio>

      {/* Rich espresso gradient overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-near-black via-near-black/45 to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

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
