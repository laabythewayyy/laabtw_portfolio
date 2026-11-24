'use client';

import { useEffect } from 'react';
import { startLightning } from '@/lib/lightning/engine';

/** The page-wide lightning layers. The avatar ring draws on #zap inside HeroArt. */
export default function Lightning() {
  useEffect(() => startLightning(), []);
  return (
    <>
      <div id="glow" aria-hidden="true"></div>
      <canvas id="sky" aria-hidden="true"></canvas>
      <div id="flash" aria-hidden="true"></div>
      <canvas id="fx" aria-hidden="true"></canvas>
    </>
  );
}
