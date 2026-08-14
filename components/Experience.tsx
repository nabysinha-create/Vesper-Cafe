"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Reveal from "./Reveal";

export default function Experience() {
  const imgWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!isDesktop || reduceMotion) return;

    const el = imgWrapRef.current;
    if (!el) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = (vh - rect.top) / (vh + rect.height);
        const offset = (progress - 0.5) * 60;
        el.style.transform = `translateY(${offset.toFixed(1)}px) scale(1.12)`;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="experience" className="relative bg-near-black py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <Reveal as="p" className="section-label text-gold">
          The Café
        </Reveal>
        <Reveal delay={1}>
          <h2 className="mt-5 max-w-2xl text-balance font-serif text-[2.5rem] font-medium leading-[1.05] text-ivory sm:text-[3.4rem]">
            A Place Worth Staying In.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-12 md:gap-5">
          <Reveal
            delay={2}
            className="relative overflow-hidden md:col-span-8"
          >
            <div className="relative h-[56vh] min-h-[400px] w-full overflow-hidden md:h-[80vh]">
              <div ref={imgWrapRef} className="absolute inset-0 will-change-transform">
                <Image
                  src="/images/experience-bookshop-main.jpg"
                  alt="Café Vesper's bookshop corner: warm timber shelving lined with books, hanging plants, brass pendant lights, and guests reading over coffee."
                  fill
                  sizes="(max-width: 768px) 100vw, 65vw"
                  className="object-cover"
                  loading="eager"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-near-black/70 via-near-black/10 to-transparent" />

              {/* Restrained dark-warm glass panel — the one deliberate use of glass on the page */}
              <div className="absolute inset-x-6 bottom-6 max-w-md rounded-sm border border-gold/25 bg-walnut/55 p-7 backdrop-blur-md sm:inset-x-auto sm:bottom-10 sm:left-10 sm:p-10">
                <p className="text-balance font-light leading-relaxed text-cream/90 md:text-lg">
                  Warm light. Good books. Fresh pastry. Quiet corners. Long
                  conversations.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={3} className="relative overflow-hidden md:col-span-4">
            <div className="relative h-[38vh] min-h-[280px] w-full overflow-hidden md:h-[80vh]">
              <Image
                src="/images/experience-cozy-corner.jpg"
                alt="A quiet reading corner at Café Vesper: linen cushions, a warm throw, string lights, and a latte with a fresh croissant on the table."
                fill
                sizes="(max-width: 768px) 100vw, 30vw"
                className="object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-near-black/40 via-transparent to-transparent" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
