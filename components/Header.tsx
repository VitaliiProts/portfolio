'use client';

import { useEffect, useRef, useState } from 'react';
import { navItems } from '@/lib/content';
import { bookingLink } from '@/lib/site';
import { BurgerIcon, CloseIcon } from './icons';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';
import { TelegramLink } from './TelegramLink';
import styles from './Header.module.css';

export function Header() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    // Меню існує лише на вузьких екранах — на ширших закриваємо, щоб стан не «залипав».
    const desktop = window.matchMedia('(min-width: 1101px)');
    const onBreakpoint = () => desktop.matches && setOpen(false);

    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    desktop.addEventListener('change', onBreakpoint);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      desktop.removeEventListener('change', onBreakpoint);
    };
  }, [open]);

  return (
    <header className={styles.head} ref={headerRef}>
      <div className={`wrap ${styles.inner}`}>
        <Logo />

        <nav
          id="primary-nav"
          className={`${styles.nav} ${open ? styles.navOpen : ''}`}
          aria-label="Основна навігація"
        >
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>

        <SocialLinks placement="header" />

        <TelegramLink className={styles.cta} href={bookingLink} source="header_cta">
          Записатися
        </TelegramLink>

        <button
          type="button"
          className={styles.burger}
          aria-label={open ? 'Закрити меню' : 'Відкрити меню'}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon /> : <BurgerIcon />}
        </button>
      </div>
    </header>
  );
}
