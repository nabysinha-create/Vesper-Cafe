"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import BeanSpill from "./BeanSpill";

const MOMENTS = [
  {
    src: "/images/philosophy-latte-heart.jpg",
    alt: "Heart latte art in a dark cup, cinnamon and coffee beans on a rustic wood table.",
    name: "Heart Latte",
    note: "Latte art, cinnamon and a scatter of beans.",
  },
  {
    src: "/images/philosophy-cinnamon-mocha.jpg",
    alt: "Dark mug of coffee dusted with cocoa, a cinnamon stick resting inside.",
    name: "Cinnamon Mocha",
    note: "Dusted with cocoa, stirred with cinnamon.",
  },
  {
    src: "/images/philosophy-spiced-mulled-wine.jpg",
    alt: "Spiced warm drink with apple slices and cranberries, steam rising.",
    name: "Spiced Mulled Wine",
    note: "Apple, cranberry and slow-rising steam.",
  },
  {
    src: "/images/philosophy-orange-cinnamon-cup.jpg",
    alt: "Warm spiced drink with an orange slice and cinnamon, candlelight in the background.",
    name: "Orange & Cinnamon",
    note: "Warm spice by candlelight.",
  },
  {
    src: "/images/philosophy-cherry-ember-coffee.jpg",
    alt: "Dark, dramatic cup of coffee with a cherry garnish and glowing embers.",
    name: "Cherry Ember",
    note: "Dark, dramatic, finished with a cherry.",
  },
  {
    src: "/images/philosophy-churro-cocoa.jpg",
    alt: "Hot chocolate topped with whipped cream and cinnamon, served with churros.",
    name: "Churro Hot Chocolate",
    note: "Whipped cream, cinnamon, churros on the side.",
  },
  {
    src: "/images/philosophy-iced-caramel-splash.jpg",
    alt: "Iced caramel coffee with a cream splash, cinnamon and star anise.",
    name: "Iced Caramel",
    note: "Caramel, cream, cinnamon and star anise.",
  },
  {
    src: "/images/philosophy-caramel-biscoff.jpg",
    alt: "Layered caramel dessert in a glass, topped with a biscuit crumble.",
    name: "Caramel Biscoff",
    note: "Layered caramel under a biscuit crumble.",
  },
  {
    src: "/images/philosophy-chocolate-drip.jpg",
    alt: "Mug dripping with chocolate and caramel, topped with nuts and chocolate chips.",
    name: "Chocolate Drip",
    note: "Chocolate, caramel and a crown of nuts.",
  },
  {
    src: "/images/philosophy-winter-sangria.jpg",
    alt: "Spiced sangria with orange slices and fresh herbs.",
    name: "Winter Sangria",
    note: "Orange, spice and fresh herbs.",
  },
];

const N = MOMENTS.length;
// Timeline units: the intro takes 0-1.5, moment i is centred at 1.5 + i,
// and the finale runs for 1.6 after the last one.
const centre = (i: number) => 1.5 + i;

