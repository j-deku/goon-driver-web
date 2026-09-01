import { useEffect, useRef, useState } from "react";

/**
 * useDriverHeading
 * -----------------
 * Derives a smoothed compass heading (0-360°) for the driver marker from
 * successive GPS fixes, so the car icon rotates in the direction of travel
 * instead of snapping or jittering when the driver is stationary.
 *
 * @param {{lat:number,lng:number}|null} position - latest GPS position
 * @param {object} [opts]
 * @param {number} [opts.minDistanceMeters=3] - ignore fixes closer than this (GPS noise)
 * @param {number} [opts.smoothing=0.25] - 0-1, higher = snappier, lower = smoother
 * @returns {{ heading: number, speedKmh: number, isMoving: boolean }}
 */
export default function useDriverHeading(
  position,
  { minDistanceMeters = 3, smoothing = 0.25 } = {}
) {
  const [heading, setHeading] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const prevRef = useRef(null); // { lat, lng, t }

  useEffect(() => {
    if (!position) return;

    const now = performance.now();
    const prev = prevRef.current;

    if (prev) {
      const distance = haversineMeters(prev, position);

      if (distance >= minDistanceMeters) {
        const targetHeading = bearingBetween(prev, position);
        const dtSeconds = (now - prev.t) / 1000;

        setHeading((current) => smoothAngle(current, targetHeading, smoothing));
        if (dtSeconds > 0) {
          setSpeedKmh((distance / dtSeconds) * 3.6);
        }
        prevRef.current = { ...position, t: now };
      } else {
        // Driver essentially stationary — decay speed toward 0, keep heading as-is
        setSpeedKmh((s) => (s > 0.5 ? s * 0.7 : 0));
      }
    } else {
      prevRef.current = { ...position, t: now };
    }
  }, [position, minDistanceMeters, smoothing]);

  return { heading, speedKmh, isMoving: speedKmh > 1.5 };
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}
function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

function bearingBetween(a, b) {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function haversineMeters(a, b) {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

// Circular smoothing so 359° -> 2° doesn't spin the long way around
function smoothAngle(current, target, factor) {
  let diff = ((target - current + 540) % 360) - 180;
  return (current + diff * factor + 360) % 360;
}