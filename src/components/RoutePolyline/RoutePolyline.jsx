import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

/**
 * RoutePolyline
 * -------------
 * Requests a driving route between `origin` and `destination` via the
 * Directions service and renders it. Calls `onRoute({ etaMinutes, distanceKm })`
 * whenever a new route is computed, so the parent can show an ETA banner.
 *
 * Re-requests the route when the destination changes; re-uses the same
 * DirectionsRenderer instance so the line updates in place instead of
 * flickering.
 */
const RoutePolyline = ({ origin, destination, color = "#1976d2", onRoute }) => {
  const map = useMap();
  const rendererRef = useRef(null);
  const serviceRef = useRef(null);

  useEffect(() => {
    if (!map || !window.google?.maps) return;

    if (!rendererRef.current) {
      rendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: color,
          strokeWeight: 5,
          strokeOpacity: 0.9,
        },
      });
      rendererRef.current.setMap(map);
    }
    if (!serviceRef.current) {
      serviceRef.current = new window.google.maps.DirectionsService();
    }

    return () => {
      rendererRef.current?.setMap(null);
      rendererRef.current = null;
    };
  }, [map, color]);

  useEffect(() => {
    if (!map || !origin || !destination || !serviceRef.current) return;

    serviceRef.current.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status !== "OK" || !result) return;

        rendererRef.current?.setDirections(result);

        const leg = result.routes?.[0]?.legs?.[0];
        if (leg && onRoute) {
          onRoute({
            etaMinutes: Math.round(leg.duration.value / 60),
            distanceKm: Math.round((leg.distance.value / 1000) * 10) / 10,
          });
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

  return null;
};

export default RoutePolyline;