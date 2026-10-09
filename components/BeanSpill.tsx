"use client";

import { useEffect, useRef } from "react";

/*
  A slow-motion pour of coffee beans, simulated on a canvas.

  Each bean falls under gravity at a slow-motion pace, tumbles in 3D (it turns
  its crease side, its edge and its rounded back to you) and sits on one of
  three depth layers: small soft-focus beans far behind, sharp beans in the
  middle, and large blurred beans falling past in front. In the "story"
  layout the middle beans land on a pile, bounce, and settle into it; beans
  behind the pile drop out of sight behind it.

  Scrolling adds a little depth parallax (near beans move with the page more
  than far ones). The pour only runs while on screen; with reduced motion it
  is drawn once, frozen mid-fall.
*/

type LayerName = "far" | "mid" | "near";
type Layer = {
  name: LayerName;
  len: number; // bean length on screen, px
  blur: number; // depth-of-field blur on screen, px
  speed: number; // fall speed multiplier
  alpha: number;
  count: number;
  parallax: number; // extra movement per px scrolled
};
type Config = {
  layers: Layer[];
  spawnX: (W: number) => number;
  spread: number; // sideways speed spread, fraction of width per second
  pile?: { cx: number; hw: number; h: number }; // fractions of width / height
};

const layer = (
  name: LayerName,
  len: number,
  blur: number,
  speed: number,
  alpha: number,
  count: number,
  parallax: number,
): Layer => ({ name, len, blur, speed, alpha, count, parallax });

// Roughly normal random number in [-1, 1].
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

const LAYOUTS: Record<"story" | "table", (mobile: boolean) => Config> = {
  // Beside "Good Coffee": a stream pouring onto a pile at the bottom right.
  story: (mobile) =>
    mobile
      ? {
          // Phones: the text fills the width, so only faint far-off beans at the edge.
          layers: [layer("far", 13, 1.2, 0.6, 0.5, 9, -0.15)],
          spawnX: (W) => W * (0.9 + gauss() * 0.05),
          spread: 0.02,
        }
      : {
          // Desktop: this area is the right-hand half of the section.
          layers: [
            layer("far", 15, 1.5, 0.62, 0.75, 14, -0.18),
            layer("mid", 28, 0, 1, 1, 26, 0),
            layer("near", 50, 3.4, 1.45, 0.92, 4, 0.35),
          ],
          spawnX: (W) => W * (0.6 + gauss() * 0.07),
          spread: 0.07,
          pile: { cx: 0.64, hw: 0.33, h: 0.3 },
        },
  // Around the gallery title: beans fall down both sides, keeping the title clear.
  table: (mobile) => ({
    layers: mobile
      ? [layer("far", 13, 1.2, 0.6, 0.6, 7, -0.15), layer("mid", 22, 0, 1, 1, 4, 0)]
      : [
          layer("far", 15, 1.5, 0.62, 0.75, 10, -0.18),
          layer("mid", 28, 0, 1, 1, 7, 0),
          layer("near", 48, 3.4, 1.45, 0.9, 2, 0.35),
        ],
    spawnX: (W) =>
      Math.random() < 0.5 ? W * (0.03 + Math.random() * 0.17) : W * (0.8 + Math.random() * 0.17),
    spread: 0.012,
  }),
};

/* ---------- Bean sprites: drawn once, reused every frame ---------- */

const SW = 64; // sprite size at render resolution
const SH = 92;

type SpriteSet = { front: HTMLCanvasElement; back: HTMLCanvasElement };
const spriteCache = new Map<number, SpriteSet>();

function beanPath(g: CanvasRenderingContext2D, rx: number, ry: number) {
  // Slightly lopsided, like a real bean rather than a perfect ellipse.
  g.beginPath();
  g.moveTo(0, -ry);
  g.bezierCurveTo(rx * 1.34, -ry * 0.97, rx * 1.3, ry * 0.96, 0, ry);
  g.bezierCurveTo(-rx * 1.3, ry * 0.98, -rx * 1.36, -ry * 0.95, 0, -ry);
  g.closePath();
}

function sheen(g: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  const s = g.createRadialGradient(x, y, 0, x, y, r);
  s.addColorStop(0, `rgba(255,236,214,${a})`);
  s.addColorStop(1, "rgba(255,236,214,0)");
  g.fillStyle = s;
  g.fillRect(x - r, y - r, r * 2, r * 2);
}

