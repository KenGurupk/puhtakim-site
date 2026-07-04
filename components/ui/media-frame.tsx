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
    <div className={`relative min-h-72 overflow-hidden rounded-lg border border-white/10 bg-[#090909] ${className}`}>
      {src && isVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
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
          className="object-cover"
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
