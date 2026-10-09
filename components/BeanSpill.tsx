"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/*
  Coffee beans that pour in from the top-right corner as their area scrolls
  into view, then settle into a loose spill. Scroll drives the pour, so it
  rewinds when scrolling back up. Nearer (larger) beans fall faster and drift
  more afterwards, for depth.

  Reduced motion: the beans are simply drawn where they would have landed.
*/

type Bean = { x: number; y: number; size: number; rot: number; spin: number; depth: number; mobile: boolean };
type Zone = { n: number; x: [number, number]; y: [number, number] };

// Small seeded random generator, so server and browser draw identical beans.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scatter(seed: number, zones: Zone[], onMobile: (b: { x: number; y: number }) => boolean): Bean[] {
  const r = seeded(seed);
  const between = (a: number, b: number) => a + (b - a) * r();
  const beans: Bean[] = [];
  for (const z of zones) {
    for (let i = 0; i < z.n; i++) {
      const depth = r();
      const x = +between(...z.x).toFixed(2);
      const y = +between(...z.y).toFixed(2);
      beans.push({
        x,
        y,
        depth,
        size: Math.round(16 + depth * 26),
        rot: Math.round(between(0, 360)),
        spin: Math.round(between(220, 560) * (r() < 0.5 ? -1 : 1)),
        mobile: onMobile({ x, y }),
      });
    }
  }
  // Far beans first, so nearer ones paint on top.
  return beans.sort((a, b) => a.depth - b.depth);
}

// Coordinates are percentages of the spill area.
const LAYOUTS = {
  // Beside the "Good Coffee" text: a trail down the right, a pile at the bottom right.
  story: scatter(
    11,
    [
      { n: 9, x: [66, 95], y: [6, 48] },
      { n: 13, x: [64, 97], y: [52, 92] },
      { n: 4, x: [54, 66], y: [80, 96] },
    ],
    ({ x, y }) => x > 82 && y < 30,
  ),
  // Around the "Moments Worth Savouring" title, keeping the middle band clear.
  table: scatter(
    29,
    [
      { n: 7, x: [62, 96], y: [4, 32] },
      { n: 12, x: [58, 97], y: [66, 96] },
      { n: 7, x: [3, 42], y: [70, 97] },
      { n: 4, x: [3, 26], y: [6, 26] },
    ],
    ({ y }) => y < 30 || y > 68,
  ),
};

const SPOUT: Record<keyof typeof LAYOUTS, [number, number]> = { story: [88, -12], table: [74, 6] };

const BEAN_PATH_CREASE = "M21 5 C 13 17, 27 37, 19 51";

export default function BeanSpill({
  layout,
  trigger,
  className = "",
}: {
  layout: keyof typeof LAYOUTS;
  /** CSS selector for the ancestor whose arrival drives the pour. */
  trigger: string;
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const beans = LAYOUTS[layout];
  const grad = `bean-body-${layout}`;

  useGSAP(
    () => {
      const box = boxRef.current;
      const host = box?.closest(trigger);
      if (!box || !host) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const W = () => box.offsetWidth;
        const H = () => box.offsetHeight;
        // Where the beans pour from, as a percentage of the area. The story spill
        // pours from above its top edge; the table spill (inside the clipped
        // gallery) pours from just inside its top, so no bean is cut off mid-fall.
        const [sx, sy] = SPOUT[layout];
        const ox = () => (W() * sx) / 100;
        const oy = () => (H() * sy) / 100;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: host, start: "top bottom", end: "top 12%", scrub: 0.8 },
        });

        const items = gsap.utils.toArray<HTMLElement>(box.querySelectorAll("[data-bean]"));
        // Pour order: beans landing nearest the spout land first.
        const order = beans
          .map((b, i) => ({ i, d: Math.hypot(sx - b.x, b.y - sy) }))
          .sort((a, b) => a.d - b.d);

        order.forEach(({ i }, k) => {
          const b = beans[i];
          const el = items[i];
          const at = k * 0.06;
          const fall = 1.1 - b.depth * 0.35; // nearer beans fall faster
          const dx = () => ox() - (W() * b.x) / 100;
          const dy = () => oy() - (H() * b.y) / 100;

          tl.fromTo(el, { x: dx, rotation: b.rot - b.spin }, { x: 0, rotation: b.rot, duration: fall, ease: "power1.out" }, at)
            // Gravity: slow at the spout, quick as it lands.
            .fromTo(el, { y: dy }, { y: 0, duration: fall, ease: "power2.in" }, at)
            .fromTo(el, { opacity: 0, scale: 0.7 }, { opacity: 0.6 + b.depth * 0.4, scale: 1, duration: 0.25 }, at);
        });

        // Once landed, nearer beans drift up a little faster than the page.
        gsap.utils.toArray<HTMLElement>(box.querySelectorAll("[data-bean-depth]")).forEach((el) => {
          gsap.to(el, {
            y: () => -Number(el.dataset.beanDepth) * 120,
            ease: "none",
            scrollTrigger: { trigger: host, start: "top top", end: "+=100%", scrub: true, invalidateOnRefresh: true },
          });
        });
      });

      return () => mm.revert();
    },
    { dependencies: [layout, trigger] },
  );

  return (
    <div ref={boxRef} aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <radialGradient id={grad} cx="36%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#7a5034" />
            <stop offset="55%" stopColor="#4a2e1c" />
            <stop offset="100%" stopColor="#22150c" />
          </radialGradient>
        </defs>
      </svg>

      {beans.map((b, i) => (
        <div
          key={i}
          data-bean-depth={b.depth.toFixed(3)}
          className={`absolute ${b.mobile ? "" : "hidden md:block"}`}
          style={{ left: `${b.x}%`, top: `${b.y}%` }}
        >
          <div
            data-bean
            style={{ transform: `rotate(${b.rot}deg)`, opacity: 0.6 + b.depth * 0.4 }}
            className="will-change-transform drop-shadow-[0_6px_5px_rgba(29,20,15,0.28)]"
          >
            <svg viewBox="0 0 40 56" width={b.size} height={Math.round(b.size * 1.4)}>
              <ellipse cx="20" cy="28" rx="17" ry="25" fill={`url(#${grad})`} />
              <path d={BEAN_PATH_CREASE} fill="none" stroke="#1b110b" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M22.6 7 C 15 18, 29 36, 21 49" fill="none" stroke="#c49a62" strokeOpacity="0.28" strokeWidth="1" />
              <ellipse cx="12" cy="17" rx="3.6" ry="8" fill="#f7f1e8" opacity="0.13" transform="rotate(-14 12 17)" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
