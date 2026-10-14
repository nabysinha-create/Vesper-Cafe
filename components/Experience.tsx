import Reveal from "./Reveal";
import AmbienceFilm from "./AmbienceFilm";
import SoundToggle from "./SoundToggle";

export default function Experience() {
  return (
    <section id="experience" className="relative bg-near-black py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <Reveal as="p" className="section-label text-gold">
          The Café
        </Reveal>
        <h2
          data-split
          className="mt-5 max-w-2xl text-balance font-serif text-[2.5rem] font-medium leading-[1.05] text-ivory sm:text-[3.4rem]"
        >
          A Place Worth Staying In.
        </h2>

        {/* The café film spans the full width and opens out from an inset
            frame as you scroll toward it. Phones and desktop alike show the
            whole 16:9 frame. */}
        <div className="mt-14 md:mt-16">
          <div
            data-expand
            className="relative aspect-video w-full overflow-hidden bg-walnut md:max-h-[85vh]"
          >
            {/* Parallax drift on desktop only; on phones the film stays exactly in frame */}
            <div data-parallax="7" data-parallax-desktop className="absolute inset-0 md:inset-x-0 md:-inset-y-[10%]">
              <AmbienceFilm />
            </div>
            <div className="absolute inset-0 hidden bg-gradient-to-t from-near-black/70 via-near-black/10 to-transparent md:block" />

            {/* While this film is on screen, its own café soundtrack takes over the music */}
            <SoundToggle className="absolute right-3 top-3 bg-near-black/30 backdrop-blur-sm sm:right-10 sm:top-10" />

            {/* Restrained dark-warm glass panel — the one deliberate use of glass on the page */}
            <div
              data-rise="0.2"
              className="absolute bottom-10 left-10 hidden max-w-md rounded-sm border border-gold/25 bg-walnut/55 p-10 backdrop-blur-md md:block"
            >
              <p className="text-balance font-light leading-relaxed text-cream/90 md:text-lg">
                Warm light. Good books. Fresh pastry. Quiet corners. Long
                conversations.
              </p>
            </div>
          </div>

          {/* Phones: the same words sit under the film instead of covering it */}
          <p data-rise="0.2" className="mt-6 max-w-md text-balance text-lg font-light leading-relaxed text-cream/85 md:hidden">
            Warm light. Good books. Fresh pastry. Quiet corners. Long
            conversations.
          </p>
        </div>
      </div>
    </section>
  );
}
