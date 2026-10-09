"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * share one animation frame and never drift apart.
 *
 * Not mounted yet. To turn it on site-wide, wrap {children} in app/layout.tsx:
 *   <SmoothScroll>{children}</SmoothScroll>
 *
 * Skipped entirely for visitors who prefer reduced motion.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: false, // GSAP's ticker drives it below
      lerp: 0.1,
      anchors: true, // smooth-scroll in-page links like #visit
    });

    // Keep ScrollTrigger's positions in step with Lenis's scroll.
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // Don't let GSAP "catch up" after a dropped frame; it makes Lenis jump.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
