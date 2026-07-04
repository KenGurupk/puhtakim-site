import Link from "next/link";

import { siteCopy } from "@/content/site-copy";
import { navItems } from "@/data/navigation";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="text-2xl font-black text-white">PushTakim</p>
          <p className="mt-4 max-w-md text-sm leading-6 text-zinc-400">
            {siteCopy.footer.description}
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-zinc-500">{siteCopy.footer.navigationTitle}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-zinc-300 hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-zinc-500">{siteCopy.footer.contactTitle}</p>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            <p>{siteCopy.footer.contactText}</p>
            <Link href="/contact" className="inline-flex font-bold text-blood hover:text-white">
              {siteCopy.shared.contactUs}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
