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
const STRIPS = 6;
const PARTICLES = 16;
// Timeline units: dish i is centred at 1 + 1.3i. Each dish builds over the
// 0.85 before its centre, holds, and has left before the next one lands.
const STEP = 1.3;
const centre = (i: number) => 1 + i * STEP;
const TOTAL = centre(N - 1) + 0.6;

const src = (d: Dish) => `/images/menu/${d.slug}.jpg`;

/*
  "Signature Favourites" as a scroll-driven 3D menu. The stage pins and each
  dish takes its turn: the card rises from depth, the photo builds itself from
  slices that drop in from above (bottom first, like layers being stacked),
  crumbs, herbs and spices in the dish's own colours fall around it, and its
  name and ingredients rise in. Then it tips away as the next dish arrives.

  Reduced motion (and before hydration): a plain grid of the dishes.
*/
export default function MenuShowcase() {
  const [immersive, setImmersive] = useState(false);
  const [active, setActive] = useState(0);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    setImmersive(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Scatter for the falling crumbs: fixed once, so re-renders never move them.
  const particles = useMemo(
    () =>
      DISHES.map((d) =>
        Array.from({ length: PARTICLES }, (_, k) => ({
          x: -18 + Math.random() * 136, // % of card width
          y: 62 + Math.random() * 52, // % of card height (around the bottom and the table)
          size: 4 + Math.random() * 10,
          color: d.palette[k % d.palette.length],
          leaf: k % 4 === 1, // some herb-leaf shapes
          rot: Math.random() * 360,
          fall: 0.6 + Math.random() * 0.6,
          delay: Math.random() * 0.35,
          mobile: k < 9,
        })),
      ),
    [],
  );

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!immersive || !stage) return;
      const q = (sel: string, root: ParentNode = stage) => gsap.utils.toArray<HTMLElement>(root.querySelectorAll(sel));
      let current = 0;

      const mm = gsap.matchMedia();
      mm.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" }, (context) => {
        const desktop = Boolean(context.conditions?.desktop);
        const SCREENS_PER_DISH = desktop ? 0.75 : 0.6;
        const vh = () => window.innerHeight;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${vh() * N * SCREENS_PER_DISH}`,
            pin: true,
            scrub: true,
            refreshPriority: 2,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const t = self.progress * TOTAL;
              const next = Math.max(0, Math.min(N - 1, Math.round((t - 1) / STEP)));
              if (next !== current) {
                current = next;
                setActive(next);
              }
            },
          },
        });
        triggerRef.current = tl.scrollTrigger ?? null;

        tl.fromTo(q("[data-menu-progress]"), { scaleX: 1 / N }, { scaleX: 1, duration: centre(N - 1) - 1 }, 1);

        q("[data-dish]").forEach((dish, i) => {
          const c = centre(i);
          const side = i % 2 === 0 ? 1 : -1;
          const strips = q("[data-strip]", dish).reverse(); // bottom slice lands first
          const parts = q("[data-particle]", dish);
          const caption = q("[data-dish-caption]")[i];
          gsap.set(dish, { xPercent: -50, yPercent: -50, zIndex: i + 1 });

          // The card rises out of the dark, angled, and squares up to face you.
          tl.fromTo(
            dish,
            { z: -520, y: () => vh() * 0.16, rotateX: 24, rotateY: 16 * side, autoAlpha: 0 },
            { z: 0, y: 0, rotateX: 0, rotateY: 0, autoAlpha: 1, duration: 0.6, ease: "power2.out" },
            c - 1,
          );

          // The dish builds itself: each slice drops in from above, with a
          // little tumble, and the layers stack from the plate upwards.
          strips.forEach((s, j) => {
            const tilt = (j % 2 ? -1 : 1) * (4 + ((j * 37) % 7));
            tl.fromTo(
              s,
              { y: () => -(vh() * 0.85 + j * 30), x: tilt * 4, rotation: tilt, autoAlpha: 0 },
              { y: 0, x: 0, rotation: 0, autoAlpha: 1, duration: 0.38, ease: "power3.in" },
              c - 0.85 + j * 0.06,
            );
          });
          // Once every layer has landed, a seamless photo settles over the slices.
          tl.fromTo(q("[data-dish-base]", dish), { opacity: 0 }, { opacity: 1, duration: 0.06 }, c - 0.15);
          tl.fromTo(q("[data-dish-shadow]", dish), { opacity: 0, scaleX: 0.5 }, { opacity: 1, scaleX: 1, duration: 0.3 }, c - 0.3)
            .fromTo(q("[data-dish-depth]", dish), { opacity: 0 }, { opacity: 1, duration: 0.3 }, c - 0.3);

          // Crumbs, herbs and spices shower down around it, then clear.
          parts.forEach((p) => {
            const data = particles[i][Number(p.dataset.particle)];
            tl.fromTo(
              p,
              { y: () => -vh() * data.fall, rotation: data.rot - 240, autoAlpha: 0 },
              { y: 0, rotation: data.rot, autoAlpha: 1, duration: 0.5, ease: "power2.in" },
              c - 0.9 + data.delay,
            );
          });
          tl.to(parts, { autoAlpha: 0, duration: 0.2 }, c + 0.3);

          // Its name rises out of a mask; the ingredients follow one by one.
          tl.fromTo(caption, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, c - 0.32)
            .fromTo(q("[data-dish-name]", caption), { yPercent: 110 }, { yPercent: 0, duration: 0.3, ease: "power2.out" }, c - 0.32)
            .fromTo(
              q("[data-ingredient]", caption),
              { y: 14, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.18, stagger: 0.04, ease: "power2.out" },
              c - 0.3,
            );

          if (i < N - 1) {
            // Then it tips back and away as the next dish comes up.
            tl.to(
              dish,
              { z: -620, y: () => -vh() * 0.2, rotateX: -22, autoAlpha: 0, duration: 0.5, ease: "power2.in" },
              c + 0.4,
            ).to(caption, { autoAlpha: 0, y: -20, duration: 0.25 }, c + 0.4);
          }
        });
        tl.to({}, { duration: 0.01 }, TOTAL - 0.01);
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
    scrollToY(st.start + (st.end - st.start) * (centre(i) / TOTAL));
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
      className="relative mt-14 h-[100svh] min-h-[560px] w-full overflow-hidden md:mt-20"
      style={{
        perspective: "1300px",
        background:
          "radial-gradient(ellipse 55% 50% at 50% 52%, rgba(196,154,98,0.18), rgba(29,20,15,0) 70%), #1D140F",
      }}
    >
      {DISHES.map((d, i) => (
        <div
          key={d.slug}
          data-dish
          className="invisible absolute left-1/2 top-[44%] aspect-[2/3] h-[42svh] md:top-1/2 md:h-[70vh] md:max-h-[680px]"
        >
          {/* Soft shadow on the table under the card */}
          <div
            data-dish-shadow
            className="absolute -bottom-10 left-1/2 h-10 w-[90%] -translate-x-1/2 rounded-[50%] bg-black/60 opacity-0 blur-xl"
          />
          {/* Depth shadow, shown only once the dish has landed */}
          <div data-dish-depth className="absolute inset-0 opacity-0 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9)]" />
          <div className="absolute inset-0">
            {Array.from({ length: STRIPS }, (_, k) => (
              <div
                key={k}
                data-strip
                className="absolute inset-x-0 bg-walnut"
                style={{
                  top: `${(k * 100) / STRIPS}%`,
                  height: `${100 / STRIPS}%`,
                  backgroundImage: `url(${src(d)})`,
                  backgroundSize: `100% ${STRIPS * 100}%`,
                  backgroundPosition: `0 ${(k / (STRIPS - 1)) * 100}%`,
                }}
              />
            ))}
            <Image
              data-dish-base
              src={src(d)}
              alt={d.alt}
              fill
              sizes="(max-width: 768px) 60vw, 32vw"
              className="object-cover opacity-0"
            />
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
      ))}

      {/* The dish in view: name, a line about it, and what goes into it */}
      <div className="pointer-events-none absolute inset-x-6 bottom-20 z-20 h-36 md:inset-x-auto md:bottom-auto md:left-10 md:top-1/2 md:h-56 md:w-[25vw] md:-translate-y-1/2">
        {DISHES.map((d, i) => (
          <div key={d.slug} data-dish-caption className="invisible absolute inset-x-0 bottom-0 md:bottom-auto md:top-0">
            <span className="section-label text-gold">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-2 overflow-hidden pb-1">
              <span data-dish-name className="block font-serif text-[2rem] italic leading-[1.1] text-ivory md:text-[3rem]">
                {d.name}
              </span>
            </p>
            <p className="mt-2 max-w-[28ch] text-sm font-light text-cream/75 md:text-base">{d.note}</p>
            <ul className="mt-3 flex max-w-[30ch] flex-wrap gap-x-3 gap-y-1">
              {d.ingredients.map((ing) => (
                <li key={ing} data-ingredient className="text-[0.7rem] uppercase tracking-[0.16em] text-gold/85">
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Menu index: where you are, and a way to jump to any dish */}
      <nav aria-label="Signature dishes" className="absolute right-10 top-1/2 z-20 hidden -translate-y-1/2 md:block">
        <ol className="space-y-3 text-right">
          {DISHES.map((d, i) => (
            <li key={d.slug}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === active}
                className={`section-label transition-colors duration-500 ${
                  i === active ? "text-gold" : "text-cream/40 hover:text-cream/75"
                }`}
              >
                {d.name}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="absolute inset-x-6 top-[calc(var(--nav-h)+1rem)] z-20 h-px bg-cream/15 md:inset-x-10 md:bottom-10 md:top-auto">
        <div data-menu-progress className="h-px origin-left scale-x-0 bg-gold" />
      </div>
    </div>
  );
}
