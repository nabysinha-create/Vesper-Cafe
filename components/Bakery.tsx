import Image from "next/image";
import Reveal from "./Reveal";

export default function Bakery() {
  return (
    <section id="bakery" className="bg-ivory py-24 text-espresso md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <Reveal as="p" className="section-label text-bronze">
          From the Pastry Case
        </Reveal>
        <h2
          data-split
          className="mt-5 max-w-2xl text-balance font-serif text-[2.5rem] font-medium leading-[1.05] sm:text-[3.4rem]"
        >
          Something Sweet Is Waiting.
        </h2>

        {/* The three photos wipe open one after another, like a case being unveiled. */}
        <div className="mt-14 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-12 md:gap-6">
          <div
            data-clip="up"
            className="relative aspect-[4/5] overflow-hidden bg-cream md:col-span-7 md:row-span-2 md:aspect-auto"
          >
            <div data-clip-inner className="absolute inset-0">
              <div data-parallax="6" className="absolute inset-x-0 -inset-y-[8%]">
                <Image
                  src="/images/bakery-main.jpg"
                  alt="Placeholder — replace with Café Vesper bakery photography: pastry case display, croissants and cakes, warm light."
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div
            data-clip="right"
            data-clip-delay="0.25"
            className="relative aspect-[4/3] overflow-hidden bg-cream md:col-span-5"
          >
            <div data-clip-inner className="absolute inset-0">
              <Image
                src="/images/bakery-2.jpg"
                alt="Placeholder — replace with Café Vesper bakery photography: cake slice, close-up elegant plating."
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>

          <div
            data-clip="right"
            data-clip-delay="0.45"
            className="relative aspect-[4/3] overflow-hidden bg-cream md:col-span-5"
          >
            <div data-clip-inner className="absolute inset-0">
              <Image
                src="/images/bakery-3.jpg"
                alt="Placeholder — replace with Café Vesper bakery photography: assorted pastries and tarts, editorial styling."
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <Reveal delay={2}>
          <div className="mt-12 flex flex-col items-start gap-8 border-t border-espresso/10 pt-10 sm:flex-row sm:items-center sm:justify-between md:mt-16">
            <div className="flex items-center gap-6">
              <div className="relative hidden h-20 w-20 shrink-0 overflow-hidden rounded-full sm:block">
                <Image
                  src="/images/bakery-4.jpg"
                  alt="Placeholder — replace with Café Vesper bakery photography: baked goods on a wood table."
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <p className="max-w-md text-balance text-lg font-light leading-relaxed text-espresso/80">
                Freshly baked, beautifully displayed, and very difficult to
                walk past.
              </p>
            </div>
            <a
              href="#signature"
              className="underline-draw section-label shrink-0 text-bronze"
            >
              View Today&rsquo;s Selection
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
