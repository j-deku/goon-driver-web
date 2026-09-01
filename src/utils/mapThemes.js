/**
 * Map visual themes. Passed to the <Map options={{ styles }}> prop.
 * `day` is intentionally light/minimal (roads pop, everything else recedes)
 * so ride pins and the heatmap stay legible. `night` is a low-glare theme
 * for evening/night driving so the map doesn't blind the driver.
 */

export const dayTheme = [
  { elementType: "geometry", stylers: [{ color: "#f5f6f8" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#e7ebf3" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e2e5ea" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#cfe0f7" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#dde1e7" }],
  },
];

export const nightTheme = [
  { elementType: "geometry", stylers: [{ color: "#14151c" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8f9c" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#14151c" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#26283333" }, { color: "#262833" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#33364a" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1b1c24" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1a2b" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2a2c36" }],
  },
];