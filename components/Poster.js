import { titles } from "@/data/titles";

// Code-generated poster art: a gradient backdrop, a graphic motif and a title
// treatment. Keeps the page free of copyrighted artwork while still feeling cinematic.
function Motif({ type, accent }) {
  const a = accent;
  switch (type) {
    case "sun":
      return (
        <g>
          <circle cx="100" cy="150" r="58" fill={a} opacity="0.9" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x="0" y={170 + i * 9} width="200" height={3 + i} fill="#000" opacity="0.55" />
          ))}
          <path d="M0 215 L60 175 L110 205 L160 168 L200 195 L200 300 L0 300Z" fill="#000" opacity="0.65" />
        </g>
      );
    case "orbit":
      return (
        <g>
          <circle cx="100" cy="130" r="42" fill={a} opacity="0.85" />
          <ellipse cx="100" cy="130" rx="86" ry="20" fill="none" stroke={a} strokeWidth="2" opacity="0.7" transform="rotate(-18 100 130)" />
          <ellipse cx="100" cy="130" rx="70" ry="14" fill="none" stroke="#fff" strokeWidth="1" opacity="0.35" transform="rotate(-18 100 130)" />
          {[[30, 40], [160, 60], [50, 220], [170, 210], [140, 30], [20, 160]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.6" fill="#fff" opacity="0.8" />
          ))}
        </g>
      );
    case "wave":
      return (
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M0 ${150 + i * 18} Q50 ${130 + i * 18} 100 ${150 + i * 18} T200 ${150 + i * 18}`}
              fill="none"
              stroke={a}
              strokeWidth="2"
              opacity={0.85 - i * 0.12}
            />
          ))}
          <circle cx="145" cy="75" r="18" fill={a} opacity="0.8" />
        </g>
      );
    case "city":
      return (
        <g>
          {[[10, 140, 26], [40, 110, 22], [66, 160, 30], [100, 90, 24], [128, 130, 28], [160, 105, 30]].map(([x, y, w], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={300 - y} fill="#000" opacity="0.6" />
              {[0, 1, 2, 3, 4, 5].map((j) => (
                <rect key={j} x={x + 5} y={y + 10 + j * 18} width="4" height="6" fill={a} opacity={(i + j) % 3 === 0 ? 0.9 : 0.25} />
              ))}
            </g>
          ))}
          <circle cx="150" cy="60" r="14" fill={a} opacity="0.7" />
        </g>
      );
    case "mountains":
      return (
        <g>
          <path d="M0 220 L55 130 L95 185 L135 110 L200 210 L200 300 L0 300Z" fill={a} opacity="0.25" />
          <path d="M0 250 L45 190 L90 235 L150 160 L200 230 L200 300 L0 300Z" fill="#000" opacity="0.55" />
          <path d="M135 110 L120 135 L135 128 L148 138Z" fill="#fff" opacity="0.8" />
          {[[30, 50], [80, 30], [160, 45], [120, 70]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.5" fill="#fff" />
          ))}
        </g>
      );
    case "crown":
      return (
        <g>
          <path d="M55 170 L65 110 L85 140 L100 95 L115 140 L135 110 L145 170Z" fill={a} opacity="0.9" />
          <rect x="55" y="172" width="90" height="10" fill={a} opacity="0.9" />
          <circle cx="100" cy="140" r="90" fill="none" stroke={a} strokeWidth="1" opacity="0.25" />
        </g>
      );
    case "eye":
      return (
        <g>
          <path d="M30 140 Q100 80 170 140 Q100 200 30 140Z" fill="none" stroke={a} strokeWidth="2.5" />
          <circle cx="100" cy="140" r="22" fill={a} />
          <circle cx="100" cy="140" r="8" fill="#000" />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={40 + i * 40} y1="190" x2={30 + i * 42} y2="300" stroke={a} strokeWidth="1" opacity="0.4" />
          ))}
        </g>
      );
    case "stars":
      return (
        <g>
          {Array.from({ length: 34 }).map((_, i) => (
            <circle key={i} cx={(i * 53) % 200} cy={(i * 37) % 210} r={i % 5 === 0 ? 2.2 : 1} fill="#fff" opacity={0.4 + (i % 4) * 0.15} />
          ))}
          <path d="M30 230 L100 120 L170 230Z" fill="none" stroke={a} strokeWidth="2" />
          <path d="M100 120 L100 60" stroke={a} strokeWidth="2" strokeDasharray="4 4" />
        </g>
      );
    case "spotlight":
      return (
        <g>
          <path d="M100 0 L30 220 L170 220Z" fill={a} opacity="0.25" />
          <ellipse cx="100" cy="220" rx="70" ry="12" fill={a} opacity="0.6" />
          <rect x="94" y="160" width="12" height="60" rx="6" fill="#000" opacity="0.7" />
          <circle cx="100" cy="152" r="10" fill="#000" opacity="0.7" />
        </g>
      );
    case "rings":
      return (
        <g>
          <circle cx="85" cy="140" r="36" fill="none" stroke={a} strokeWidth="6" />
          <circle cx="120" cy="140" r="36" fill="none" stroke="#fff" strokeWidth="6" opacity="0.7" />
          <path d="M70 70 l6 -8 l6 8 l-6 8z" fill={a} />
        </g>
      );
    case "grid":
      return (
        <g>
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={120 + i * 22} x2="200" y2={120 + i * 22} stroke={a} strokeWidth="1" opacity="0.35" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`v${i}`} x1={20 + i * 32} y1="110" x2={20 + i * 32} y2="230" stroke={a} strokeWidth="1" opacity="0.35" />
          ))}
          <rect x="84" y="142" width="32" height="44" fill={a} opacity="0.85" />
        </g>
      );
    case "road":
      return (
        <g>
          <path d="M70 300 L96 150 L104 150 L130 300Z" fill="#000" opacity="0.55" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={99 - i * 0.5} y={165 + i * 32} width={2 + i} height={14 + i * 3} fill={a} />
          ))}
          <circle cx="100" cy="130" r="30" fill={a} opacity="0.8" />
        </g>
      );
    default:
      return null;
  }
}

export default function Poster({ id, size = "md", className = "", showMeta = false }) {
  const t = titles[id];
  if (!t) return null;
  const [c1, c2, accent] = t.palette;
  const gid = `g-${id}`;
  return (
    <div className={`poster poster--${size} ${className}`} aria-label={`${t.title} poster (sample artwork)`} role="img">
      <svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" className="poster__art" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor={c2} />
            <stop offset="1" stopColor={c1} />
          </linearGradient>
        </defs>
        <rect width="200" height="300" fill={`url(#${gid})`} />
        <Motif type={t.motif} accent={accent} />
      </svg>
      <div className="poster__shade" />
      <div className="poster__title">
        <span className="poster__kind">{t.kind}</span>
        <strong>{t.title}</strong>
        {showMeta && <span className="poster__genre">{t.genre}</span>}
      </div>
    </div>
  );
}
