// useMapInteraction.js
import { useState, useCallback } from 'react';

export const useMapInteraction = (initialCenter) => {
  const [mapOpen, setMapOpen] = useState(false);
  const [mapField, setMapField] = useState(null); // 'pickup' or 'destination'
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapPosition, setMapPosition] = useState(initialCenter); // Position of the marker

  const openMap = useCallback((field, initialCoords) => {
    setMapField(field);
    setMapCenter(initialCoords || initialCenter);
    setMapPosition(initialCoords || initialCenter);
    setMapOpen(true);
  }, [initialCenter]);

  const closeMap = useCallback(() => {
    setMapOpen(false);
    setMapField(null);
  }, []);

  const handleMapClick = useCallback((event) => {
    if (event.detail.latLng) {
      setMapPosition(event.detail.latLng.toJSON());
    }
  }, []);

  return {
    mapOpen,
    mapField,
    mapCenter,
    mapPosition,
    openMap,
    closeMap,
    handleMapClick,
  };
};
