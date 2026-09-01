import { useEffect, useRef, useState, useCallback } from "react";
import axiosInstanceDriver from "../../../../axiosInstanceDriver";
// Adjust depth to match hooks/DriverHook/UseNearbyRideRequests/UseNearbyRideRequests.js

/**
 * useNearbyRideRequests
 * ----------------------
 * Polls GET /api/driver/ride-requests/nearby (no driverId in the URL — the
 * backend identifies the driver from the auth cookie via #[CurrentUser])
 * and keeps a local list of pending booking requests on the driver's own
 * rides. These are pending passenger bookings, not time-limited dispatch
 * pings — there's no expiry, so there's no countdown. A request leaves the
 * list once you approve/decline it (removeRequest) or a later poll no
 * longer includes it.
 *
 * Response shape per request, matching DriverBookingService::getNearbyPendingRequests:
 * {
 *   requestId,      // "{bookingId}-{rideId}" — pass to accept/decline
 *   bookingId, rideId,
 *   estFare, passengers, distanceKm (nullable), requestedAt (ISO string),
 *   pickup:  { lat, lng, address },
 *   dropoff: { lat, lng, address }
 * }
 */
export default function useNearbyRideRequests(
  driverId, // kept for call-site compatibility; no longer sent to the backend
  position,
  { intervalMs = 5000, enabled = true } = {}
) {
  const [requests, setRequests] = useState([]);
  const timerRef = useRef(null);

  const fetchRequests = useCallback(async () => {
    if (!position || !enabled) return;
    try {
      const res = await axiosInstanceDriver.get(
        "/api/driver/ride-requests/nearby",
        {
          params: { lat: position.lat, lng: position.lng },
          withCredentials: true,
        }
      );
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load nearby ride requests", err);
    }
  }, [position?.lat, position?.lng, enabled]);

  useEffect(() => {
    fetchRequests();
    if (!enabled) return;
    timerRef.current = setInterval(fetchRequests, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [fetchRequests, intervalMs, enabled]);

  const removeRequest = useCallback((requestId) => {
    setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
  }, []);

  return { requests, refetch: fetchRequests, removeRequest };
}