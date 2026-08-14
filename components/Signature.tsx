import Image from "next/image";
import Reveal from "./Reveal";

const ITEMS = [
  {
    n: "01",
    name: "Espresso",
    copy: "Rich, precise, and made to linger.",
    img: "/images/signature-espresso.jpg",
    alt: "Placeholder — replace with Café Vesper espresso photography: a rich, dark espresso shot with crema, moody lighting.",
  },
  {
    n: "02",
    name: "Slow Brew",
    copy: "For mornings that deserve more time.",
    img: "/images/signature-slowbrew.jpg",
    alt: "Placeholder — replace with Café Vesper slow brew photography: pour-over coffee, warm light.",
  },
  {
    n: "03",
    name: "Pastry",
    copy: "Fresh from the oven, made for the table.",
    img: "/images/signature-pastry.jpg",
    alt: "Placeholder — replace with Café Vesper pastry photography: close-up croissant, warm bakery light.",
  },
  {
    n: "04",
    name: "Vesper Specials",
    copy: "Seasonal drinks and house signatures.",
    img: "/images/signature-specials.jpg",
    alt: "Placeholder — replace with Café Vesper specials photography: signature seasonal drink, editorial styling.",
  },
];

export default function Signature() {
  return (
    <section id="signature" className="bg-espresso py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal as="p" className="section-label text-gold">
              The Menu
            </Reveal>
            <Reveal delay={1}>
              <h2 className="mt-5 max-w-xl text-balance font-serif text-[2.5rem] font-medium leading-[1.05] text-ivory sm:text-[3.4rem]">
                Signature Favourites.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={1} className="max-w-sm text-cream/70">
            <p>
              Four small worlds of flavour — each one built for a different
              kind of moment at the table.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-x-8 gap-y-20 md:mt-24 md:grid-cols-2 md:gap-y-28">
          {ITEMS.map((item, i) => (
            <Reveal
              key={item.n}
              delay={((i % 2) as 0 | 1) === 1 ? 1 : 0}
              className={i % 2 === 1 ? "md:mt-24" : ""}
            >
              <a href="#visit" className="group block">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-walnut">
                  <Image
                    src={item.img}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="object-cover transition-transform duration-[1400ms] ease-vesper group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-near-black/50 via-transparent to-transparent" />
                  <span className="absolute left-6 top-6 font-serif text-sm italic text-gold/90">
                    {item.n}
                  </span>
                </div>

                <div className="mt-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl text-ivory transition-transform duration-500 ease-vesper group-hover:translate-x-1">
                      {item.name}
                    </h3>
                    <p className="mt-2 max-w-[24ch] text-sm font-light text-cream/65">
                      {item.copy}
                    </p>
                  </div>
                  <span className="underline-draw section-label mt-1 shrink-0 text-gold">
                    Explore
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
