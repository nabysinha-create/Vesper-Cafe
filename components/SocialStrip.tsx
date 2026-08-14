import Image from "next/image";
import Reveal from "./Reveal";

const FRAMES = [
  { src: "/images/signature-espresso.jpg", alt: "Placeholder — espresso, close-up." },
  { src: "/images/bakery-main.jpg", alt: "Placeholder — pastry case display." },
  { src: "/images/cafe-experience.jpg", alt: "Placeholder — café interior." },
  { src: "/images/moment-evening.jpg", alt: "Placeholder — evening table setting." },
  { src: "/images/ritual-brew.jpg", alt: "Placeholder — coffee being brewed." },
  { src: "/images/bakery-2.jpg", alt: "Placeholder — cake slice." },
];

export default function SocialStrip() {
  const loop = [...FRAMES, ...FRAMES];

  return (
    <section className="bg-near-black py-20 md:py-28">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <Reveal as="p" className="section-label text-gold">
          @cafevesper
        </Reveal>
        <Reveal delay={1}>
          <h2 className="mt-4 font-serif text-2xl italic text-ivory sm:text-3xl">
            A glimpse of what&rsquo;s brewing.
          </h2>
        </Reveal>
      </div>

      <div className="mt-10 overflow-hidden md:mt-14">
        <div className="flex w-max animate-drift gap-4 motion-reduce:animate-none">
          {loop.map((frame, i) => (
            <div
              key={i}
              className="relative h-52 w-40 shrink-0 overflow-hidden sm:h-64 sm:w-48"
              aria-hidden={i >= FRAMES.length}
            >
              <Image
                src={frame.src}
                alt={frame.alt}
                fill
                sizes="200px"
                className="object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
