import { useEffect, useRef, useState } from "react";

/**
 * useSmoothedPosition
 * --------------------
 * Animates (glides) a lat/lng from its current rendered value toward a new
 * target over `duration` ms, using requestAnimationFrame. This is what makes
 * the driver marker "drive" smoothly between GPS updates instead of
 * teleporting every few seconds like a default marker would.
 *
 * @param {{lat:number,lng:number}|null} target
 * @param {number} [duration=800]
 * @returns {{lat:number,lng:number}|null}
 */
export default function useSmoothedPosition(target, duration = 800) {
  const [rendered, setRendered] = useState(target);
  const frameRef = useRef(null);
  const fromRef = useRef(target);
  const startRef = useRef(0);

  useEffect(() => {
    if (!target) return;

    // First fix: snap immediately, nothing to animate from
    if (!fromRef.current) {
      fromRef.current = target;
      setRendered(target);
      return;
    }

    const from = fromRef.current;
    startRef.current = performance.now();

    cancelAnimationFrame(frameRef.current);

    const step = (now) => {
      const t = Math.min(1, (now - startRef.current) / duration);
      const eased = easeOutCubic(t);

      setRendered({
        lat: from.lat + (target.lat - from.lat) * eased,
        lng: from.lng + (target.lng - from.lng) * eased,
      });

      if (t < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.lat, target?.lng, duration]);

  return rendered;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}