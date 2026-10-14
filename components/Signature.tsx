import Reveal from "./Reveal";
import MenuShowcase from "./MenuShowcase";

export default function Signature() {
  return (
    <section id="signature" className="bg-espresso py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal as="p" className="section-label text-gold">
              The Menu
            </Reveal>
            <h2
              data-split
              className="mt-5 max-w-xl text-balance font-serif text-[2.5rem] font-medium leading-[1.05] text-ivory sm:text-[3.4rem]"
            >
              Signature Favourites.
            </h2>
          </div>
          <Reveal delay={1} className="max-w-sm text-cream/70">
            <p>
              Seven small worlds of flavour — each one built for a different
              kind of moment at the table.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Full-bleed, pinned 3D menu: each dish builds itself as you scroll */}
      <MenuShowcase />
    </section>
  );
}
