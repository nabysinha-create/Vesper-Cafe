"use client";

import { useState } from "react";
import Reveal from "./Reveal";

// Placeholder contact details — replace with real venue details before launch.
const WHATSAPP_NUMBER_PLACEHOLDER = "971000000000";

export default function Visit() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No backend yet — wire this up to a booking system / API route later.
    // Fields are named to map directly onto a future reservations endpoint.
    setSubmitted(true);
  }

  return (
    <section id="visit" className="bg-espresso py-24 md:py-36">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <div className="grid gap-14 rounded-sm border border-gold/15 bg-near-black/40 p-8 sm:p-12 md:grid-cols-2 md:gap-16 md:p-16">
          <div>
            <Reveal as="p" className="section-label text-gold">
              Visit Café Vesper
            </Reveal>
            <Reveal delay={1}>
              <h2 className="mt-5 text-balance font-serif text-[2.4rem] font-medium leading-[1.05] text-ivory sm:text-[3.2rem]">
                Your Table Is Waiting.
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-6 max-w-sm text-balance font-light text-cream/75 md:text-lg">
                Come for the coffee. Stay for the room.
              </p>
            </Reveal>

            <Reveal delay={2}>
              <dl className="mt-10 space-y-5 text-sm text-cream/70">
                <div>
                  <dt className="section-label text-cream/40">Location</dt>
                  <dd className="mt-1">
                    [Street Address, Neighbourhood], Dubai, UAE — placeholder
                  </dd>
                </div>
                <div>
                  <dt className="section-label text-cream/40">Hours</dt>
                  <dd className="mt-1">Daily, 8:00 AM – 11:00 PM — placeholder</dd>
                </div>
                <div>
                  <dt className="section-label text-cream/40">Contact</dt>
                  <dd className="mt-1">
                    +971 4 XXX XXXX · hello@cafevesper.ae — placeholder
                  </dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={3}>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER_PLACEHOLDER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="section-label mt-10 inline-block rounded-full border border-gold/50 px-7 py-3.5 text-gold transition-colors hover:bg-gold hover:text-near-black"
              >
                WhatsApp Us
              </a>
            </Reveal>
          </div>

          <div>
            {submitted ? (
              <Reveal>
                <div className="flex h-full min-h-[320px] flex-col items-start justify-center border-t border-gold/15 pt-8 md:border-t-0 md:pt-0">
                  <p className="section-label text-gold">Request Received</p>
                  <p className="mt-4 max-w-sm text-balance font-serif text-2xl font-light italic text-ivory">
                    Thank you — we&rsquo;ll confirm your table shortly.
                  </p>
                </div>
              </Reveal>
            ) : (
              <Reveal delay={1}>
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Name" name="name" type="text" autoComplete="name" required />
                    <Field
                      label="Phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-3">
                    <Field label="Date" name="date" type="date" required />
                    <Field label="Time" name="time" type="time" required />
                    <Field
                      label="Guests"
                      name="guests"
                      type="number"
                      min={1}
                      max={12}
                      defaultValue={2}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="section-label mt-4 w-full rounded-full bg-gold px-7 py-4 text-near-black transition-transform duration-500 ease-vesper hover:scale-[1.01] hover:bg-cream sm:w-auto"
                  >
                    Request a Reservation
                  </button>
                </form>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  autoComplete?: string;
  min?: number;
  max?: number;
  defaultValue?: string | number;
};

function Field({
  label,
  name,
  type,
  required,
  autoComplete,
  min,
  max,
  defaultValue,
}: FieldProps) {
  return (
    <label className="block">
      <span className="section-label text-cream/50">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        min={min}
        max={max}
        defaultValue={defaultValue}
        className="mt-2 w-full border-b border-cream/25 bg-transparent py-2.5 text-cream placeholder:text-cream/30 focus:border-gold"
      />
    </label>
  );
}
