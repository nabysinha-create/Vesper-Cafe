"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollToY } from "./SmoothScroll";

type Dish = {
  slug: string;
  name: string;
  note: string;
  ingredients: string[];
  /** Colours of the crumbs, herbs and spices that fall around this dish. */
  palette: string[];
  alt: string;
};

const DISHES: Dish[] = [
  {
    slug: "falafel-wrap",
    name: "Falafel Wrap",
    note: "Crisp falafel folded into warm flatbread.",
    ingredients: ["Falafel", "Lettuce", "Red onion", "Tahini", "Flatbread"],
    palette: ["#8a4b22", "#b8662f", "#6fa53a", "#c2477a", "#d9a35b"],
    alt: "Falafel wrap with lettuce, red onion and tahini, spices flying around it.",
  },
  {
    slug: "loaded-pizza",
    name: "Loaded Pizza",
    note: "Pulled from the oven, the cheese still stretching.",
    ingredients: ["Mozzarella", "Pepperoni", "Black olives", "Fresh herbs"],
    palette: ["#c8341f", "#f1c75b", "#1c1a17", "#4f8f2f", "#e9802c"],
    alt: "Two slices lifted from a loaded pizza with stretching mozzarella, pepperoni and olives.",
  },
  {
    slug: "pesto-fusilli",
    name: "Pesto Fusilli",
    note: "Tossed in basil pesto, finished with parmesan.",
    ingredients: ["Fusilli", "Basil pesto", "Parmesan", "Chilli flakes", "Cherry tomato"],
    palette: ["#f4ead3", "#4d7a2a", "#e8c26a", "#c2402b", "#ffffff"],
    alt: "A tower of fusilli coated in basil pesto, dusted with parmesan.",
  },
  {
    slug: "grilled-avocado-trio",
    name: "Grilled Avocado Trio",
    note: "Three grilled plates, one bright herb salsa.",
    ingredients: ["Avocado", "Grilled sweet potato", "Chimichurri", "Fresh herbs"],
    palette: ["#6b9b2f", "#a9c95a", "#d0702c", "#2f2a24", "#d63b2a"],
    alt: "Grilled sweet potato, sliced avocado and a charred grilled plate, topped with green herb salsa.",
  },
  {
    slug: "smash-burger",
    name: "Smash Burger",
    note: "Seared beef and melted cheddar, stacked high.",
    ingredients: ["Beef patty", "Cheddar", "Tomato", "Red onion", "Lettuce", "Sesame bun"],
    palette: ["#e9a23b", "#c4351f", "#6fae3a", "#f3e2bf", "#7a3f1d"],
    alt: "A smash burger with cheddar, tomato, red onion and lettuce, ingredients bursting around it.",
  },
  {
    slug: "street-corn",
    name: "Grilled Street Corn",
    note: "Charred over flame, showered with herbs.",
    ingredients: ["Sweet corn", "Butter", "Parsley", "Chilli"],
    palette: ["#f2b632", "#3f8a2c", "#2a1d12", "#d0402a", "#f6d77a"],
    alt: "Four cobs of flame-charred corn covered in chopped parsley and chilli.",
  },
  {
    slug: "jalapeno-cheese-rolls",
    name: "Jalapeño Cheese Rolls",
    note: "Golden rolls, molten cheese, a little heat.",
    ingredients: ["Mozzarella", "Cheddar", "Jalapeño", "Sweet corn", "Chilli flakes"],
    palette: ["#f3a028", "#f8ead0", "#4a8a2a", "#c9302a", "#f5cf54"],
    alt: "Golden baked cheese rolls with jalapeño slices, one pulled away with stretching cheese.",
  },
];

const N = DISHES.length;
const PARTICLES = 14;
const STEP_DEG = 360 / N;
// Timeline units: a short intro, then dish i is at the front at INTRO + i.
const INTRO = 0.6;
const front = (i: number) => INTRO + i;
const TOTAL = front(N - 1) + 0.5;

const src = (d: Dish) => `/images/menu/${d.slug}.jpg`;

