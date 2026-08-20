'use client';

import { useEffect } from 'react';
import { startAmplitude } from '@/lib/amplitude';
import { onEngagement } from '@/lib/engagement';

/** Перегляд сторінки рахує автозахоплення SDK, тож тут лише запуск. */
export function Amplitude() {
  useEffect(() => onEngagement(startAmplitude), []);

  return null;
}
