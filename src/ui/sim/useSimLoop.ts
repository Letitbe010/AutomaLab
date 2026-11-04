import { useEffect } from 'react';
import { useSim } from './simStore';

/** Drives the simulation with requestAnimationFrame while it runs (≤ 60 Hz snapshots). */
export function useSimLoop(): void {
  const running = useSim((s) => s.running && s.sim !== null);
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    let raf = requestAnimationFrame(function frame(now) {
      useSim.getState().advance(now - last);
      last = now;
      raf = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(raf);
  }, [running]);
}
