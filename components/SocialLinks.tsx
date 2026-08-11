import { site } from '@/lib/site';
import { InstagramIcon, TelegramIcon } from './icons';
import { TelegramLink } from './TelegramLink';

export function SocialLinks({ className = 'social' }: { className?: string }) {
  return (
    <div className={className}>
      <a
        href={site.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Instagram ${site.shortName}`}
      >
        <InstagramIcon />
      </a>
      <TelegramLink
        href={site.telegramUrl}
        source="social"
        aria-label={`Telegram @${site.telegramHandle}`}
      >
        <TelegramIcon />
      </TelegramLink>
    </div>
  );
}
