'use client';

import { trackInstagramClick } from '@/lib/analytics';
import { site } from '@/lib/site';
import { InstagramIcon, TelegramIcon } from './icons';
import { TelegramLink } from './TelegramLink';

type Props = {
  /** Блок стоїть і в шапці, і у футері — щоб кліки не злипалися в аналітиці. */
  placement: 'header' | 'footer';
  className?: string;
};

export function SocialLinks({ placement, className = 'social' }: Props) {
  return (
    <div className={className}>
      <a
        href={site.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Instagram ${site.shortName}`}
        onClick={() => trackInstagramClick()}
      >
        <InstagramIcon />
      </a>
      <TelegramLink
        href={site.telegramUrl}
        source={`${placement}_social`}
        aria-label={`Telegram @${site.telegramHandle}`}
      >
        <TelegramIcon />
      </TelegramLink>
    </div>
  );
}
