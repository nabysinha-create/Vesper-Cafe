"use client";

import { useEffect, useRef } from "react";
import { sound, useSoundtrack } from "@/lib/sound";

/*
  The café ambience film for "A Place Worth Staying In". It only plays while
  on screen (saving data and battery), and while at least half of it is in
  view it takes over the page's music: the hero soundtrack fades out and the
  café's own soundtrack fades in, then hands back as you scroll on.
*/
export default function AmbienceFilm() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useSoundtrack("ambience", videoRef, 0.8);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          sound.release("ambience");
          return;
        }
        // Reduced motion: stay on the still frame unless sound is switched on.
        if (!reduceMotion) video.play().catch(() => {});
        if (entry.intersectionRatio >= 0.5) sound.claim("ambience");
        else sound.release("ambience");
      },
      { threshold: [0, 0.5] },
    );
    io.observe(video);
    return () => {
      io.disconnect();
      sound.release("ambience");
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/cafe-ambience-poster.jpg"
        aria-hidden="true"
      >
        <source src="/video/cafe-ambience-720.mp4" type="video/mp4" media="(max-width: 768px)" />
        <source src="/video/cafe-ambience-1080.mp4" type="video/mp4" />
      </video>
      <p className="sr-only">
        A film of Café Vesper: a guest reading by lamplight with a coffee and croissant, a laptop on a
        wooden table, and shelves of books under warm hanging lights.
      </p>
    </>
  );
}
