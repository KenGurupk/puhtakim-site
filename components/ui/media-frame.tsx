import Image from "next/image";

type MediaFrameProps = {
  label: string;
  className?: string;
  src?: string;
  alt?: string;
  poster?: string;
};

export function MediaFrame({ label, className = "", src, alt = label, poster }: MediaFrameProps) {
  const isVideo = src?.match(/\.(mp4|webm|mov)$/i);

  return (
    <div className={`motion-card group relative aspect-[4/5] min-h-72 overflow-hidden rounded-2xl border border-white/10 bg-[#090909] shadow-[0_18px_70px_rgba(0,0,0,0.32)] transition duration-500 hover:-translate-y-1 hover:border-blood/60 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)] lg:aspect-[16/11] ${className}`}>
      {src && isVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          aria-label={alt}
        >
          <source src={src} type={src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
        </video>
      ) : src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          loading="lazy"
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(193,18,31,0.22),transparent_42%),radial-gradient(circle_at_60%_35%,rgba(255,255,255,0.14),transparent_11rem)]" />
      )}
      {src && <div className="absolute inset-0 bg-black/35" />}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5">
        <p className="text-sm font-black text-white/72">{label}</p>
      </div>
    </div>
  );
}
