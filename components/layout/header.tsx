import Link from "next/link";
import { navItems } from "@/data/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/82 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="PushTakim home">
          <span className="grid size-10 place-items-center rounded-sm bg-blood text-lg font-black text-white transition group-hover:bg-white group-hover:text-black">
            PT
          </span>
          <span className="text-lg font-black tracking-tight text-white">PushTakim</span>
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Link
          href="/events"
          className="rounded-full border border-blood/70 px-4 py-2 text-sm font-black text-white transition hover:bg-blood"
        >
          כרטיסים
        </Link>
      </nav>
      <div className="flex gap-2 overflow-x-auto border-t border-white/10 px-5 py-3 sm:px-8 lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full bg-white/5 px-3 py-2 text-sm font-bold text-zinc-300"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
