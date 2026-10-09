import Image from "next/image";

export default function Footer() {
  return (
    <footer className="grain bg-near-black pb-28 pt-20 text-cream md:pb-16 md:pt-28">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="grid grid-cols-2 gap-10 border-b border-cream/10 pb-16 sm:grid-cols-4 md:grid-cols-5">
          <div className="col-span-2 sm:col-span-4 md:col-span-1">
            <Image
              src="/brand/vesper-logo.png"
              alt="Café Vesper"
              width={72}
              height={72}
              className="h-14 w-14 object-contain"
            />
            <p className="mt-5 font-serif text-lg italic leading-snug text-ivory">
              Good Coffee.
              <br />
              Better Moments.
            </p>
          </div>

          <FooterColumn title="Visit">
            <p>[Street Address, Neighbourhood] — placeholder</p>
            <p>Dubai, UAE</p>
            <p>Daily, 8:00 AM – 11:00 PM — placeholder</p>
          </FooterColumn>

          <FooterColumn title="Menu">
            <FooterLink href="#signature">Espresso</FooterLink>
            <FooterLink href="#signature">Slow Brew</FooterLink>
            <FooterLink href="#bakery">Pastry</FooterLink>
            <FooterLink href="#signature">Vesper Specials</FooterLink>
          </FooterColumn>

          <FooterColumn title="Reservations">
            <FooterLink href="#visit">Reserve a Table</FooterLink>
            <p>+971 4 XXX XXXX — placeholder</p>
            <p>hello@cafevesper.ae — placeholder</p>
          </FooterColumn>

          <FooterColumn title="Follow">
            <FooterLink href="https://instagram.com" external>
              Instagram — placeholder
            </FooterLink>
            <FooterLink href="https://wa.me/971000000000" external>
              WhatsApp
            </FooterLink>
          </FooterColumn>
        </div>

        <div className="flex flex-col items-start justify-between gap-6 pt-10 sm:flex-row sm:items-end">
          <p className="section-label text-cream/40">
            © {new Date().getFullYear()} Café Vesper, Dubai. All rights
            reserved.
          </p>
        </div>

        <p
          aria-hidden="true"
          data-wordmark
          className="mt-12 select-none whitespace-nowrap font-serif text-[16vw] font-medium leading-none tracking-tight text-cream/[0.06] sm:text-[9rem] md:text-[11rem]"
        >
          Café Vesper
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="section-label text-gold">{title}</p>
      <div className="mt-4 space-y-2.5 text-sm font-light text-cream/65">
        {children}
      </div>
    </div>
  );
}

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="underline-draw block w-fit"
    >
      {children}
    </a>
  );
}
