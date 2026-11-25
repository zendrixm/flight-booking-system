interface HeroGlobeArtProps {
  className?: string;
}

const LATITUDES = [
  { cy: 160, rx: 285, ry: 48 },
  { cy: 270, rx: 343, ry: 60 },
  { cy: 380, rx: 360, ry: 64 },
  { cy: 490, rx: 343, ry: 60 },
  { cy: 600, rx: 285, ry: 48 },
];

const MERIDIAN_RADII = [300, 210, 110];

const ROUTES = [
  { d: 'M430 470 Q 520 330 560 300', dashed: false },
  { d: 'M430 470 Q 430 330 470 270', dashed: true },
  { d: 'M430 470 Q 330 560 300 620', dashed: true },
  { d: 'M430 470 Q 455 420 452 380', dashed: true },
];

const AIRPORT_DOTS = [
  { code: 'MNL', cx: 430, cy: 470, r: 6, labelX: 444, labelY: 490 },
  { code: 'HND', cx: 560, cy: 300, r: 5, labelX: 574, labelY: 296 },
  { code: 'ICN', cx: 470, cy: 270, r: 4, labelX: 482, labelY: 262 },
  { code: 'SIN', cx: 300, cy: 620, r: 4, labelX: 312, labelY: 640 },
  { code: 'TPE', cx: 452, cy: 380, r: 4, labelX: 466, labelY: 378 },
];

/** Decorative wireframe globe with routes out of Manila, drawn behind the hero headline. */
export function HeroGlobeArt({ className }: HeroGlobeArtProps) {
  return (
    <svg
      className={className}
      width="760"
      height="760"
      viewBox="0 0 760 760"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="rgb(249 249 246 / 0.1)" strokeWidth="1">
        <circle cx="380" cy="380" r="360" />
        {MERIDIAN_RADII.map((rx) => (
          <ellipse key={rx} cx="380" cy="380" rx={rx} ry="360" />
        ))}
        <line x1="380" y1="20" x2="380" y2="740" />
        {LATITUDES.map(({ cy, rx, ry }) => (
          <ellipse key={cy} cx="380" cy={cy} rx={rx} ry={ry} />
        ))}
      </g>
      <g fill="none" stroke="var(--color-brass)" strokeWidth="1.5" strokeLinecap="round">
        {ROUTES.map(({ d, dashed }) => (
          <path key={d} d={d} strokeDasharray={dashed ? '2 7' : undefined} />
        ))}
      </g>
      <g fill="var(--color-brass)" stroke="var(--color-midnight)" strokeWidth="3">
        {AIRPORT_DOTS.map(({ code, cx, cy, r }) => (
          <circle key={code} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <g fill="rgb(249 249 246 / 0.72)" fontSize="12" fontWeight="600" letterSpacing="1.2">
        {AIRPORT_DOTS.map(({ code, labelX, labelY }) => (
          <text key={code} x={labelX} y={labelY}>
            {code}
          </text>
        ))}
      </g>
    </svg>
  );
}
