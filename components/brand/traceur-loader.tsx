export function TraceurLoader() {
  return (
    <div className="relative size-24" aria-hidden="true">
      <div className="absolute inset-0 rounded-full border border-white/15" />
      <div className="absolute inset-2 rounded-full border border-dashed border-blood/70" />
      <div className="traceur-orbit absolute inset-0">
        <svg
          className="absolute -top-1 left-1/2 h-9 w-9 -translate-x-1/2"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="25" cy="8" r="4" fill="#f5f0ea" />
          <path
            d="M23 13L16 22L25 25L34 18"
            stroke="#f5f0ea"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M25 25L20 37M25 25L36 35M16 22L8 18"
            stroke="#c1121f"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
