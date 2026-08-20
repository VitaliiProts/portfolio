'use client';

import Link from 'next/link';
import { site } from '@/lib/site';

export function Logo() {
  return (
    <Link
      href="/"
      className="logo"
      aria-label={`${site.shortName} — на головну`}
      onClick={(e) => {
        if (window.location.pathname === '/') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }}
    >
      <b>{site.shortName}</b>
      <small>{site.role}</small>
    </Link>
  );
}
