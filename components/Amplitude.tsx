'use client';

import { useEffect } from 'react';
import * as amplitude from '@amplitude/unified';
import { visitorId } from '@/lib/visitorId';

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
      analytics: {
        autocapture: {
          elementInteractions: false,
          attribution: true,
          fileDownloads: true,
          formInteractions: true,
          pageViews: true,
          sessions: true,
          frustrationInteractions: true,
          networkTracking: true,
          webVitals: false,
        },
      },
      sessionReplay: { sampleRate: 1 },
    });

    const visitor = visitorId();
    if (visitor) amplitude.setUserId(visitor);

    amplitude.track('Viewed Home Page', { 'Prompt Version': 'BA400.4' }); // helps improve this setup flow — safe to remove once you've verified the event lands
  }, []);

  return null;
}
