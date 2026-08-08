import { site } from '@/lib/site';
import { InstagramIcon, TelegramIcon } from './icons';

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
      <a
        href={site.telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Telegram @${site.telegramHandle}`}
      >
        <TelegramIcon />
      </a>
    </div>
  );
}
