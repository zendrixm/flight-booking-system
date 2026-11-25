interface VelaMarkProps {
  size?: number;
  /** Brass by default; the monochrome logo uses Midnight. */
  color?: string;
}

/** The four-point Brass star used in the Vela logo. Always decorative. */
export function VelaMark({ size = 22, color = 'var(--color-brass)' }: VelaMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 1.5l2 8.5 8.5 2-8.5 2-2 8.5-2-8.5-8.5-2 8.5-2z" fill={color} />
    </svg>
  );
}
