/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, IconButton, Chip, Typography, Fab, Tooltip, Button } from "@mui/material";
import {
  FaArrowLeft,
  FaMoon,
  FaSun,
  FaFire,
  FaLocationArrow,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Map, Circle } from "@vis.gl/react-google-maps";

import DriverMarker from "../../components/DriverMarker/DriverMarker";
import RideRequestMarker from "../../components/RideRequestMarker/RideRequestMarker";
import RideRequestPanel from "../../components/RideRequestPanel/RideRequestPanel";
import DemandHeatmap from "../../components/DemandHeatmap/DemandHeatmap";
import RoutePolyline from "../../components/RoutePolyline/RoutePolyline";

import "../../components/DriverMarker/DriverMarker.css";
import "../../components/RideRequestMarker/RideRequestMarker.css";
import "../../components/RideRequestPanel/RideRequestPanel.css";
import "../../components/DemandHeatmap/DemandHeatmap.css";
import "./DriverMapPage.css";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import useDriverLocation from "../../hooks/DriverHook/UseDriverLocation/UseDriverLocation";
import useNearbyRideRequests from "../../hooks/DriverHook/UseNearbyRideRequests/UseNearbyRideRequests";
import { dayTheme, nightTheme } from "../../utils/mapThemes";

const DriverMapPage = () => {
  const navigate = useNavigate();
  const driverId = Number(localStorage.getItem("driverId"));
  const { position, accuracy, accuracyWarning } = useDriverLocation(driverId);
  const mapRef = useRef(null);

  const [isOnline, setIsOnline] = useState(null); // null until we know the real value
  const [nightMode, setNightMode] = useState(() => isNightNow());
  const [heatmapOn, setHeatmapOn] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [todaysRides, setTodaysRides] = useState([]);

  // Fetch real online/offline status on mount — see the same fix in Header.jsx.
  useEffect(() => {
    const fetchOnlineStatus = async () => {
      try {
        const res = await axiosInstanceDriver.get("/api/driver/me", {
          withCredentials: true,
        });
        setIsOnline(!!res.data?.driver?.isOnline);
      } catch (err) {
        console.error("Failed to load driver status", err);
        setIsOnline(false);
      }
    };
    fetchOnlineStatus();
  }, []);

  const showRequests = !!isOnline && !activeRide;

  const { requests, removeRequest } = useNearbyRideRequests(driverId, position, {
    enabled: showRequests,
    intervalMs: 5000,
  });

  // Derive demand glow points from currently-pending pickup locations —
  // there is no separate demand-heatmap endpoint (see file header note).
  const heatmapPoints = useMemo(
    () =>
      requests
        .filter((r) => r.pickup?.lat != null && r.pickup?.lng != null)
        .map((r) => ({ lat: r.pickup.lat, lng: r.pickup.lng, weight: 1 })),
    [requests]
  );

  // Today's already-approved rides that haven't started yet.
  const fetchTodaysRides = useCallback(async () => {
    if (activeRide) return;
    try {
      const res = await axiosInstanceDriver.get("/api/driver/rides", {
        withCredentials: true,
      });
      const today = new Date().toDateString();
      const upcoming = (res.data?.rides || []).filter((r) => {
        const isToday = new Date(r.selectedDate).toDateString() === today;
        return isToday && (r.status === "SCHEDULED" || r.status === "ASSIGNED");
      });
      setTodaysRides(upcoming);
    } catch (err) {
      console.error("Failed to load today's rides", err);
    }
  }, [activeRide]);

  useEffect(() => {
    fetchTodaysRides();
    const id = setInterval(fetchTodaysRides, 30000);
    return () => clearInterval(id);
  }, [fetchTodaysRides]);

  const handleToggleOnline = useCallback(async () => {
    const next = !isOnline;
    setIsOnline(next);
    try {
      await axiosInstanceDriver.patch(
        "/api/driver/status",
        { isOnline: next },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to toggle status", err);
      setIsOnline(!next);
    }
  }, [isOnline]);

  const handleAccept = useCallback(
    async (requestId) => {
      try {
        await axiosInstanceDriver.post(
          `/api/driver/ride-requests/${requestId}/accept`,
          {},
          { withCredentials: true }
        );
        setSelectedRequestId(null);
        removeRequest(requestId);
        fetchTodaysRides(); // the approved ride may now be startable today
      } catch (err) {
        console.error("Failed to approve ride request", err);
      }
    },
    [removeRequest, fetchTodaysRides]
  );

  const handleDecline = useCallback(
    async (requestId) => {
      try {
        await axiosInstanceDriver.post(
          `/api/driver/ride-requests/${requestId}/decline`,
          {},
          { withCredentials: true }
        );
      } catch (err) {
        console.error("Failed to decline ride request", err);
      } finally {
        removeRequest(requestId);
      }
    },
    [removeRequest]
  );

  // Kicks off the live trip: SCHEDULED/ASSIGNED -> DRIVER_EN_ROUTE
  const handleStartTrip = useCallback(async (ride) => {
    try {
      await axiosInstanceDriver.patch(
        `/api/driver/rides/${ride.id}/status`,
        { status: "DRIVER_EN_ROUTE" },
        { withCredentials: true }
      );
      setActiveRide({
        id: ride.id,
        stage: "DRIVER_EN_ROUTE",
        pickup: toLatLngAddress(ride.pickup),
        dropoff: toLatLngAddress(ride.destination),
        etaMinutes: null,
      });
    } catch (err) {
      console.error("Failed to start trip", err);
    }
  }, []);

  const handleAdvanceRide = useCallback(async () => {
    if (!activeRide) return;

    const nextStage =
      activeRide.stage === "DRIVER_EN_ROUTE"
        ? "ARRIVED"
        : activeRide.stage === "ARRIVED"
        ? "IN_PROGRESS"
        : "COMPLETED";

    try {
      await axiosInstanceDriver.patch(
        `/api/driver/rides/${activeRide.id}/status`,
        { status: nextStage },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to update ride status", err);
      return; // don't advance local state if the backend call failed
    }

    if (nextStage === "COMPLETED") {
      setActiveRide(null);
      fetchTodaysRides();
    } else {
      setActiveRide((r) => ({ ...r, stage: nextStage }));
    }
  }, [activeRide, fetchTodaysRides]);

  const routeDestination = !activeRide
    ? null
    : activeRide.stage === "IN_PROGRESS"
    ? activeRide.dropoff
    : activeRide.pickup;

  return (
    <Box className="driver-map-page">
      <Map
        mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
        defaultCenter={position || { lat: 0, lng: 0 }}
        center={position || undefined}
        defaultZoom={16}
        gestureHandling="greedy"
        disableDefaultUI={true}
        styles={nightMode ? nightTheme : dayTheme}
        style={{ width: "100%", height: "100%" }}
      >
        {position && (
          <Circle
            center={position}
            radius={accuracy || 0}
            options={{
              strokeColor: accuracyWarning ? "#d32f2f" : "#3388ff",
              strokeOpacity: 0.7,
              strokeWeight: 2,
              fillColor: accuracyWarning ? "#d32f2f" : "#3388ff",
              fillOpacity: 0.1,
              clickable: false,
            }}
          />
        )}

        {position && <DriverMarker position={position} />}

        {!activeRide && heatmapOn && (
          <DemandHeatmap points={heatmapPoints} visible={heatmapOn} />
        )}

        {showRequests &&
          requests.map((req) => (
            <RideRequestMarker
              key={req.requestId}
              request={{ ...req, id: req.requestId }}
              isSelected={req.requestId === selectedRequestId}
              onSelect={setSelectedRequestId}
            />
          ))}

        {activeRide && position && routeDestination && (
          <RoutePolyline
            origin={position}
            destination={routeDestination}
            color={activeRide.stage === "IN_PROGRESS" ? "#00c853" : "#1976d2"}
            onRoute={({ etaMinutes }) =>
              setActiveRide((r) => (r ? { ...r, etaMinutes } : r))
            }
          />
        )}
      </Map>

      {/* Top bar */}
      <Box className="map-topbar">
        <IconButton className="glass-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </IconButton>

        {!activeRide && (
          <Chip
            label={isOnline ? "Online" : "Offline"}
            onClick={handleToggleOnline}
            sx={{
              fontWeight: 700,
              cursor: "pointer",
              bgcolor: isOnline ? "rgba(0,200,83,0.15)" : "rgba(211,47,47,0.12)",
              color: isOnline ? "#00c853" : "#d32f2f",
            }}
          />
        )}
      </Box>

      {/* ETA banner while on an active ride */}
      <AnimatePresence>
        {activeRide && activeRide.etaMinutes != null && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="eta-banner"
          >
            <Typography variant="body2" fontWeight={700}>
              {activeRide.stage === "IN_PROGRESS"
                ? `${activeRide.etaMinutes} min to drop-off`
                : `${activeRide.etaMinutes} min to pickup`}
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's approved rides waiting to start */}
      {!activeRide && todaysRides.length > 0 && (
        <Box className="today-rides-strip">
          {todaysRides.map((ride) => (
            <Box key={ride.id} className="today-ride-chip">
              <Typography variant="caption" fontWeight={700} noWrap>
                {ride.selectedTime} · {ride.pickupNorm}
              </Typography>
              <Button
                size="small"
                variant="contained"
                sx={{ bgcolor: "#1976d2", mt: 0.5 }}
                onClick={() => handleStartTrip(ride)}
              >
                Start Trip
              </Button>
            </Box>
          ))}
        </Box>
      )}

      {/* Floating action stack */}
      <Box className="map-fab-stack">
        <Tooltip title={nightMode ? "Day mode" : "Night mode"} placement="left">
          <Fab size="small" className="glass-fab" onClick={() => setNightMode((v) => !v)}>
            {nightMode ? <FaSun /> : <FaMoon />}
          </Fab>
        </Tooltip>
        {!activeRide && (
          <Tooltip title={heatmapOn ? "Hide demand" : "Show demand"} placement="left">
            <Fab
              size="small"
              className={`glass-fab ${heatmapOn ? "is-active" : ""}`}
              onClick={() => setHeatmapOn((v) => !v)}
            >
              <FaFire />
            </Fab>
          </Tooltip>
        )}
        <Tooltip title="Recenter" placement="left">
          <Fab
            size="small"
            className="glass-fab"
            onClick={() =>
                window.dispatchEvent(new Event("driver-map-recenter"))
              }
          >
            <FaLocationArrow />
          </Fab>
        </Tooltip>
      </Box>

      <RideRequestPanel
        requests={showRequests ? requests : []}
        selectedId={selectedRequestId}
        onSelect={setSelectedRequestId}
        onAccept={handleAccept}
        onDecline={handleDecline}
        activeRide={activeRide}
        onAdvanceRide={handleAdvanceRide}
      />
    </Box>
  );
};

// Ride.pickup / Ride.destination are stored as { latitude, longitude, address, ... }
function toLatLngAddress(location) {
  if (!location) return null;
  return {
    lat: location.latitude,
    lng: location.longitude,
    address: location.address || location.formatted || "Unknown location",
  };
}

function isNightNow() {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 6;
}

export default DriverMapPage;