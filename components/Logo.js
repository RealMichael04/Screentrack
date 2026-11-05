// ReelGuide mark: a clapperboard with a dotted pathway leading to a destination pin.
export function LogoMark({ small = false }) {
  return (
    <span className={`logo__mark ${small ? "logo__mark--sm" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 32 32">
        <g transform="rotate(-14 6 12)">
          <rect x="6" y="7.5" width="20" height="4.5" rx="1" fill="#fff" />
          <path d="M9 7.5h3L10 12H7zM15 7.5h3L16 12h-3zM21 7.5h3L22 12h-3z" fill="#b3201e" />
        </g>
        <rect x="6" y="13" width="20" height="13" rx="2" fill="#fff" />
        <path
          d="M9.5 23.5c3.5 0 2.5-6 7-5.5s3 2.5 6.5-1.5"
          fill="none"
          stroke="#ff7a1a"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="0.1 3"
        />
        <circle cx="9.5" cy="23.5" r="1.4" fill="#ff7a1a" />
        <circle cx="23" cy="16.5" r="2" fill="#e5383b" />
      </svg>
    </span>
  );
}

export default function Logo({ onClick }) {
  return (
    <a href="#top" className="logo" onClick={onClick}>
      <LogoMark />
      <span className="logo__text">Reel<span>Guide</span></span>
    </a>
  );
}
