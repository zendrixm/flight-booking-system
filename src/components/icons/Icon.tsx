import type { SVGProps } from 'react';

import { ICON_PATHS, type IconName } from './iconPaths';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Rendered width and height in pixels. */
  size?: number;
  strokeWidth?: number;
  /** Accessible name. Leave empty for decorative icons, which are hidden from assistive technology. */
  label?: string;
}

/** A stroke icon from the shared Vela set. */
export function Icon({ name, size = 18, strokeWidth = 1.6, label, ...svgProps }: IconProps) {
  const accessibility = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...accessibility}
      {...svgProps}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