/*
  "Signature Favourites" as a 3D carousel ring. All seven dishes stand around
  a circle that spans the screen; the stage pins and scrolling turns the ring,
  so each dish swings round to the front in turn while the others angle away
  into depth, dimmed. The dish at the front pops forward, its ingredients
  shower down around it, and its name and ingredients appear below.

  Reduced motion (and before hydration): a plain grid of the dishes.
*/
export default function MenuShowcase() {
  const [immersive, setImmersive] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    setImmersive(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Scatter for the falling ingredients: fixed once, so re-renders never move them.
  const particles = useMemo(
    () =>
      DISHES.map((d) =>
        Array.from({ length: PARTICLES }, (_, k) => ({
          x: -25 + Math.random() * 150, // % of card width
          y: 10 + Math.random() * 95, // % of card height
          size: 4 + Math.random() * 9,
          color: d.palette[k % d.palette.length],
          leaf: k % 4 === 1,
          rot: Math.random() * 360,
          fall: 0.5 + Math.random() * 0.5,
          delay: Math.random() * 0.3,
          mobile: k < 8,
        })),
      ),
    [],
  );

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!immersive || !stage) return;
      const q = (sel: string, root: ParentNode = stage) => gsap.utils.toArray<HTMLElement>(root.querySelectorAll(sel));
      const ring = stage.querySelector<HTMLElement>("[data-ring]")!;
      const cards = q("[data-card]");
      const shades = q("[data-card-shade]");

      const mm = gsap.matchMedia();
      mm.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" }, (context) => {
        const desktop = Boolean(context.conditions?.desktop);
        const SCREENS_PER_DISH = desktop ? 0.6 : 0.5;
        const vh = () => window.innerHeight;

        // Ring radius: wide enough that neighbouring cards sit side by side
        // with a little air between them.
        const radius = () => (cards[0].offsetWidth / 2 / Math.tan(Math.PI / N)) * (desktop ? 1.95 : 1.5);
        // Each card turns to its place round the circle, then steps out to the
        // rim (rotate first, then push out: the order matters). The ring sits
        // back by one radius so the front card is at normal size.
        const place = () => {
          const r = radius();
          cards.forEach((card, i) => {
            card.style.transform = `translate(-50%, -50%) rotateY(${i * STEP_DEG}deg) translateZ(${r}px)`;
          });
          gsap.set(ring, { z: -r });
        };
        place();

        // Cards turned away from the front are dimmed, so the eye stays on
        // the dish in front.
        const dim = () => {
          const rot = Number(gsap.getProperty(ring, "rotationY"));
          shades.forEach((shade, i) => {
            let a = (((i * STEP_DEG + rot) % 360) + 540) % 360 - 180;
            a = Math.abs(a);
            shade.style.opacity = String(Math.min(0.78, (a / 90) * 0.78));
          });
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: dim,
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${vh() * N * SCREENS_PER_DISH}`,
            pin: true,
            scrub: true,
            refreshPriority: 2,
            invalidateOnRefresh: true,
            onRefresh: place,
          },
        });
        triggerRef.current = tl.scrollTrigger ?? null;

        // Intro: the ring rises out of the dark and swings into place.
        tl.fromTo(ring, { autoAlpha: 0, y: () => vh() * 0.12, rotationY: 40 }, { autoAlpha: 1, y: 0, rotationY: 0, duration: INTRO, ease: "power2.out" }, 0)
          // Then scrolling turns the ring, one dish at a time.
          .to(ring, { rotationY: -(N - 1) * STEP_DEG, duration: N - 1, ease: "none" }, INTRO)
          .fromTo(q("[data-menu-progress]"), { scaleX: 1 / N }, { scaleX: 1, duration: N - 1 }, INTRO);

        cards.forEach((card, i) => {
          const c = front(i);
          const pop = card.querySelector("[data-card-pop]")!;
          const parts = q("[data-particle]", card);
          const caption = q("[data-dish-caption]")[i];

          // At the front, the dish lifts towards you and its ingredients shower down.
          tl.fromTo(pop, { z: 0, scale: 1 }, { z: desktop ? 110 : 60, scale: 1.04, duration: 0.3, ease: "power2.out" }, c - 0.32)
            .to(pop, { z: 0, scale: 1, duration: 0.3, ease: "power2.in" }, c + 0.32);
          parts.forEach((p) => {
            const data = particles[i][Number(p.dataset.particle)];
            tl.fromTo(
              p,
              { y: () => -vh() * data.fall, rotation: data.rot - 220, autoAlpha: 0 },
              { y: 0, rotation: data.rot, autoAlpha: 1, duration: 0.42, ease: "power2.in" },
              c - 0.45 + data.delay,
            );
          });
          tl.to(parts, { autoAlpha: 0, duration: 0.18 }, c + 0.3);

          // Its name rises out of a mask; the ingredients follow one by one.
          tl.fromTo(caption, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, c - 0.3)
            .fromTo(q("[data-dish-name]", caption), { yPercent: 110 }, { yPercent: 0, duration: 0.25, ease: "power2.out" }, c - 0.3)
            .fromTo(
              q("[data-ingredient]", caption),
              { y: 12, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.15, stagger: 0.03, ease: "power2.out" },
              c - 0.22,
            );
          if (i < N - 1) tl.to(caption, { autoAlpha: 0, y: -16, duration: 0.18 }, c + 0.32);
        });
        tl.to({}, { duration: 0.01 }, TOTAL - 0.01);
        dim();
      });

      // This pin adds scroll length above every later section; re-measure.
      ScrollTrigger.refresh();
      return () => {
        mm.revert();
        triggerRef.current = null;
      };
    },
    { dependencies: [immersive] },
  );

  function goTo(i: number) {
    const st = triggerRef.current;
    if (!st) return;
    scrollToY(st.start + (st.end - st.start) * (front(i) / TOTAL));
  }

  if (!immersive) {
    return (
      <ul className="mx-auto mt-16 grid max-w-[1440px] gap-x-8 gap-y-14 px-6 sm:grid-cols-2 md:mt-24 md:px-10 lg:grid-cols-3">
        {DISHES.map((d) => (
          <li key={d.slug}>
            <div className="relative aspect-[2/3] overflow-hidden bg-walnut">
              <Image src={src(d)} alt={d.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
            </div>
            <h3 className="mt-5 font-serif text-2xl text-ivory">{d.name}</h3>
            <p className="mt-1 text-sm font-light text-cream/65">{d.note}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-gold/80">{d.ingredients.join(", ")}</p>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      ref={stageRef}
      className="relative mt-14 h-[100svh] min-h-[600px] w-full overflow-hidden md:mt-20"
      style={{
        perspective: "1700px",
        perspectiveOrigin: "50% 40%",
        background:
          "radial-gradient(ellipse 60% 45% at 50% 42%, rgba(196,154,98,0.2), rgba(29,20,15,0) 72%), #1D140F",
      }}
    >
      {/* Soft fade at the top and bottom, so the room melts into the page */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-espresso to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-espresso via-espresso/70 to-transparent" />

      {/* The ring: every dish stands around it, facing outwards */}
      <div
        data-ring
        className="invisible absolute left-1/2 top-[40%] h-0 w-0 md:top-[44%]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {DISHES.map((d, i) => (
          <div
            key={d.slug}
            data-card
            role="button"
            tabIndex={0}
            aria-label={`Show ${d.name}`}
            onClick={() => goTo(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goTo(i);
              }
            }}
            className="absolute left-0 top-0 aspect-[2/3] w-[52vw] md:w-[min(25vw,390px,38vh)] cursor-pointer"
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          >
            <div data-card-pop className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
              <div
                className="absolute inset-0 overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)] [backface-visibility:hidden]"
                // A faint reflection on the floor beneath each dish.
                style={{ WebkitBoxReflect: "below 10px linear-gradient(transparent 80%, rgba(0,0,0,0.24))" } as React.CSSProperties}
              >
                <Image src={src(d)} alt={d.alt} fill sizes="(max-width: 768px) 58vw, 25vw" className="object-cover" />
                {/* Dims the dish as it turns away from the front */}
                <div data-card-shade className="absolute inset-0 bg-near-black" style={{ opacity: 0.78 }} />
              </div>
              {particles[i].map((p, k) => (
                <span
                  key={k}
                  data-particle={k}
                  aria-hidden="true"
                  className={`invisible absolute ${p.mobile ? "" : "hidden md:block"}`}
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: p.size * (p.leaf ? 1.6 : 1),
                    height: p.size,
                    background: p.color,
                    borderRadius: p.leaf ? "0 100% 0 100%" : "40%",
                    boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.35)",
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* The dish at the front: name, a line about it, and what goes into it */}
      <div className="pointer-events-none absolute inset-x-6 bottom-[4.5rem] z-20 h-32 text-center md:bottom-14 md:h-36">
        {DISHES.map((d, i) => (
          <div key={d.slug} data-dish-caption className="invisible absolute inset-x-0 bottom-0 flex flex-col items-center">
            <span className="section-label text-gold">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-2 overflow-hidden pb-1">
              <span data-dish-name className="block font-serif text-[1.9rem] italic leading-[1.1] text-ivory md:text-[2.8rem]">
                {d.name}
              </span>
            </p>
            <p className="mt-1 text-sm font-light text-cream/75 md:text-base">{d.note}</p>
            <ul className="mt-2 flex max-w-xl flex-wrap justify-center gap-x-3 gap-y-1">
              {d.ingredients.map((ing) => (
                <li key={ing} data-ingredient className="text-[0.68rem] uppercase tracking-[0.16em] text-gold/85">
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="absolute inset-x-6 top-[calc(var(--nav-h)+1rem)] z-20 h-px bg-cream/15 md:inset-x-10">
        <div data-menu-progress className="h-px origin-left scale-x-0 bg-gold" />
      </div>
    </div>
  );
}
