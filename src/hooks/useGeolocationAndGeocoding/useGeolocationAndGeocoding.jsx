import { useState, useRef, useEffect, useCallback } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

export const useGeolocationAndGeocoding = () => {
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const placesLib = useMapsLibrary('places');
  const geocoderRef = useRef(null);

  useEffect(() => {
    if (placesLib && !geocoderRef.current) {
      geocoderRef.current = new placesLib.Geocoder();
    }
  }, [placesLib]);

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation || !geocoderRef.current) {
      console.warn("Geolocation or Geocoder not available.");
      return null;
    }

    setFetchingLocation(true);
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const latlng = { lat: coords.latitude, lng: coords.longitude };
          geocoderRef.current.geocode({ location: latlng }, (results, status) => {
            setFetchingLocation(false);
            if (status === "OK" && results.length) {
              const human = results.find((r) => !r.types.includes("plus_code")) || results[0];
              resolve({ address: human.formatted_address, coords: latlng });
            } else {
              console.error("Geocoder failed with status:", status);
              resolve(null);
            }
          });
        },
        (error) => {
          setFetchingLocation(false);
          console.error("Geolocation error:", error);
          reject(error);
        }
      );
    });
  }, [geocoderRef]);

  const getAddressFromCoords = useCallback(async (latlng) => {
    if (!geocoderRef.current || !latlng) return null;

    return new Promise((resolve) => {
      geocoderRef.current.geocode({ location: latlng }, (results, status) => {
        if (status === "OK" && results[0]) {
          const addressObj = results.find(r => !r.types.includes("plus_code")) || results[0];
          resolve(addressObj.formatted_address);
        } else {
          console.error("Geocoder failed to find address for coords:", status);
          resolve(null);
        }
      });
    });
  }, [geocoderRef]);

  const getCoordsFromAddress = useCallback(async (address) => {
    if (!geocoderRef.current || !address) return null;

    return new Promise((resolve) => {
      geocoderRef.current.geocode({ address: address }, (results, status) => {
        if (status === "OK" && results[0]) {
          resolve(results[0].geometry.location.toJSON());
        } else {
          console.error("Geocoder failed to find coords for address:", status);
          resolve(null);
        }
      });
    });
  }, [geocoderRef]);

  return { fetchingLocation, getCurrentLocation, getAddressFromCoords, getCoordsFromAddress };
};