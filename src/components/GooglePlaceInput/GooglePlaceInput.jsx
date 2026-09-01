import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { Box, CircularProgress, TextField, Typography } from "@mui/material";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const GooglePlaceInput = forwardRef(function GooglePlaceInput(
  {
    label,
    placeholder,
    value,
    onChange,
    required = false,
    disabled = false,
  },
  ref
) {
  const containerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const listenerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useImperativeHandle(ref, () => ({
    focus() {
      const input =
        containerRef.current?.querySelector("input");

      input?.focus();
    },
  }));

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!API_KEY) {
        setError(
          "Google Maps API key is not configured."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        setOptions({
          key: API_KEY,
          v: "weekly",
        });

        await importLibrary("core");

        if (!mounted) {
          return;
        }

        const {
          PlaceAutocompleteElement,
        } = await window.google.maps.importLibrary(
          "places"
        );

        if (!mounted || !containerRef.current) {
          return;
        }

        const autocomplete =
          new PlaceAutocompleteElement();

        autocomplete.placeholder =
          placeholder || `Enter ${label.toLowerCase()}...`;

        autocomplete.disabled = disabled;

        autocomplete.style.width = "100%";

        /*
         * Optional:
         * Restrict suggestions to Ghana.
         *
         * Remove this if your riders can create
         * rides internationally.
         */
        autocomplete.includedRegionCodes = ["gh"];

        autocompleteRef.current = autocomplete;

        containerRef.current.innerHTML = "";

        containerRef.current.appendChild(
          autocomplete
        );

        listenerRef.current =
          async (event) => {
            try {
              const place =
                event.placePrediction.toPlace();

              await place.fetchFields({
                fields: [
                  "displayName",
                  "formattedAddress",
                  "location",
                  "id",
                ],
              });

              const location = place.location;

              const selectedPlace = {
                label:
                  place.formattedAddress ||
                  place.displayName ||
                  "",
                placeId: place.id || null,
                displayName:
                  place.displayName || "",
                formattedAddress:
                  place.formattedAddress || "",
                latitude:
                  location?.lat?.() ?? null,
                longitude:
                  location?.lng?.() ?? null,
              };

              onChange(selectedPlace);
            } catch (selectionError) {
              console.error(
                "Failed to process selected place:",
                selectionError
              );

              setError(
                "Unable to read the selected location."
              );
            }
          };

        autocomplete.addEventListener(
          "gmp-select",
          listenerRef.current
        );

        setLoading(false);
      } catch (loadError) {
        console.error(
          "Google Maps initialization failed:",
          loadError
        );

        if (!mounted) {
          return;
        }

        setError(
          "Google Maps could not be loaded. Check your API key, billing, API restrictions, and allowed domains."
        );

        setLoading(false);
      }
    };

    initialize();

    return () => {
      mounted = false;

      if (
        autocompleteRef.current &&
        listenerRef.current
      ) {
        autocompleteRef.current.removeEventListener(
          "gmp-select",
          listenerRef.current
        );
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      autocompleteRef.current = null;
      listenerRef.current = null;
    };
  }, [disabled, label, onChange, placeholder]);

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ mb: 0.75 }}
      >
        {label}
        {required && " *"}
      </Typography>

      <Box
        ref={containerRef}
        sx={{
          position: "relative",

          "& gmp-place-autocomplete": {
            width: "100%",
            display: "block",
            color:"#171717",
            backgroundColor:"whitesmoke",
            colorScheme: "light"
          },

          "& input": {
            width: "100%",
            minHeight: "56px",
            boxSizing: "border-box",
            backgroundColor:"white",
            color:"black",
            outline: "1px solid #c4c4c4",
            border:"none",
            borderRadius: "4px",
            padding: "0 14px",
            fontSize: "16px",
            fontFamily: "inherit",
          },

          "& input:focus": {
            borderColor: "#1976d2",
            borderWidth: "2px",
          },
        }}
      />

      {loading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 1,
          }}
        >
          <CircularProgress size={16} />
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Loading location search...
          </Typography>
        </Box>
      )}

      {error && (
        <Typography
          variant="caption"
          color="error"
          sx={{
            display: "block",
            mt: 1,
          }}
        >
          {error}
        </Typography>
      )}

      {value?.formattedAddress && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 0.5,
          }}
        >
          Selected: {value.formattedAddress}
        </Typography>
      )}
    </Box>
  );
});

export default GooglePlaceInput;