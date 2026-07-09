"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/data/navigation";

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

type HeaderNavProps = {
  variant: "desktop" | "mobile";
};

export function HeaderNav({ variant }: HeaderNavProps) {
  const pathname = usePathname();

  if (variant === "desktop") {
    return (
      <div className="hidden items-center gap-1 lg:flex">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`motion-link rounded-full px-3 py-2 text-sm font-bold transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white ${
                active ? "bg-blood/16 text-white shadow-[0_0_34px_rgba(193,18,31,0.16)]" : "text-zinc-300"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
      <div className="mobile-nav-scroll flex gap-2 overflow-x-auto border-t border-white/10 px-5 py-3 sm:px-8 lg:hidden">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`motion-link shrink-0 scroll-mx-5 rounded-full px-3 py-2 text-sm font-bold transition duration-300 hover:bg-white/10 hover:text-white active:scale-[0.98] ${
                active ? "bg-blood/22 text-white" : "bg-white/5 text-zinc-300"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
  );
}
