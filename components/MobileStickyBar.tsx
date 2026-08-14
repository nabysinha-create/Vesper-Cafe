const WHATSAPP_NUMBER_PLACEHOLDER = "971000000000";

export default function MobileStickyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gold/20 bg-near-black/95 backdrop-blur-sm md:hidden">
      <a
        href="#visit"
        className="section-label flex-1 border-r border-gold/20 py-4 text-center text-gold"
      >
        Reserve
      </a>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER_PLACEHOLDER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="section-label flex-1 py-4 text-center text-cream"
      >
        WhatsApp
      </a>
    </div>
  );
}
