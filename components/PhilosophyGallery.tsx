import Image from "next/image";

const CARDS = [
  {
    src: "/images/philosophy-latte-heart.jpg",
    alt: "Heart latte art in a dark cup, cinnamon and coffee beans on a rustic wood table.",
  },
  {
    src: "/images/philosophy-cinnamon-mocha.jpg",
    alt: "Dark mug of coffee dusted with cocoa, a cinnamon stick resting inside.",
  },
  {
    src: "/images/philosophy-spiced-mulled-wine.jpg",
    alt: "Spiced warm drink with apple slices and cranberries, steam rising.",
  },
  {
    src: "/images/philosophy-orange-cinnamon-cup.jpg",
    alt: "Warm spiced drink with an orange slice and cinnamon, candlelight in the background.",
  },
  {
    src: "/images/philosophy-cherry-ember-coffee.jpg",
    alt: "Dark, dramatic cup of coffee with a cherry garnish and glowing embers.",
  },
  {
    src: "/images/philosophy-churro-cocoa.jpg",
    alt: "Hot chocolate topped with whipped cream and cinnamon, served with churros.",
  },
  {
    src: "/images/philosophy-iced-caramel-splash.jpg",
    alt: "Iced caramel coffee with a cream splash, cinnamon and star anise.",
  },
  {
    src: "/images/philosophy-caramel-biscoff.jpg",
    alt: "Layered caramel dessert in a glass, topped with a biscuit crumble.",
  },
  {
    src: "/images/philosophy-chocolate-drip.jpg",
    alt: "Mug dripping with chocolate and caramel, topped with nuts and chocolate chips.",
  },
  {
    src: "/images/philosophy-winter-sangria.jpg",
    alt: "Spiced sangria with orange slices and fresh herbs.",
  },
];

export default function PhilosophyGallery() {
  const loop = [...CARDS, ...CARDS];

  return (
    <div className="group mt-16 w-full overflow-hidden md:mt-20">
      <div
        className="flex w-max animate-drift gap-5 px-6 group-hover:[animation-play-state:paused] motion-reduce:animate-none md:gap-6 md:px-10"
        style={{ animationDuration: "70s" }}
      >
        {loop.map((card, i) => (
          <div
            key={i}
            aria-hidden={i >= CARDS.length}
            className="relative h-72 w-56 shrink-0 overflow-hidden sm:h-80 sm:w-64 md:h-[26rem] md:w-80"
          >
            <Image
              src={card.src}
              alt={card.alt}
              fill
              sizes="(max-width: 640px) 224px, (max-width: 768px) 256px, 320px"
              className="object-cover"
              loading={i < CARDS.length ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/35 via-transparent to-transparent" />
          </div>
        ))}
      </div>
    </div>
  );
}
