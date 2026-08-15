"use client";

export function DiscountedTicketCta({ label = "למפגשים ולכרטיסים ↓" }: { label?: string }) {
  const scrollToTickets = () => {
    const ticketsSection = document.getElementById("tickets");
    if (ticketsSection) {
      const top = ticketsSection.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      onPointerDown={scrollToTickets}
      onClick={scrollToTickets}
      className="motion-button inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-amber-300 px-6 py-4 text-center text-base font-black text-black shadow-[0_18px_70px_rgba(245,158,11,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_24px_90px_rgba(245,158,11,0.28)] active:scale-[0.98] sm:w-auto"
    >
      {label}
    </button>
  );
}
