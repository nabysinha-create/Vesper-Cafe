"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Reveal from "./Reveal";

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

export default function Ritual() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);

  // Don't autoplay for users who've asked for reduced motion.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setPaused(true);
  }, []);

  useEffect(() => {
    if (paused || hovering) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % STAGES.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [paused, hovering]);

  return (
    <section id="ritual" className="bg-near-black py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <Reveal as="p" className="section-label text-gold">
          From Bean to Table
        </Reveal>
        <Reveal delay={1}>
          <h2 className="mt-5 max-w-2xl text-balance font-serif text-[2.5rem] font-medium leading-[1.05] text-ivory sm:text-[3.4rem]">
            The Ritual Behind the Cup.
          </h2>
        </Reveal>

        {/* Progress line + stage tabs, driven by the autoplay timer below */}
        <Reveal delay={2} className="mt-12 md:mt-14">
          <div className="flex items-center gap-5">
            <div className="relative h-px flex-1 bg-cream/15">
              <div
                className="absolute left-0 top-0 h-px bg-gold transition-[width] duration-700 ease-vesper"
                style={{ width: `${((index + 1) / STAGES.length) * 100}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play stage slideshow" : "Pause stage slideshow"}
              className="section-label shrink-0 text-cream/50 transition-colors hover:text-gold"
            >
              {paused ? "Play" : "Pause"}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {STAGES.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index}
                className={`section-label text-left transition-colors ${
                  i === index ? "text-gold" : "text-cream/40 hover:text-cream/70"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      <div
        className="relative mt-10 h-[64vh] min-h-[420px] w-full overflow-hidden md:mt-14 md:h-[78vh]"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {STAGES.map((stage, i) => (
          <div
            key={stage.label}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-vesper ${
              i === index ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
          >
            <Image
              src={stage.img}
              alt={stage.alt}
              fill
              sizes="100vw"
              className="object-cover"
              priority={i === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-near-black via-near-black/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-near-black/60 via-transparent to-transparent md:w-2/3" />

            <div className="relative z-10 flex h-full max-w-[1440px] flex-col justify-end px-6 pb-14 md:mx-auto md:px-10 md:pb-20">
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
      </div>
    </section>
  );
}