function paintBean(g: CanvasRenderingContext2D, face: "front" | "back") {
  const rx = SW / 2 - 1.5;
  const ry = SH / 2 - 1.5;

  // Roasted body, lit from the top left.
  beanPath(g, rx, ry);
  const body = g.createRadialGradient(-rx * 0.35, -ry * 0.38, rx * 0.08, 0, 0, ry * 1.08);
  body.addColorStop(0, face === "back" ? "#a06a42" : "#8c5a37");
  body.addColorStop(0.42, "#653a21");
  body.addColorStop(0.78, "#3c2112");
  body.addColorStop(1, "#211109");
  g.fillStyle = body;
  g.fill();

  g.save();
  g.clip();
  // Fine roast texture.
  for (let i = 0; i < 90; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.sqrt(Math.random());
    g.fillStyle = Math.random() < 0.5 ? "rgba(20,8,2,0.18)" : "rgba(210,150,100,0.07)";
    g.fillRect(Math.cos(a) * d * rx, Math.sin(a) * d * ry, 1.2, 1.2);
  }
  if (face === "front") {
    // The crease: a dark S-shaped groove with one lit edge.
    const crease = (ox: number) => {
      g.beginPath();
      g.moveTo(rx * 0.1 + ox, -ry * 0.9);
      g.bezierCurveTo(-rx * 0.5 + ox, -ry * 0.3, rx * 0.5 + ox, ry * 0.3, -rx * 0.08 + ox, ry * 0.9);
    };
    g.lineCap = "round";
    crease(rx * 0.1);
    g.strokeStyle = "rgba(205,140,85,0.32)";
    g.lineWidth = rx * 0.1;
    g.stroke();
    crease(0);
    g.strokeStyle = "rgba(18,7,2,0.95)";
    g.lineWidth = rx * 0.17;
    g.stroke();
    sheen(g, -rx * 0.45, -ry * 0.45, rx * 0.55, 0.22); // flat face: a soft, matte sheen
  } else {
    sheen(g, -rx * 0.38, -ry * 0.42, rx * 0.75, 0.42); // rounded back: glossier
    sheen(g, -rx * 0.3, -ry * 0.5, rx * 0.18, 0.55);
  }
  // Form shadow falling away to the bottom right.
  const shade = g.createLinearGradient(-rx, -ry, rx, ry);
  shade.addColorStop(0.45, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(10,4,1,0.45)");
  g.fillStyle = shade;
  g.fillRect(-rx, -ry, rx * 2, ry * 2);
  g.restore();

  beanPath(g, rx, ry);
  g.strokeStyle = "rgba(15,6,2,0.55)";
  g.lineWidth = 1.2;
  g.stroke();
}

function renderSprite(face: "front" | "back", blur: number) {
  const pad = Math.ceil(blur * 3) + 2;
  const sharp = document.createElement("canvas");
  sharp.width = SW + pad * 2;
  sharp.height = SH + pad * 2;
  const sg = sharp.getContext("2d")!;
  sg.translate(sharp.width / 2, sharp.height / 2);
  paintBean(sg, face);
  if (blur <= 0) return sharp;

  const soft = document.createElement("canvas");
  soft.width = sharp.width;
  soft.height = sharp.height;
  const g = soft.getContext("2d")!;
  // Canvas blur isn't available in every browser; those get sharp beans.
  if ("filter" in g) g.filter = `blur(${blur}px)`;
  g.drawImage(sharp, 0, 0);
  return soft;
}

function spritesFor(l: Layer): SpriteSet {
  // Blur is set on screen, so convert it to the sprite's own resolution.
  const blur = Math.round(((l.blur * SH) / l.len) * 10) / 10;
  let set = spriteCache.get(blur);
  if (!set) {
    set = { front: renderSprite("front", blur), back: renderSprite("back", blur) };
    spriteCache.set(blur, set);
  }
  return set;
}

/* ---------- Simulation ---------- */

type Bean = {
  l: Layer;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  flip: number; // 3D tumble angle around the bean's long axis
  flipV: number;
  size: number;
  bounces: number;
  fade: number; // -1 while falling, else seconds spent settling
};

const SETTLE_S = 0.7;

export default function BeanSpill({
  layout,
  className = "",
}: {
  layout: keyof typeof LAYOUTS;
  className?: string;
}) {
  // Three stacked layers: beans behind the pile, the pile itself (drawn once,
  // not every frame), and beans in front of it.
  const backRef = useRef<HTMLCanvasElement | null>(null);
  const pileRef = useRef<HTMLCanvasElement | null>(null);
  const frontRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = frontRef.current;
    const back = backRef.current?.getContext("2d");
    const pileCtx = pileRef.current?.getContext("2d");
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !back || !pileCtx) return;
    const canvases = [backRef.current!, pileRef.current!, canvas];

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cfg = LAYOUTS[layout](window.matchMedia("(max-width: 767px)").matches);
    const sets = new Map(cfg.layers.map((l) => [l, spritesFor(l)]));
    const midLayer = cfg.layers.find((l) => l.name === "mid");

    let W = 0;
    let H = 0;
    let dpr = 1;
    const beans: Bean[] = [];

    // Leave room under the floor for the pile's shadow to fade out.
    const floorY = () => H - 34;
    const pileCx = () => (cfg.pile ? cfg.pile.cx * W : 0);
    // The ground under a given x: the pile's mound, or the floor beside it.
    const ground = (x: number) => {
      if (!cfg.pile) return Infinity;
      const t = (x - pileCx()) / (cfg.pile.hw * W);
      return floorY() - cfg.pile.h * H * Math.max(0, 1 - t * t);
    };
    // Slow motion: gentle gravity and a low top speed, scaled to the area.
    const gravity = () => H * 0.5;
    const terminal = () => H * 0.38;

    function spawn(b: Bean, initial: boolean) {
      const l = b.l;
      b.size = l.len * (0.85 + Math.random() * 0.3);
      b.x = cfg.spawnX(W);
      b.vx = gauss() * W * cfg.spread;
      if (initial) {
        // Start mid-pour, so the stream is already flowing when it appears.
        b.y = -b.size + Math.random() * Math.min(H * 1.05, ground(b.x) - b.size);
        b.vy = terminal() * l.speed * (0.6 + Math.random() * 0.4);
      } else {
        b.y = -b.size - Math.random() * H * 0.25;
        b.vy = 20 + Math.random() * 60;
      }
      b.rot = Math.random() * Math.PI * 2;
      b.spin = (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 1.8);
      b.flip = Math.random() * Math.PI * 2;
      b.flipV = (Math.random() < 0.5 ? -1 : 1) * (1.2 + Math.random() * 2.8);
      b.bounces = 0;
      b.fade = -1;
    }

    function buildPile() {
      const g = pileCtx!;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      if (!cfg.pile || !midLayer) return;
      const cx = pileCx();
      const hw = cfg.pile.hw * W;
      const floor = floorY();

      // Soft shadow where the pile meets the table.
      g.save();
      g.translate(cx, floor);
      g.scale(1, 0.1);
      const sh = g.createRadialGradient(0, 0, 0, 0, 0, hw * 1.25);
      sh.addColorStop(0, "rgba(53,35,25,0.3)");
      sh.addColorStop(1, "rgba(53,35,25,0)");
      g.fillStyle = sh;
      g.fillRect(-hw * 1.3, -hw * 1.3, hw * 2.6, hw * 2.6);
      g.restore();

      const set = sets.get(midLayer)!;
      const len = midLayer.len;
      const area = (4 / 3) * hw * cfg.pile.h * H;
      const count = Math.max(40, Math.min(240, Math.round(area / (len * len * 0.22))));
      const items = Array.from({ length: count }, () => {
        const x = cx + Math.max(-0.97, Math.min(0.97, gauss())) * hw;
        const top = ground(x);
        const y = top + len * 0.2 + Math.pow(Math.random(), 1.5) * Math.max(0, floor - top - len * 0.45);
        return {
          x,
          y,
          rot: Math.PI / 2 + gauss() * 1.1, // mostly lying down
          squash: 0.62 + Math.random() * 0.38,
          back: Math.random() < 0.45,
          s: (len * (0.85 + Math.random() * 0.25)) / SH,
        };
      }).sort((a, b) => a.y - b.y); // back rows first, front rows over them

      for (const it of items) {
        // Contact shadow under each bean.
        g.save();
        g.translate(it.x, it.y + len * 0.18);
        g.scale(1, 0.35);
        g.fillStyle = "rgba(30,15,6,0.16)";
        g.beginPath();
        g.arc(0, 0, len * 0.5, 0, Math.PI * 2);
        g.fill();
        g.restore();

        const sprite = it.back ? set.back : set.front;
        g.save();
        g.translate(it.x, it.y);
        g.rotate(it.rot);
        g.scale(it.s * it.squash, it.s);
        g.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
        g.restore();
      }
    }

    function step(dt: number, scrolled: number) {
      const cx = pileCx();
      for (const b of beans) {
        const l = b.l;
        b.y -= scrolled * l.parallax;

        if (b.fade >= 0) {
          // Settling into the pile: a little slide, then it melts into the heap.
          b.fade += dt;
          b.x += b.vx * dt;
          b.vx *= 0.9;
          if (b.fade > SETTLE_S) spawn(b, false);
          continue;
        }

        b.vy = Math.min(b.vy + gravity() * l.speed * dt, terminal() * l.speed);
        b.vx *= 1 - 0.35 * dt; // air drag
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rot += b.spin * dt;
        b.flip += b.flipV * dt;

        if (l.name === "far" && b.y > ground(b.x)) {
          spawn(b, false); // dropped out of sight behind the pile
          continue;
        }
        if (l.name === "mid") {
          const rest = ground(b.x) - b.size * 0.3;
          if (b.y >= rest) {
            b.y = rest;
            if (b.bounces < 2 && b.vy > H * 0.06) {
              // Bounce, losing most of the energy, and roll a little downhill.
              b.vy = -b.vy * (0.22 + Math.random() * 0.12);
              b.vx += (b.x < cx ? -1 : 1) * (20 + Math.random() * 50);
              b.spin *= -0.6;
              b.flipV *= 0.35;
              b.bounces++;
            } else {
              b.vy = 0;
              b.spin *= 0.2;
              b.flipV = 0;
              b.fade = 0;
            }
          }
        }
        if (b.y > H + b.size * 2 || b.x < -120 || b.x > W + 120) spawn(b, false);
      }
    }

    function drawBean(g: CanvasRenderingContext2D, b: Bean) {
      const c = Math.cos(b.flip);
      const set = sets.get(b.l)!;
      const sprite = c >= 0 ? set.front : set.back;
      const s = b.size / SH;
      // Fade in just below the top edge, and out while settling.
      let a = b.l.alpha * Math.min(1, Math.max(0, (b.y + b.size) / (H * 0.12)));
      if (b.fade >= 0) a *= Math.max(0, 1 - b.fade / SETTLE_S);
      if (a <= 0.01) return;
      g.save();
      g.globalAlpha = a;
      g.translate(b.x, b.y);
      g.rotate(b.rot);
      // Seen edge-on a bean is about half as wide as face-on.
      g.scale(s * (0.5 + 0.5 * Math.abs(c)), s);
      g.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
      g.restore();
    }

    function draw() {
      for (const g of [back!, ctx!]) {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, W, H);
      }
      for (const name of ["far", "mid", "near"] as const) {
        const g = name === "far" ? back! : ctx!;
        for (const b of beans) if (b.l.name === name) drawBean(g, b);
      }
    }

    function resize() {
      // Layout size, unaffected by any scale animation on an ancestor.
      const nW = canvas!.offsetWidth;
      const nH = canvas!.offsetHeight;
      if (!nW || !nH) return;
      const kx = W ? nW / W : 1;
      const ky = H ? nH / H : 1;
      W = nW;
      H = nH;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      for (const c of canvases) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      for (const b of beans) {
        b.x *= kx;
        b.y *= ky;
      }
      buildPile();
      draw();
    }

    resize();
    for (const l of cfg.layers) {
      for (let i = 0; i < l.count; i++) {
        const b = { l } as Bean;
        spawn(b, true);
        beans.push(b);
      }
    }
    draw();

    let raf = 0;
    let running = false;
    let last = 0;
    let lastScroll = window.scrollY;
    const frame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const sy = window.scrollY;
      const scrolled = Math.max(-80, Math.min(80, sy - lastScroll));
      lastScroll = sy;
      step(dt, scrolled);
      draw();
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      lastScroll = window.scrollY;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only pour while on screen.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
    };
  }, [layout]);

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <canvas ref={backRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={pileRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={frontRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
