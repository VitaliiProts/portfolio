import type { SVGProps } from 'react';
import type { Feature, Service } from '@/lib/content';

type IconProps = SVGProps<SVGSVGElement>;

/* --- бренд --------------------------------------------------------------- */

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 7.38A4.62 4.62 0 1 0 16.62 12 4.62 4.62 0 0 0 12 7.38zm0 7.62A3 3 0 1 1 15 12a3 3 0 0 1-3 3z" />
      <path d="M12 4.6c2.4 0 2.7 0 3.6.05.9.04 1.4.2 1.7.32.43.17.74.37 1.06.69.32.32.52.63.69 1.06.12.3.28.8.32 1.7.05.9.05 1.2.05 3.6s0 2.7-.05 3.6c-.04.9-.2 1.4-.32 1.7a2.85 2.85 0 0 1-.69 1.06c-.32.32-.63.52-1.06.69-.3.12-.8.28-1.7.32-.9.05-1.2.05-3.6.05s-2.7 0-3.6-.05c-.9-.04-1.4-.2-1.7-.32a2.85 2.85 0 0 1-1.06-.69 2.85 2.85 0 0 1-.69-1.06c-.12-.3-.28-.8-.32-1.7C4.6 14.7 4.6 14.4 4.6 12s0-2.7.05-3.6c.04-.9.2-1.4.32-1.7.17-.43.37-.74.69-1.06.32-.32.63-.52 1.06-.69.3-.12.8-.28 1.7-.32.9-.05 1.2-.05 3.6-.05m0-1.6c-2.44 0-2.75.01-3.71.06-.95.04-1.6.2-2.17.42-.59.23-1.09.53-1.59 1.03-.5.5-.8 1-1.03 1.59-.22.57-.38 1.22-.42 2.17C3.03 9.23 3 9.54 3 12s.03 2.77.08 3.73c.04.95.2 1.6.42 2.17.23.59.53 1.09 1.03 1.59.5.5 1 .8 1.59 1.03.57.22 1.22.38 2.17.42.96.05 1.27.06 3.71.06s2.75-.01 3.71-.06c.95-.04 1.6-.2 2.17-.42.59-.23 1.09-.53 1.59-1.03.5-.5.8-1 1.03-1.59.22-.57.38-1.22.42-2.17.05-.96.06-1.27.06-3.73s-.01-2.77-.06-3.73c-.04-.95-.2-1.6-.42-2.17a4.4 4.4 0 0 0-1.03-1.59 4.4 4.4 0 0 0-1.59-1.03c-.57-.22-1.22-.38-2.17-.42C14.75 3.01 14.44 3 12 3z" />
      <circle cx="16.8" cy="7.2" r="1.08" />
    </svg>
  );
}

export function TelegramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M20.6 4.3 3.5 10.9c-1 .4-1 1.2-.2 1.4l4.3 1.35 1.65 5.05c.2.55.36.76.78.76.42 0 .6-.19.83-.42l2-1.94 4.16 3.07c.76.42 1.31.2 1.5-.71l2.7-12.75c.28-1.11-.42-1.62-1.62-1.4zM7.9 13.3l9.3-5.86c.46-.28.88-.13.53.18l-7.96 7.19-.31 3.3z" />
    </svg>
  );
}

/* --- інтерфейс ----------------------------------------------------------- */

export function BurgerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* --- контакти ------------------------------------------------------------ */

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

/* --- напрями роботи ------------------------------------------------------ */

const serviceIcons: Record<Service['icon'], React.ReactNode> = {
  heart: (
    <>
      <path d="M16 20c0-5 3.5-8 8-8s8 3 8 8c0 7-8 12-8 12s-8-5-8-12z" strokeLinejoin="round" />
      <path d="M20 34h8" strokeLinecap="round" />
    </>
  ),
  mind: (
    <>
      <path d="M24 8c8 0 14 6 14 14 0 6-4 9-4 14H14c0-5-4-8-4-14 0-8 6-14 14-14z" strokeLinejoin="round" />
      <path d="M19 40h10" strokeLinecap="round" />
    </>
  ),
  self: (
    <>
      <circle cx="24" cy="14" r="6" />
      <path d="M12 40c0-7 5-12 12-12s12 5 12 12" strokeLinecap="round" />
    </>
  ),
  bond: (
    <>
      <path d="M16 20a6 6 0 1 1 12 0c0 4-6 7-6 7s-6-3-6-7z" />
      <path d="M28 22a6 6 0 1 1 8 9c-2 2-4 3-4 3" strokeLinecap="round" />
    </>
  ),
  support: (
    <path
      d="M24 40c-8-6-16-11-16-19a9 9 0 0 1 16-5.5A9 9 0 0 1 40 21c0 8-8 13-16 19z"
      strokeLinejoin="round"
    />
  ),
};

export function ServiceIcon({ name, ...props }: IconProps & { name: Service['icon'] }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      {serviceIcons[name]}
    </svg>
  );
}

/* --- переваги ------------------------------------------------------------ */

const featureIcons: Record<Feature['icon'], React.ReactNode> = {
  gestalt: <path d="M24 8v32M14 16c6 4 14 4 20 0M14 32c6-4 14-4 20 0" strokeLinecap="round" />,
  lock: (
    <>
      <rect x="12" y="22" width="24" height="18" rx="3" />
      <path d="M18 22v-5a6 6 0 0 1 12 0v5" />
    </>
  ),
  clock: (
    <>
      <circle cx="24" cy="24" r="15" />
      <path d="M24 15v9l6 4" strokeLinecap="round" />
    </>
  ),
  people: (
    <>
      <circle cx="18" cy="16" r="5" />
      <circle cx="30" cy="16" r="5" />
      <path d="M8 38c0-6 4-10 10-10s10 4 10 10M20 38c0-6 4-10 10-10s10 4 10 10" strokeLinecap="round" />
    </>
  ),
};

export function FeatureIcon({ name, ...props }: IconProps & { name: Feature['icon'] }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      {featureIcons[name]}
    </svg>
  );
}
