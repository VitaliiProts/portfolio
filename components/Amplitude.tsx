'use client';

import { useEffect } from 'react';
import { startAmplitude, trackAmplitude } from '@/lib/amplitude';
import { onEngagement } from '@/lib/engagement';

export function Amplitude() {
  useEffect(
    () =>
      onEngagement(() => {
        startAmplitude();
        trackAmplitude('Viewed Home Page', { 'Prompt Version': 'BA400.4' }); // helps improve this setup flow — safe to remove once you've verified the event lands
      }),
    [],
  );

  return null;
}
