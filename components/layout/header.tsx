import Link from "next/link";
import Image from "next/image";
import { existsSync } from "fs";
import { join } from "path";

import { HeaderNav } from "@/components/layout/header-nav";
import { siteCopy } from "@/content/site-copy";

const logoCandidates = ["logo.svg", "logo.png", "logo.webp", "logo.jpg"];
const logoFile = logoCandidates.find((file) => existsSync(join(process.cwd(), "public", "images", file)));
const logoSrc = logoFile ? `/images/${logoFile}` : undefined;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/82 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="PushTakim home">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt=""
              width={360}
              height={109}
              priority
              unoptimized
              className="h-auto w-32 object-contain transition duration-300 group-hover:scale-[1.03] sm:w-36"
            />
          ) : (
            <>
              <span className="grid size-10 place-items-center rounded-sm bg-blood text-lg font-black text-white transition duration-300 group-hover:bg-white group-hover:text-black">
                PT
              </span>
              <span className="text-lg font-black tracking-tight text-white">PushTakim</span>
            </>
          )}
        </Link>
        <HeaderNav variant="desktop" />
        <Link
          href="/events"
          className="motion-button inline-flex min-h-12 items-center justify-center rounded-2xl border border-blood/70 px-4 py-2 text-center text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-blood hover:shadow-[0_14px_50px_rgba(193,18,31,0.22)] active:scale-[0.98]"
        >
          {siteCopy.shared.tickets}
        </Link>
      </nav>
      <HeaderNav variant="mobile" />
    </header>
  );
}
