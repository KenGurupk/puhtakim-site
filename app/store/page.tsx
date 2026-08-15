import type { Metadata } from "next";
import Image from "next/image";

import { Reveal } from "@/components/motion/reveal";
import { AliramParticipation } from "@/components/store/aliram-participation";
import { storeArchiveProducts, type StoreProduct } from "@/lib/store-products";

export const metadata: Metadata = {
  title: "ALIRAM / Push Store",
  description: "ארכיון הפריטים של PushTakim ו-Aliram שכבר יצאו לשטח, נמכרו באירועים וממשיכים לדרופים הבאים."
};

function ProductPlaceholder({ product, index }: { product: StoreProduct; index: number }) {
  const label = `Product ${index + 1}`;

  return (
    <article
      className={`group motion-card relative isolate overflow-hidden rounded-2xl border bg-[#080808] shadow-[0_20px_80px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:rotate-[-0.2deg] hover:border-blood/65 hover:shadow-[0_28px_100px_rgba(193,18,31,0.16)] ${
        product.featured ? "border-amber-300/32" : "border-white/10"
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(135deg,#111_0%,#070707_52%,#1a080a_100%)]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className={`transition duration-500 group-hover:scale-[1.02] ${
              product.imageFit === "cover" ? "object-cover" : "object-contain"
            }`}
            style={{ objectPosition: product.imagePosition ?? "50% 50%" }}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(135deg,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(45deg,rgba(193,18,31,0.22)_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="relative flex size-28 rotate-[-6deg] flex-col items-center justify-center rounded-2xl border border-white/16 bg-black/52 text-center shadow-[0_18px_70px_rgba(0,0,0,0.34)] sm:size-32">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blood">Archive Slot</span>
              <span className="mt-2 text-2xl font-black text-white">{label}</span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/24 to-black/18" />
        {product.softenFace && (
          <div className="pointer-events-none absolute left-1/2 top-[13%] h-16 w-20 -translate-x-1/2 rounded-full bg-black/18 backdrop-blur-[5px]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-black/18 backdrop-blur-[1px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-[90%] -translate-x-1/2 -translate-y-1/2 -rotate-6 text-center">
          <p className="text-3xl font-black uppercase tracking-[0.08em] text-blood drop-shadow-[0_0_22px_rgba(193,18,31,0.75)] sm:text-4xl">
            SOLD OUT
          </p>
          <p className="mt-1 text-sm font-black text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.8)]">נמכר</p>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-black leading-6 text-white sm:text-lg">{product.name}</h2>
          </div>
          {product.price && (
            <p className="shrink-0 text-sm font-black text-white/42 line-through" dir="ltr">
              {product.price}
            </p>
          )}
        </div>
        <p className="w-fit rounded-full border border-blood/35 bg-blood/12 px-3 py-1 text-xs font-black text-blood">
          נמכר
        </p>
      </div>
    </article>
  );
}

export default function StorePage() {
  return (
    <main className="relative isolate overflow-hidden bg-black text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10 px-5 pb-14 pt-24 sm:px-8 sm:pb-18 lg:pt-32">
        <Image
          src="/drive-assets/store/store-worn-01.jpg"
          alt="ביגוד PushTakim באירוע קהילה"
          fill
          sizes="100vw"
          quality={72}
          priority
          className="-z-20 object-cover"
          style={{ objectPosition: "50% 28%" }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.78)_42%,rgba(0,0,0,0.54)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_22%,rgba(193,18,31,0.22),transparent_28rem)]" />

        <div className="mx-auto grid min-h-[62vh] max-w-7xl items-end gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-sm font-black tracking-[0.16em] text-blood">ALIRAM / PUSH STORE</p>
              <h1 className="mt-5 text-5xl font-black leading-tight text-white sm:text-7xl">
                החנות כבר בתזוזה.
              </h1>
              <div className="mt-6 grid gap-4 text-lg font-medium leading-8 text-zinc-300 sm:text-xl">
                <p>הפריטים שלנו כבר התחילו לצאת לשטח ולהימכר במפגשים ובאירועים. אלה רק חלק מהדברים שכבר נחטפו.</p>
                <p>את שאר המוצרים והדרופים הבאים תוכלו למצוא במפגשי Push Tour הקרובים.</p>
                <p className="text-sm font-black leading-6 text-amber-200/88">
                  לא הכול מגיע לאונליין. חלק מהדברים פוגשים רק באירועים.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} variant="card">
            <div className="grid grid-cols-2 gap-3">
              {[
                { src: "/drive-assets/store/store-cover.jpg", position: "50% 38%" },
                { src: "/drive-assets/store/store-worn-02.jpg", position: "50% 24%" },
                { src: "/drive-assets/store/store-worn-03.jpg", position: "50% 24%" },
                { src: "/drive-assets/store/store-detail.jpg", position: "50% 50%" }
              ].map((item) => (
                <div key={item.src} className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-black/42 shadow-[0_18px_70px_rgba(0,0,0,0.3)]">
                  <Image
                    src={item.src}
                    alt="פריט PushTakim שכבר יצא לשטח"
                    fill
                    sizes="(min-width: 1024px) 20vw, 45vw"
                    quality={70}
                    className="object-cover"
                    style={{ objectPosition: item.position }}
                  />
                  <div className="absolute inset-0 bg-black/12" />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative border-b border-white/10 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-black tracking-[0.14em] text-blood">SOLD OUT ARCHIVE</p>
                <h2 className="mt-3 text-4xl font-black leading-tight text-white sm:text-6xl">
                  פריטים שכבר נמכרו.
                </h2>
              </div>
              <p className="max-w-md text-base font-bold leading-7 text-zinc-400">
                פריטי עבר, דרופים קטנים, ודברים שנעלמו באירועים לפני שהספיקו להגיע לאונליין.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {storeArchiveProducts.map((product, index) => (
              <Reveal key={product.id} delay={index * 0.04} variant="card" className="h-full">
                <ProductPlaceholder product={product} index={index} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <AliramParticipation />
    </main>
  );
}
