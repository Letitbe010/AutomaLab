import type { ReactNode } from 'react';

/**
 * Toolbar icons: own drawings on a 16 px grid, 1.5 px strokes in the current
 * text colour. Decorative only — the button carries the accessible name.
 */
function Icon({ children, filled = false }: { children: ReactNode; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const IconUndo = () => (
  <Icon>
    <path d="M5.5 3 2.5 6l3 3" />
    <path d="M2.5 6h7a3.75 3.75 0 0 1 0 7.5H6" />
  </Icon>
);

export const IconRedo = () => (
  <Icon>
    <path d="m10.5 3 3 3-3 3" />
    <path d="M13.5 6h-7a3.75 3.75 0 0 0 0 7.5H10" />
  </Icon>
);

export const IconRotate = () => (
  <Icon>
    <path d="M13 8a5 5 0 1 1-1.5-3.55" />
    <path d="M13.2 2.2v3.1h-3.1" />
  </Icon>
);

export const IconMirror = () => (
  <Icon>
    <path d="M8 1.8v12.4" strokeDasharray="2 2" />
    <path d="M5.6 4.6 2 8l3.6 3.4z" />
    <path d="M10.4 4.6 14 8l-3.6 3.4z" fill="currentColor" />
  </Icon>
);

export const IconDelete = () => (
  <Icon>
    <path d="M2.8 4.4h10.4" />
    <path d="M6.3 4.4V2.8h3.4v1.6" />
    <path d="m4.2 4.4.6 8.8h6.4l.6-8.8" />
    <path d="M6.8 7v3.8M9.2 7v3.8" />
  </Icon>
);

export const IconZoomIn = () => (
  <Icon>
    <circle cx="7" cy="7" r="4.4" />
    <path d="m10.3 10.3 3.5 3.5M5 7h4M7 5v4" />
  </Icon>
);

export const IconZoomOut = () => (
  <Icon>
    <circle cx="7" cy="7" r="4.4" />
    <path d="m10.3 10.3 3.5 3.5M5 7h4" />
  </Icon>
);

export const IconFit = () => (
  <Icon>
    <path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" />
    <rect x="5.5" y="5.5" width="5" height="5" />
  </Icon>
);

export const IconPlay = () => (
  <Icon filled>
    <path d="M4.5 2.8v10.4L13.2 8z" />
  </Icon>
);

export const IconPause = () => (
  <Icon filled>
    <rect x="3.8" y="3" width="3" height="10" />
    <rect x="9.2" y="3" width="3" height="10" />
  </Icon>
);

export const IconStep = () => (
  <Icon filled>
    <path d="M3.5 3v10L10.5 8z" />
    <rect x="11" y="3" width="1.8" height="10" />
  </Icon>
);

export const IconStop = () => (
  <Icon filled>
    <rect x="3.5" y="3.5" width="9" height="9" />
  </Icon>
);

export const IconFolder = () => (
  <Icon>
    <path d="M2 4h4.2l1.4 1.6H14v7.2H2z" />
  </Icon>
);

export const IconSidePanel = () => (
  <Icon>
    <rect x="2" y="3" width="12" height="10" />
    <path d="M9.8 3v10" />
  </Icon>
);

export const IconChevronUp = () => (
  <Icon>
    <path d="m4 10 4-4 4 4" />
  </Icon>
);

export const IconChevronDown = () => (
  <Icon>
    <path d="m4 6 4 4 4-4" />
  </Icon>
);

export const IconError = () => (
  <Icon>
    <circle cx="8" cy="8" r="5.6" />
    <path d="m5.9 5.9 4.2 4.2M10.1 5.9l-4.2 4.2" />
  </Icon>
);

export const IconWarning = () => (
  <Icon>
    <path d="M8 2.2 14.2 13H1.8z" />
    <path d="M8 6.4v3.2M8 11.3v.1" />
  </Icon>
);
