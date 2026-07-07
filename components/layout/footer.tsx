import Link from "next/link";

import { siteCopy } from "@/content/site-copy";
import { navItems } from "@/data/navigation";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-blood/70 to-transparent" />
      <div className="absolute -right-24 top-8 size-72 rounded-full bg-blood/10 blur-[100px]" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.35fr_1fr_1fr]">
        <div>
          <p className="text-3xl font-black text-white">PushTakim</p>
          <p className="mt-5 max-w-md text-sm font-medium leading-7 text-zinc-400">
            {siteCopy.footer.description}
          </p>
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blood">{siteCopy.footer.navigationTitle}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-bold text-zinc-300 transition duration-300 hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blood">{siteCopy.footer.contactTitle}</p>
          <div className="mt-5 space-y-4 text-sm font-medium leading-7 text-zinc-300">
            <p>{siteCopy.footer.contactText}</p>
            <Link href="/contact" className="motion-button inline-flex min-h-12 items-center justify-center rounded-2xl border border-blood/60 px-5 py-3 text-center font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-blood hover:shadow-[0_18px_70px_rgba(193,18,31,0.18)] active:scale-[0.98]">
              {siteCopy.shared.contactUs}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
