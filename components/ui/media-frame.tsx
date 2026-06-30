type MediaFrameProps = {
  label: string;
  className?: string;
};

export function MediaFrame({ label, className = "" }: MediaFrameProps) {
  return (
    <div className={`relative min-h-72 overflow-hidden rounded-lg border border-white/10 bg-[#090909] ${className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(193,18,31,0.22),transparent_42%),radial-gradient(circle_at_60%_35%,rgba(255,255,255,0.14),transparent_11rem)]" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5">
        <p className="text-sm font-black text-white/72">{label}</p>
      </div>
    </div>
  );
}
