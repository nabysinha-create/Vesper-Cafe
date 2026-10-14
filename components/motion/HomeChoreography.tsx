"use client";

import { gsap, SplitText, useGSAP } from "@/lib/gsap";

/*
  Scroll choreography for the homepage. Sections opt in with data attributes,
  so they can stay server components:

    data-hero / -media / -content / -dim   hero holds while the next section slides over it
    data-split          headline lines rise out of a mask as they enter
    data-words          paragraph brightens word by word as it is read
    data-clip="up|left|right"   image wipes open; a [data-clip-inner] child settles from 1.25x
    data-clip-delay     seconds to wait before that wipe (for staggered groups)
    data-parallax="8"   drifts by Â±N% of its own height while its parent crosses the screen
    data-speed="80"     desktop only: moves N px faster than the page (offset columns)
    data-expand         image grows from an inset frame to full bleed while scrolled
    data-settle         panel scales up into place while scrolled
    data-rise           fades up; reverses when scrolled back (optional value = delay in seconds)
    data-wordmark       footer wordmark letters rise as the page ends

  Everything lives inside a reduced-motion media query, so visitors who ask
  for less motion get the static page (plus the CSS fades in Reveal).
*/

const CLIP_FROM = {
  up: "inset(100% 0% 0% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
} as const;
const CLIP_OPEN = "inset(0% 0% 0% 0%)";

const all = <T extends HTMLElement = HTMLElement>(selector: string) =>
  gsap.utils.toArray<T>(selector);

export default function HomeChoreography() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 768px)",
      },
      (context) => {
        const { motion, desktop } = context.conditions as Record<string, boolean>;
        if (!motion) return;

        // Hero: the film holds in place, slowly pushes in and dims, while the
        // ivory Philosophy section slides up over it like a curtain.
        const hero = document.querySelector<HTMLElement>("[data-hero]");
        if (hero) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom top",
                pin: true,
                pinSpacing: false,
                scrub: true,
                refreshPriority: 4,
              },
            })
            .to("[data-hero-media]", { scale: 1.12, ease: "none" }, 0)
            .to("[data-hero-content]", { yPercent: -16, autoAlpha: 0, ease: "none", duration: 0.55 }, 0)
            .to("[data-hero-dim]", { opacity: 0.7, ease: "none" }, 0);
        }

        // Headlines: each line rises out of its own mask.
        all("[data-split]").forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 115,
                duration: 1.3,
                ease: "expo.out",
                stagger: 0.1,
                scrollTrigger: { trigger: el, start: "top 86%", toggleActions: "play none none reverse" },
              }),
          });
        });

        // Manifesto paragraphs: words brighten in reading order, tied to scroll.
        all("[data-words]").forEach((el) => {
          SplitText.create(el, {
            type: "words",
            autoSplit: true,
            onSplit: (self) =>
              gsap.fromTo(
                self.words,
                { opacity: 0.16 },
                {
                  opacity: 1,
                  ease: "none",
                  stagger: 0.1,
                  scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 55%", scrub: true },
                },
              ),
          });
        });

        // Image wipes: the frame opens like a curtain while the photo inside
        // settles back from a slight zoom.
        all("[data-clip]").forEach((el) => {
          const dir = (el.dataset.clip as keyof typeof CLIP_FROM) || "up";
          const delay = Number(el.dataset.clipDelay ?? 0);
          const inner = el.querySelector("[data-clip-inner]");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
          });
          tl.fromTo(
            el,
            { clipPath: CLIP_FROM[dir] ?? CLIP_FROM.up },
            { clipPath: CLIP_OPEN, duration: 1.5, ease: "power4.inOut" },
            delay,
          );
          if (inner) {
            tl.fromTo(inner, { scale: 1.25 }, { scale: 1, duration: 2.1, ease: "expo.out" }, delay + 0.1);
          }
        });

        // Parallax drift inside a clipped frame (the wrapper is oversized in CSS).
        all("[data-parallax]").forEach((el) => {
          // Some frames must stay exact on phones (e.g. a film shown at its true shape).
          if (!desktop && el.hasAttribute("data-parallax-desktop")) return;
          const amount = Number(el.dataset.parallax || 8);
          gsap.fromTo(
            el,
            { yPercent: -amount },
            {
              yPercent: amount,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });

        // Offset columns travel a little faster than the page on desktop.
        if (desktop) {
          all("[data-speed]").forEach((el) => {
            gsap.fromTo(
              el,
              { y: 0 },
              {
                y: -Number(el.dataset.speed || 80),
                ease: "none",
                scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
              },
            );
          });
        }

        // Full-bleed reveal: an inset frame opens out to the image's edges.
        all("[data-expand]").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: desktop ? "inset(9% 7% 9% 7%)" : "inset(6% 5% 6% 5%)" },
            {
              clipPath: CLIP_OPEN,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 95%", end: "top 25%", scrub: true },
            },
          );
        });

        all("[data-settle]").forEach((el) => {
          gsap.fromTo(
            el,
            { scale: 0.93, opacity: 0.5 },
            {
              scale: 1,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "top 45%", scrub: true },
            },
          );
        });

        all("[data-rise]").forEach((el) => {
          gsap.from(el, {
            y: 36,
            autoAlpha: 0,
            duration: 1.2,
            ease: "expo.out",
            delay: Number(el.dataset.rise || 0),
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" },
          });
        });

        // Footer: the oversized wordmark assembles letter by letter as the page ends.
        all("[data-wordmark]").forEach((el) => {
          SplitText.create(el, {
            type: "chars",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.chars, {
                yPercent: 55,
                opacity: 0,
                ease: "power2.out",
                stagger: 0.05,
                scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true },
              }),
          });
        });
      },
    );

    return () => mm.revert();
  });

  return null;
}
