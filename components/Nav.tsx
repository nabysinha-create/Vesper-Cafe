"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const LINKS = [
  { label: "Menu", href: "#signature" },
  { label: "Our Story", href: "#philosophy" },
  { label: "The Café", href: "#experience" },
  { label: "Visit", href: "#visit" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open
          ? "bg-near-black/90 backdrop-blur-sm border-b border-gold/10"
          : "bg-gradient-to-b from-black/55 via-black/15 to-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 md:px-10 md:py-5">
        <a href="#top" className="flex items-center gap-3" aria-label="Café Vesper home">
          <Image
            src="/brand/vesper-logo.png"
            alt="Café Vesper"
            width={44}
            height={44}
            className="h-10 w-10 object-contain md:h-11 md:w-11"
            priority
          />
          <span className="hidden font-serif text-lg tracking-[0.12em] text-ivory sm:inline">
            CAFÉ VESPER
          </span>
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="underline-draw section-label text-cream/90 hover:text-gold transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#visit"
          className="hidden section-label rounded-full border border-gold/60 px-6 py-2.5 text-gold transition-colors hover:bg-gold hover:text-near-black md:inline-block"
        >
          Reserve a Table
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
        >
          <span
            className={`h-px w-6 bg-cream transition-transform duration-300 ${
              open ? "translate-y-[6.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-6 bg-cream transition-opacity duration-300 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-px w-6 bg-cream transition-transform duration-300 ${
              open ? "-translate-y-[6.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {open && (
        <div className="grain flex h-[calc(100vh-72px)] flex-col justify-between border-t border-gold/10 bg-near-black px-6 py-10 md:hidden">
          <ul className="flex flex-col gap-7">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-serif text-3xl text-ivory"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#visit"
            onClick={() => setOpen(false)}
            className="section-label w-full rounded-full border border-gold/60 px-6 py-4 text-center text-gold"
          >
            Reserve a Table
          </a>
        </div>
      )}
    </header>
  );
}