/*
  "Moments Worth Savouring" as a pinned 3D room: the ivory page dims into a
  dark, spotlit space and each photo floats in from depth, comes forward to
  the centre with its name, then drifts past the camera as the next arrives.
  The last photo opens to full screen and hands over to the Menu.

  Reduced motion (and before hydration): a plain swipeable row.
*/
export default function PhilosophyGallery() {
  const [immersive, setImmersive] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setImmersive(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!immersive || !stage) return;
      const q = <T extends HTMLElement = HTMLElement>(sel: string) =>
        gsap.utils.toArray<T>(stage.querySelectorAll(sel));

      const mm = gsap.matchMedia();
      mm.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" }, (context) => {
        const desktop = Boolean(context.conditions?.desktop);
        // Phones get a shallower room: less depth, tilt and sideways travel.
        const DEPTH = desktop ? 1900 : 1100;
        const SPREAD = desktop ? 24 : 9; // vw
        const TILT = desktop ? 30 : 14; // deg
        const EXIT_Z = desktop ? 700 : 420;
        const SCREENS_PER_MOMENT = desktop ? 0.62 : 0.5;

        const panels = q("[data-moment]");
        const sheens = q("[data-moment-sheen]");
        const captions = q("[data-moment-caption]");
        const names = q("[data-moment-name]");
        const vw = () => window.innerWidth / 100;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${window.innerHeight * (N * SCREENS_PER_MOMENT + 1.4)}`,
            pin: true,
            scrub: true,
            refreshPriority: 3,
            invalidateOnRefresh: true,
          },
        });

        // Intro: the page dims and the title recedes into the room.
        tl.fromTo(q("[data-moments-room]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0)
          .to(q("[data-moments-ivory]"), { opacity: 0, duration: 1 }, 0)
          .fromTo(q("[data-moments-vignette]"), { opacity: 0 }, { opacity: 1, duration: 1 }, 0)
          .to(q("[data-moments-title]"), { z: -500, opacity: 0, duration: 1, ease: "power1.in" }, 0.15)
          .to(q("[data-moments-beans]"), { scale: 0.86, duration: 1, ease: "power1.in" }, 0.15)
          .fromTo(q("[data-moments-progress]"), { scaleX: 0 }, { scaleX: 1, duration: centre(N - 1) }, 0);

        panels.forEach((panel, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          const c = centre(i);
          // Earlier moments are always nearer the camera, so they paint on top.
          gsap.set(panel, { xPercent: -50, yPercent: -50, zIndex: N - i });

          // Arrive: from deep in the room, off to one side and turned away.
          tl.fromTo(
            panel,
            {
              x: () => side * SPREAD * vw(),
              z: -DEPTH,
              rotateY: -side * TILT,
              rotateX: 6,
              opacity: 0,
            },
            { x: 0, z: 0, rotateY: 0, rotateX: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            c - 1.5,
          );
          // Light catches the glass as it turns toward you, then settles.
          tl.fromTo(sheens[i], { opacity: 0.9 }, { opacity: 0, duration: 1.5 }, c - 1.5);

          // Its name rises out of a mask as it reaches the centre.
          tl.fromTo(captions[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, c - 0.35)
            .fromTo(names[i], { yPercent: 110 }, { yPercent: 0, duration: 0.4, ease: "power2.out" }, c - 0.35);

          if (i < N - 1) {
            // Leave: swing out to the side and past the camera. It stays solid
            // while it overlaps the next photo (no double exposure) and only
            // fades once it is nearly out of frame.
            tl.to(
              panel,
              {
                x: () => -side * SPREAD * 1.7 * vw(),
                z: EXIT_Z,
                rotateY: side * TILT * 0.6,
                duration: 0.9,
                ease: "power1.in",
              },
              c + 0.3,
            )
              .to(panel, { opacity: 0, duration: 0.25 }, c + 0.95)
              .to(captions[i], { autoAlpha: 0, y: -24, duration: 0.3, ease: "power1.in" }, c + 0.3);
          }
        });

        // Finale: the last moment opens to fill the screen and darkens into the Menu.
        const last = panels[N - 1];
        const at = centre(N - 1) + 0.35;
        tl.to(captions[N - 1], { autoAlpha: 0, y: -24, duration: 0.3 }, at)
          .to(
            last,
            {
              scale: () => Math.max(window.innerWidth / last.offsetWidth, window.innerHeight / last.offsetHeight) * 1.02,
              duration: 1.1,
              ease: "power2.inOut",
            },
            at,
          )
          .to(q("[data-moment-shade]"), { opacity: 0.85, duration: 0.6 }, at + 0.7)
          .to(q("[data-moments-progress-track]"), { autoAlpha: 0, duration: 0.3 }, at);
      });

      // This pin adds scroll length above every later section; re-measure.
      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { dependencies: [immersive] },
  );

  if (!immersive) {
    return (
      <div className="mt-20 md:mt-24">
        <p className="section-label mx-auto max-w-[1100px] px-6 text-bronze md:px-10">
          Moments Worth Savouring
        </p>
        <ul className="scrollbar-none mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 md:mt-14 md:gap-6 md:px-10">
          {MOMENTS.map((m, i) => (
            <li key={m.src} className="w-56 shrink-0 snap-start sm:w-64 md:w-80">
              <div className="relative h-72 overflow-hidden bg-cream sm:h-80 md:h-[26rem]">
                <Image
                  src={m.src}
                  alt={m.alt}
                  fill
                  sizes="(max-width: 640px) 224px, (max-width: 768px) 256px, 320px"
                  className="object-cover"
                  loading={i < 4 ? "eager" : "lazy"}
                />
              </div>
              <p className="mt-4 font-serif text-xl italic text-espresso">{m.name}</p>
            </li>
          ))}
        </ul>
        <div className="h-20 md:h-28" />
      </div>
    );
  }

  return (
    <div
      ref={stageRef}
      data-moments-stage
      // Ivory at its own edges, so no dark hairline can show where it meets the page.
      className="relative mt-16 h-[100svh] min-h-[560px] w-full overflow-hidden bg-ivory md:mt-24"
      style={{ perspective: "1100px" }}
    >
      {/* The dark room: a warm spotlight in the centre. Hidden until you step
          inside, so its edge never shows through the ivory as a hairline. */}
      <div
        data-moments-room
        className="invisible absolute -inset-px"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 48%, rgba(196,154,98,0.16), rgba(18,14,11,0) 70%), #120E0B",
        }}
      />

      {/* The ivory page, which dims away as you step inside */}
      <div data-moments-ivory className="absolute -inset-px bg-ivory">
        {/* More beans scattered around the title; they sink away with the light */}
        <div data-moments-beans className="absolute inset-0">
          <BeanSpill layout="table" className="inset-0" />
        </div>
      </div>

      <p
        data-moments-title
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center px-6 pb-2 text-center font-serif text-[3rem] italic leading-[1.1] text-espresso sm:text-[4.5rem] md:text-[6.5rem]"
      >
        Moments Worth Savouring
      </p>
      <h3 className="sr-only">Moments Worth Savouring</h3>

      {MOMENTS.map((m, i) => (
        <figure
          key={m.src}
          data-moment
          className="absolute left-1/2 top-[44%] m-0 aspect-[4/5] w-[66vw] max-w-[440px] overflow-hidden bg-walnut opacity-0 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)] will-change-transform md:top-1/2 md:w-[29vw]"
        >
          <Image
            src={m.src}
            alt={m.alt}
            fill
            // The last one opens to full screen, so it needs a full-width source.
            sizes={i === N - 1 ? "100vw" : "(max-width: 768px) 70vw, 32vw"}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-near-black/40 via-transparent to-transparent" />
          <div
            data-moment-sheen
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-cream/25 to-transparent opacity-0"
          />
          {i === N - 1 && <div data-moment-shade className="absolute inset-0 bg-espresso opacity-0" />}
        </figure>
      ))}

      {/* Soft vignette: keeps the eye in the centre of the room */}
      <div data-moments-vignette className="pointer-events-none absolute inset-0 z-20 opacity-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(18,14,11,0.6)_100%)]" />

      {/* Name of the moment in view */}
      <div className="pointer-events-none absolute inset-x-6 bottom-24 z-30 h-28 md:inset-x-auto md:bottom-auto md:left-10 md:top-1/2 md:h-40 md:w-[24vw] md:-translate-y-1/2">
        {MOMENTS.map((m, i) => (
          <div key={m.src} data-moment-caption className="invisible absolute inset-x-0 bottom-0 md:bottom-auto md:top-0">
            <span className="section-label text-gold">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-2 overflow-hidden pb-1">
              <span
                data-moment-name
                className="block font-serif text-[2.2rem] italic leading-[1.1] text-ivory md:text-[3.2rem]"
              >
                {m.name}
              </span>
            </p>
            <p className="mt-2 max-w-[26ch] text-sm font-light text-cream/70 md:text-base">{m.note}</p>
          </div>
        ))}
      </div>

      <div
        data-moments-progress-track
        className="absolute inset-x-6 top-[calc(var(--nav-h)+1rem)] z-30 h-px bg-cream/15 md:inset-x-10 md:bottom-10 md:top-auto"
      >
        <div data-moments-progress className="h-px origin-left scale-x-0 bg-gold" />
      </div>
    </div>
  );
}
