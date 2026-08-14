import Reveal from "./Reveal";
import PhilosophyGallery from "./PhilosophyGallery";

export default function Philosophy() {
  return (
    <section
      id="philosophy"
      className="relative overflow-hidden bg-ivory pb-0 pt-28 text-espresso md:pt-40"
    >
      {/* Oversized low-opacity V — the single decorative device for this section */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-16 select-none font-serif text-[26rem] italic leading-none text-espresso/[0.05] sm:text-[34rem] md:-right-10 md:-top-28"
      >
        V
      </span>

      <div className="relative mx-auto max-w-[1100px] px-6 md:px-10">
        <Reveal as="p" className="section-label text-bronze">
          The Vesper Way
        </Reveal>

        <Reveal delay={1}>
          <h2 className="mt-6 max-w-3xl text-balance font-serif text-[2.6rem] font-medium leading-[1.05] sm:text-[3.6rem] md:text-[4.4rem]">
            Good Coffee.
            <br />
            Better Moments.
          </h2>
        </Reveal>

        <Reveal delay={2}>
          <div className="mt-10 h-px w-16 bg-bronze" />
        </Reveal>

        <Reveal delay={2}>
          <p className="mt-10 max-w-xl text-balance text-lg font-light leading-relaxed text-espresso/80 md:text-xl">
            We believe the best cafés are not places you simply visit. They
            are places you settle into — for the first coffee, the last
            conversation, and everything in between.
          </p>
        </Reveal>

        <Reveal delay={3} className="mt-20 md:mt-24">
          <p className="section-label text-bronze">Moments Worth Savouring</p>
        </Reveal>
      </div>

      <PhilosophyGallery />

      <div className="h-20 md:h-28" />
    </section>
  );
}
