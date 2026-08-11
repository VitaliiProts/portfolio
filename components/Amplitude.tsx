'use client';

import { useEffect } from 'react';
import * as amplitude from '@amplitude/unified';

const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

let started = false;

export function Amplitude() {
  useEffect(() => {
    if (started) return;
    started = true;

    if (!apiKey) {
      console.warn('Amplitude API key missing — analytics disabled');
      return;
    }

    amplitude.initAll(apiKey, {
      serverZone: 'EU',
      analytics: { autocapture: true },
      sessionReplay: { sampleRate: 1 },
    });
    amplitude.track('Viewed Home Page', { prompt_version: 'BA400.4' }); // helps improve this setup flow — safe to remove once you've verified the event lands
  }, []);

  return null;
}
