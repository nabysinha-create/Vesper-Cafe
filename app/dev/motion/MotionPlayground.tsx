"use client";

import { useRef } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export default function MotionPlayground() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Pinned panel whose bar fills as you scroll: exercises pin + scrub.
      gsap.fromTo(
        "[data-bar]",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-pin]",
            start: "top top",
            end: "+=1200",
            pin: true,
            scrub: true,
            onUpdate: (self) => {
              scope.current?.setAttribute("data-progress", self.progress.toFixed(3));
            },
          },
        },
      );
      ScrollTrigger.refresh();
    },
    { scope },
  );

  return (
    <SmoothScroll>
      <div ref={scope} data-progress="0" className="bg-near-black text-cream">
        <section className="flex h-screen items-center justify-center">
          <p className="section-label">Scroll down · GSAP + ScrollTrigger + Lenis</p>
        </section>
        <section data-pin className="flex h-screen flex-col items-center justify-center gap-6">
          <p className="font-serif text-5xl">Pinned + scrubbed</p>
          <div className="h-1 w-2/3 bg-cream/15">
            <div data-bar className="h-full origin-left bg-gold" />
          </div>
        </section>
        <section className="flex h-screen items-center justify-center">
          <p className="section-label">End</p>
        </section>
      </div>
    </SmoothScroll>
  );
}
