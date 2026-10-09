"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { scrollToY } from "./SmoothScroll";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const STAGES = [
  {
    label: "Source",
    copy: "Selected with attention to character and balance.",
    img: "/images/ritual-source.jpg",
    alt: "Placeholder — replace with Café Vesper sourcing photography: close-up coffee beans, texture-forward.",
  },
  {
    label: "Roast",
    copy: "Developed to reveal depth, sweetness and aroma.",
    img: "/images/ritual-roast.jpg",
    alt: "Placeholder — replace with Café Vesper roasting photography: roaster or roasting beans, warm tones.",
  },
  {
    label: "Brew",
    copy: "Prepared with precision, never rushed.",
    img: "/images/ritual-brew.jpg",
    alt: "Placeholder — replace with Café Vesper brewing photography: pour and steam, hands at work.",
  },
  {
    label: "Serve",
    copy: "Finished for the moment, not merely the cup.",
    img: "/images/ritual-serve.jpg",
    alt: "Placeholder — replace with Café Vesper serving photography: finished cup on ceramic, styled table.",
  },
];

const SLIDE_MS = 5000;
const STEPS = STAGES.length - 1;

/*
  Two modes:
  - Scroll mode (default): the stage pins full-screen and scrolling walks
    through the four stages; each new photo wipes up over the last.
  - Slideshow mode (reduced motion): the original crossfading slideshow,
    paused by default, driven by the tabs.
*/
export default function Ritual() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [scrollMode, setScrollMode] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setPaused(true);
    else setScrollMode(true);
  }, []);

  // Slideshow autoplay (reduced-motion mode only, and only if they press Play).
  useEffect(() => {
    if (scrollMode || paused || hovering) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % STAGES.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [scrollMode, paused, hovering]);

  useGSAP(
    () => {
      if (!scrollMode || !stageRef.current) return;
      const layers = gsap.utils.toArray<HTMLElement>("[data-stage]");
      const media = gsap.utils.toArray<HTMLElement>("[data-stage-media]");
      const text = gsap.utils.toArray<HTMLElement>("[data-stage-text]");
      let current = 0;

      // Decode the hidden stage photos up front so a wipe never opens onto a
      // blank frame while the browser is still decoding.
      media.forEach((m) => m.querySelector("img")?.decode().catch(() => {}));

      // One unit of timeline per stage change: a 0.7 wipe, then a short hold
      // so each stage can be read before the next arrives.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stageRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * STEPS * 0.95}`,
          pin: true,
          scrub: true,
          refreshPriority: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const next = Math.min(STEPS, Math.round(self.progress * STEPS));
            if (next !== current) {
              current = next;
              setIndex(next);
            }
          },
        },
      });
      triggerRef.current = tl.scrollTrigger ?? null;

      tl.fromTo("[data-stage-progress]", { scaleX: 1 / STAGES.length }, { scaleX: 1, duration: STEPS }, 0);

      for (let i = 1; i < STAGES.length; i++) {
        const at = i - 1 + 0.15;
        tl.fromTo(
          layers[i],
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power2.inOut" },
          at,
        )
          .fromTo(media[i], { scale: 1.25 }, { scale: 1, duration: 0.7, ease: "power1.out" }, at)
          // The outgoing photo sinks back as the new one rises over it.
          .to(media[i - 1], { yPercent: -6, opacity: 0.35, duration: 0.7 }, at)
          .fromTo(
            text[i],
            { y: 60, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out" },
            at + 0.3,
          );
      }

      // The pin adds scroll length above everything below it; re-measure.
      ScrollTrigger.refresh();
      return () => {
        triggerRef.current = null;
      };
    },
    { dependencies: [scrollMode], scope: stageRef },
  );

  function goTo(i: number) {
    const st = triggerRef.current;
    if (!st) {
      setIndex(i);
      return;
    }
    // Land inside the hold after stage i's wipe has finished.
    const t = i === 0 ? 0 : (i - 0.05) / STEPS;
    scrollToY(st.start + (st.end - st.start) * t);
  }

  return (
    <section id="ritual" className="bg-near-black pt-24 md:pt-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <Reveal as="p" className="section-label text-gold">
          From Bean to Table
        </Reveal>
        <h2
          data-split
          className="mt-5 max-w-2xl text-balance font-serif text-[2.5rem] font-medium leading-[1.05] text-ivory sm:text-[3.4rem]"
        >
          The Ritual Behind the Cup.
        </h2>
      </div>

      <div
        ref={stageRef}
        className={`relative mt-10 w-full overflow-hidden md:mt-14 ${
          scrollMode ? "h-[100svh] min-h-[520px]" : "h-[64vh] min-h-[420px] md:h-[78vh]"
        }`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {STAGES.map((stage, i) => (
          <div
            key={stage.label}
            data-stage
            aria-hidden={i !== index}
            style={{ zIndex: scrollMode ? i : undefined }}
            className={`absolute inset-0 overflow-hidden ${
              scrollMode
                ? "bg-near-black"
                : `transition-opacity duration-[1400ms] ease-vesper ${
                    i === index ? "z-10 opacity-100" : "z-0 opacity-0"
                  }`
            }`}
          >
            <div data-stage-media className="absolute inset-x-0 -inset-y-[7%]">
              <Image
                src={stage.img}
                alt={stage.alt}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-near-black via-near-black/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-near-black/60 via-transparent to-transparent md:w-2/3" />

            <div
              data-stage-text
              className="relative z-10 flex h-full max-w-[1440px] flex-col justify-end px-6 pb-14 md:mx-auto md:px-10 md:pb-20"
            >
              <span className="section-label text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-serif text-[3rem] font-medium italic text-ivory sm:text-[4.5rem] md:text-[5.5rem]">
                {stage.label}
              </h3>
              <p className="mt-4 max-w-sm text-balance font-light text-cream/80 md:text-lg">
                {stage.copy}
              </p>
            </div>
          </div>
        ))}

        {/* Keeps the tabs legible over the brighter photos */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-56 bg-gradient-to-b from-near-black/75 to-transparent" />

        {/* Progress line + stage tabs, overlaid so they stay in view while pinned */}
        <div
          className={`absolute inset-x-0 z-20 mx-auto max-w-[1440px] px-6 md:px-10 ${
            scrollMode ? "top-[calc(var(--nav-h)+1.5rem)]" : "top-6 md:top-8"
          }`}
        >
          <div className="flex items-center gap-5">
            <div className="relative h-px flex-1 bg-cream/20">
              <div
                data-stage-progress
                className={`absolute inset-0 h-px origin-left bg-gold ${
                  scrollMode ? "" : "transition-transform duration-700 ease-vesper"
                }`}
                style={scrollMode ? undefined : { transform: `scaleX(${(index + 1) / STAGES.length})` }}
              />
            </div>
            {!scrollMode && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Play stage slideshow" : "Pause stage slideshow"}
                className="section-label shrink-0 text-cream/60 transition-colors hover:text-gold"
              >
                {paused ? "Play" : "Pause"}
              </button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {STAGES.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === index}
                className={`section-label text-left transition-colors duration-500 ${
                  i === index ? "text-gold" : "text-cream/50 hover:text-cream/80"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
