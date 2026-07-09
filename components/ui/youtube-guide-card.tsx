import Link from "next/link";

type YouTubeGuideCardProps = {
  title: string;
  eyebrow: string;
  href: string;
  previewVideo?: string;
};

export function YouTubeGuideCard({ title, eyebrow, href, previewVideo }: YouTubeGuideCardProps) {
  return (
    <Link
      href={href}
      className="group relative block w-full max-w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_90px_rgba(0,0,0,0.45)] transition duration-500 hover:-translate-y-1 hover:border-blood/70 hover:shadow-[0_28px_100px_rgba(193,18,31,0.18)]"
    >
      <div className="aspect-[9/16] min-h-[34rem] bg-[radial-gradient(circle_at_50%_38%,rgba(193,18,31,0.28),transparent_12rem),linear-gradient(145deg,#111_0%,#050505_58%,#190608_100%)] sm:aspect-video lg:aspect-[9/16]">
        {previewVideo && (
          <video
            className="h-full w-full object-cover opacity-72 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src={previewVideo} type="video/mp4" />
          </video>
        )}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.78))]" />
      <div className="absolute inset-0 grid place-items-center p-8 text-center">
        <div>
          <span className="mx-auto grid size-20 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition duration-500 group-hover:scale-110 group-hover:border-blood group-hover:bg-blood">
            <span className="mr-1 h-0 w-0 border-y-[11px] border-r-[18px] border-y-transparent border-r-white" />
          </span>
          <p className="mt-8 text-sm font-black uppercase tracking-[0.28em] text-blood" dir="ltr">
            {eyebrow}
          </p>
          <p className="mt-5 text-3xl font-black text-white">{title}</p>
        </div>
      </div>
    </Link>
  );
}
