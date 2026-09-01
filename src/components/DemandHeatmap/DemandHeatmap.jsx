import React, { useMemo } from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import './DemandHeatmap.css'

/**
 * DemandHeatmap
 * --------------
 * google.maps.visualization.HeatmapLayer was removed by Google in Maps JS
 * API v3.65 (May 2026) — see https://developers.google.com/maps/deprecations.
 * Google's own suggested replacement is a deck.gl overlay, which pulls in
 * several new dependencies (@deck.gl/core, @deck.gl/aggregation-layers,
 * @deck.gl/google-maps). For a "how busy is this area" driver view, that's
 * more machinery than the job needs, so this renders soft, color-graded
 * glow blobs from the same [{lat,lng,weight}] data using AdvancedMarker —
 * zero new dependencies, and it re-projects correctly on pan/zoom for free
 * because the Maps SDK positions AdvancedMarkers itself.
 *
 * If you later want true kernel-density smoothing (blobs that merge and
 * contour like a real heatmap) rather than overlapping glows, swap this
 * component for a deck.gl HeatmapLayer + GoogleMapsOverlay — the `points`
 * prop shape is already compatible with deck.gl's format.
 */
const DemandHeatmap = ({ points, visible = true }) => {
  const blobs = useMemo(() => {
    if (!points || points.length === 0) return [];

    const maxWeight = Math.max(...points.map((p) => p.weight ?? 1), 1);

    return points.map((p, i) => {
      const w = Math.min(1, (p.weight ?? 1) / maxWeight);
      return {
        key: p.id ?? `${p.lat}-${p.lng}-${i}`,
        position: { lat: p.lat, lng: p.lng },
        weight: w,
        size: 70 + w * 110, // px
        color: weightToColor(w),
      };
    });
  }, [points]);

  if (!visible || blobs.length === 0) return null;

  return (
    <>
      {blobs.map((blob) => (
        <AdvancedMarker key={blob.key} position={blob.position} zIndex={100}>
          <div
            className="heat-blob"
            style={{
              width: blob.size,
              height: blob.size,
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 72%)`,
              opacity: 0.4 + blob.weight * 0.35,
            }}
          />
        </AdvancedMarker>
      ))}
    </>
  );
};

// Blue (low demand) -> green -> amber -> red (high demand)
const STOPS = [
  { at: 0, rgb: [25, 118, 210] },
  { at: 0.5, rgb: [0, 200, 83] },
  { at: 0.8, rgb: [255, 193, 7] },
  { at: 1, rgb: [211, 47, 47] },
];

function weightToColor(w) {
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (w >= a.at && w <= b.at) {
      const t = (w - a.at) / (b.at - a.at || 1);
      const rgb = a.rgb.map((c, idx) => Math.round(c + (b.rgb[idx] - c) * t));
      return `rgb(${rgb.join(",")})`;
    }
  }
  return `rgb(${STOPS[STOPS.length - 1].rgb.join(",")})`;
}

export default DemandHeatmap;