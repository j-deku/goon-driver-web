import { useEffect, useRef, useState } from "react";
import axiosInstanceDriver from "../../../../axiosInstanceDriver"; // adjust to your actual relative path

const MIN_SEND_INTERVAL = 3000;
const MIN_MOVEMENT_METERS = 10;

// Location quality thresholds
const EXCELLENT_ACCURACY = 20;
const GOOD_ACCURACY = 50;
const ACCEPTABLE_ACCURACY = 100;

const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3;

  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;

  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(dLambda / 2) ** 2;

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const useDriverLocation = (driverId) => {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [accuracyWarning, setAccuracyWarning] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const lastPositionRef = useRef(null);
  const lastSentAtRef = useRef(0);
  const bestAccuracyRef = useRef(Infinity);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!driverId) {
      console.warn("[DriverLocation] Missing driver ID.");
      return;
    }

    if (!navigator.geolocation) {
      console.error("[DriverLocation] Geolocation is not supported.");
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    let mounted = true;

    console.log(
      "[DriverLocation] Starting high-accuracy location tracking:",
      driverId
    );

    // CHANGED: this used to be socket.emit("driverLocationUpdate", ...).
    // That socket was never consumed server-side (this app uses Symfony +
    // REST, not sockets), so no location was ever actually persisted
    // anywhere. This now PATCHes the real endpoint, which writes
    // DriverProfile.locationLat/locationLng/locationUpdatedAt.
    const sendLocation = async ({ lat, lng }) => {
      try {
        await axiosInstanceDriver.patch(
          "/api/driver/location",
          { lat, lng },
          { withCredentials: true }
        );
      } catch (err) {
        console.error("[DriverLocation] Failed to persist location:", err);
      }
    };

    const processLocation = (pos) => {
      if (!mounted) return;

      const { latitude, longitude, accuracy, speed, heading } = pos.coords;

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        console.warn("[DriverLocation] Invalid coordinates.");
        return;
      }

      setLocationError(null);
      setAccuracy(accuracy);

      const isExcellent = accuracy <= EXCELLENT_ACCURACY;
      const isGood = accuracy <= GOOD_ACCURACY;
      const isAcceptable = accuracy <= ACCEPTABLE_ACCURACY;

      setAccuracyWarning(!isGood);

      if (accuracy < bestAccuracyRef.current) {
        bestAccuracyRef.current = accuracy;
      }

      // Always update the UI position — see UseDriverLocation.fix.js's note
      // on why gating this on accuracy leaves the map stuck on devices
      // without GPS. Only the send-to-backend path below is quality-gated.
      const nextPosition = { lat: latitude, lng: longitude };
      setPosition(nextPosition);

      const previousPosition = lastPositionRef.current;
      lastPositionRef.current = nextPosition;

      const now = Date.now();
      let movedEnough = true;

      if (previousPosition) {
        const distance = getDistance(
          previousPosition.lat,
          previousPosition.lng,
          nextPosition.lat,
          nextPosition.lng
        );
        movedEnough = distance >= MIN_MOVEMENT_METERS;
      }

      const enoughTimePassed = now - lastSentAtRef.current >= MIN_SEND_INTERVAL;

      if (
        isExcellent ||
        isGood ||
        (isAcceptable && (movedEnough || enoughTimePassed))
      ) {
        if (movedEnough || enoughTimePassed) {
          lastSentAtRef.current = now;
          sendLocation({ lat: latitude, lng: longitude, accuracy, speed, heading });
        }
      }
    };

    const handleError = (error) => {
      if (!mounted) return;

      console.error("[DriverLocation] Geolocation error:", error);

      switch (error.code) {
        case error.PERMISSION_DENIED:
          setLocationError("Location permission was denied. Please allow location access.");
          break;
        case error.POSITION_UNAVAILABLE:
          setLocationError("Your device could not determine your current location.");
          break;
        case error.TIMEOUT:
          setLocationError("Location request timed out. Still trying...");
          break;
        default:
          setLocationError("Unable to determine your current location.");
      }

      setAccuracyWarning(true);
    };

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 30000,
    };

    navigator.geolocation.getCurrentPosition(processLocation, handleError, options);

    watchIdRef.current = navigator.geolocation.watchPosition(
      processLocation,
      handleError,
      options
    );

    return () => {
      mounted = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [driverId]);

  return { position, accuracy, accuracyWarning, locationError };
};

export default useDriverLocation;