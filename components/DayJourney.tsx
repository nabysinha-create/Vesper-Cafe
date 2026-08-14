import Image from "next/image";
import Reveal from "./Reveal";

const MOMENTS = [
  {
    time: "Morning",
    copy: "Espresso and pastry.",
    img: "/images/moment-morning.jpg",
    alt: "Placeholder — replace with Café Vesper morning photography: espresso and pastry in soft warm light.",
  },
  {
    time: "Midday",
    copy: "Slow coffee and something light.",
    img: "/images/moment-midday.jpg",
    alt: "Placeholder — replace with Café Vesper midday photography: slow coffee moment, warm light.",
  },
  {
    time: "Afternoon",
    copy: "Cake, conversation, and another cup.",
    img: "/images/moment-afternoon.jpg",
    alt: "Placeholder — replace with Café Vesper afternoon photography: cake and coffee, golden light.",
  },
  {
    time: "Evening",
    copy: "Dessert, specialty drinks, and unhurried tables.",
    img: "/images/moment-evening.jpg",
    alt: "Placeholder — replace with Café Vesper evening photography: dessert and specialty drink, dim candlelit ambience.",
  },
];

export default function DayJourney() {
  return (
    <section
      id="day"
      className="py-24 md:py-36"
      style={{
        background:
          "linear-gradient(to bottom, #352319 0%, #241811 32%, #1D140F 62%, #120E0B 100%)",
      }}
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <Reveal as="p" className="section-label text-gold">
          The Day, Unhurried
        </Reveal>
        <Reveal delay={1}>
          <h2 className="mt-5 max-w-2xl text-balance font-serif text-[2.5rem] font-medium leading-[1.05] text-ivory sm:text-[3.4rem]">
            From First Pour to Last Table.
          </h2>
        </Reveal>

        <div className="mt-16 flex flex-col gap-16 md:mt-24 md:gap-24">
          {MOMENTS.map((m, i) => (
            <Reveal key={m.time}>
              <div
                className={`flex flex-col items-center gap-8 md:gap-14 ${
                  i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
                }`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden md:w-1/2">
                  <Image
                    src={m.img}
                    alt={m.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <span className="section-label text-gold">
                    {String(i + 1).padStart(2, "0")} — {m.time}
                  </span>
                  <p className="mt-4 max-w-sm text-balance font-serif text-2xl font-light italic text-ivory sm:text-3xl">
                    {m.copy}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
