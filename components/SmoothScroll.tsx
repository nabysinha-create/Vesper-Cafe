"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// The running instance, so components can scroll through Lenis
// (a plain window.scrollTo would fight its smoothing).
let lenis: Lenis | null = null;

/** Smooth-scrolls to a page offset; falls back to native scrolling. */
export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.4 });
  else window.scrollTo({ top: y });
}

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * share one animation frame and never drift apart.
 *
 * Mounted by the homepage only. Skipped entirely for visitors who prefer
 * reduced motion.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({
      autoRaf: false, // GSAP's ticker drives it below
      lerp: 0.1,
      anchors: true, // smooth-scroll in-page links like #visit
    });
    lenis = instance;

    // Keep ScrollTrigger's positions in step with Lenis's scroll.
    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    // Don't let GSAP "catch up" after a dropped frame; it makes Lenis jump.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      lenis = null;
    };
  }, []);

  return <>{children}</>;
}
