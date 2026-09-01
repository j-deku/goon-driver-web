/* eslint-disable no-unused-vars */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Typography, Button, Chip } from "@mui/material";
import { FaMapMarkerAlt, FaFlagCheckered } from "react-icons/fa";


const RideRequestPanel = ({
  requests,
  selectedId,
  onSelect,
  onAccept,
  onDecline,
  activeRide,
  onAdvanceRide,
}) => {
  if (activeRide) {
    return <ActiveRideCard ride={activeRide} onAdvance={onAdvanceRide} />;
  }

  if (!requests || requests.length === 0) return null;

  return (
    <Box className="request-tray">
      <AnimatePresence>
        {requests.map((req) => (
          <RequestCard
            key={req.requestId}
            request={req}
            isSelected={req.requestId === selectedId}
            onSelect={() => onSelect(req.requestId)}
            onAccept={() => onAccept(req.requestId)}
            onDecline={() => onDecline(req.requestId)}
          />
        ))}
      </AnimatePresence>
    </Box>
  );
};

const RequestCard = ({ request, isSelected, onSelect, onAccept, onDecline }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.25 }}
      className={`request-card ${isSelected ? "is-selected" : ""}`}
      onClick={onSelect}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight={700}>
          ${request.estFare}
        </Typography>
        <Chip
          size="small"
          label={
            request.distanceKm != null
              ? `${request.distanceKm} km away`
              : timeAgo(request.requestedAt)
          }
          sx={{ bgcolor: "rgba(25,118,210,0.1)", color: "#1976d2", fontWeight: 600 }}
        />
      </Box>

      {request.passengers != null && (
        <Typography variant="caption" color="text.secondary">
          {request.passengers} passenger{request.passengers === 1 ? "" : "s"}
        </Typography>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
        <FaMapMarkerAlt color="#1976d2" size={13} />
        <Typography variant="body2" color="text.secondary" noWrap>
          {request.pickup.address}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
        <FaFlagCheckered color="#00c853" size={13} />
        <Typography variant="body2" color="text.secondary" noWrap>
          {request.dropoff.address}
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
        Requested {timeAgo(request.requestedAt)}
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDecline();
          }}
        >
          Decline
        </Button>
        <Button
          fullWidth
          variant="contained"
          size="small"
          sx={{ bgcolor: "#1976d2" }}
          onClick={(e) => {
            e.stopPropagation();
            onAccept();
          }}
        >
          Approve
        </Button>
      </Box>
    </motion.div>
  );
};

// Real RideStatus values (see App\Enum\RideStatus) — SCHEDULED/ASSIGNED are
// the pre-trip states, handled elsewhere; this panel only shows once a trip
// is actually underway.
const STAGE_COPY = {
  DRIVER_EN_ROUTE: { label: "Heading to pickup", action: "Arrived at pickup" },
  ARRIVED: { label: "Waiting for rider", action: "Start trip" },
  IN_PROGRESS: { label: "Trip in progress", action: "Complete trip" },
};

const ActiveRideCard = ({ ride, onAdvance }) => {
  const copy = STAGE_COPY[ride.stage];
  if (!copy) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="active-ride-card"
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            {copy.label}
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            {ride.stage === "IN_PROGRESS" ? ride.dropoff.address : ride.pickup.address}
          </Typography>
        </Box>
        {ride.etaMinutes != null && (
          <Chip
            label={`${ride.etaMinutes} min`}
            sx={{ bgcolor: "rgba(0,200,83,0.12)", color: "#00c853", fontWeight: 700 }}
          />
        )}
      </Box>

      <Button
        fullWidth
        variant="contained"
        size="large"
        sx={{ mt: 2, bgcolor: "#1976d2", borderRadius: 2, py: 1.2 }}
        onClick={onAdvance}
      >
        {copy.action}
      </Button>
    </motion.div>
  );
};

function timeAgo(isoString) {
  if (!isoString) return "just now";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default RideRequestPanel;