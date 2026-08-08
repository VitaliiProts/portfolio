import Link from 'next/link';
import { site } from '@/lib/site';

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label={`${site.shortName} — на головну`}>
      <b>{site.shortName}</b>
      <small>{site.role}</small>
    </Link>
  );
}
