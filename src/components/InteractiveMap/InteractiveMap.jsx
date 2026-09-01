import React, { useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import PropTypes from 'prop-types';

const containerStyle = {
  width: '100%',
  height: '300px',
};

const InteractiveMap = ({ latitude, longitude }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const center = {
    lat: Number(latitude),
    lng: Number(longitude),
  };

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      // Create an AdvancedMarkerElement once the map is loaded
      // eslint-disable-next-line no-undef
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: center,
        // Optional: customize marker appearance
        content: `<div style="background:#fff;border:1px solid #ccc;border-radius:50%;padding:5px;">Marker</div>`,
      });
    }
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [isLoaded, center]);

  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onLoad={(map) => {
        mapRef.current = map;
      }}
    />
  );
};

InteractiveMap.propTypes = {
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
};

export default React.memo(InteractiveMap);
