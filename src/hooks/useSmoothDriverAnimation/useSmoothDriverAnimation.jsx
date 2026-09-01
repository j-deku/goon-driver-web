import { useState, useEffect, useRef } from "react";

// Calculate bearing (direction in degrees)
const getBearing = (start, end) => {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;
  const dLng = endLng - startLng;

  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

// Linear interpolation
const lerp = (start, end, t) => start + (end - start) * t;

export const useSmoothDriverAnimation = (initialDrivers) => {
  const [drivers, setDrivers] = useState(
    initialDrivers.map((d) => ({ ...d, rotation: 0 }))
  );

  const animationFrameRef = useRef(null);

  // Animate driver positions gradually
  const animateDrivers = (oldDrivers, newDrivers, duration = 2000) => {
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setDrivers(
        oldDrivers.map((driver, idx) => {
          const target = newDrivers[idx];
          const lat = lerp(driver.lat, target.lat, progress);
          const lng = lerp(driver.lng, target.lng, progress);

          return {
            ...driver,
            lat,
            lng,
            rotation: getBearing({ lat: driver.lat, lng: driver.lng }, target),
          };
        })
      );

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Simulate backend updates every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      const newDrivers = drivers.map((driver) => {
        const randomOffset = () => (Math.random() - 0.5) * 0.002; // small step
        return {
          ...driver,
          lat: driver.lat + randomOffset(),
          lng: driver.lng + randomOffset(),
        };
      });
      animateDrivers([...drivers], newDrivers);
    }, 5000);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drivers]);

  return [drivers, setDrivers];
};
