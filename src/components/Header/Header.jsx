/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Switch,
  Typography,
  Avatar,
  Button,
  Badge,
} from "@mui/material";
import { FaCar, FaCoins, FaRoad } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import "./Header.css";
import { Map, Circle } from "@vis.gl/react-google-maps";
import DriverMarker from "../../components/DriverMarker/DriverMarker";
import "../../components/DriverMarker/DriverMarker.css";
import useDriverLocation from "../../hooks/DriverHook/UseDriverLocation/UseDriverLocation";
import useNearbyRideRequests from "../../hooks/DriverHook/UseNearbyRideRequests/UseNearbyRideRequests";
import axiosInstanceDriver from "../../../axiosInstanceDriver";

const DriverAccuracyCircle = ({ position, accuracy, warning }) => {
  if (!position || !accuracy) return null;

  return (
    <Circle
      center={position}
      radius={accuracy}
      options={{
        strokeColor: warning ? "#d32f2f" : "#3388ff",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: warning ? "#d32f2f" : "#3388ff",
        fillOpacity: 0.12,
        clickable: false,
      }}
    />
  );
};

const DriverLocationMap = ({
  position,
  accuracy,
  accuracyWarning,
}) => {
  const GOOGLE_MAP_ID =
    import.meta.env.VITE_GOOGLE_MAP_ID;

  if (!position) {
    return (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#eef1f5",
        }}
      >
        <Typography>
          Fetching location...
        </Typography>
      </Box>
    );
  }

  return (
    <Map
      mapId={GOOGLE_MAP_ID}
      defaultCenter={position}
      defaultZoom={16}
      gestureHandling="greedy"
      disableDefaultUI={true}
      zoomControl={true}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <DriverAccuracyCircle
        position={position}
        accuracy={accuracy}
        warning={accuracyWarning}
      />

      <DriverMarker
        position={position}
      />
    </Map>
  );
};


const Header = () => {
  const navigate = useNavigate();
  const driverId = Number(localStorage.getItem("driverId"));
  const { position, accuracy, accuracyWarning } = useDriverLocation(driverId);

  const [isOnline, setIsOnline] = useState(null); // null until we know the real value
  const [stats, setStats] = useState({
    totalRides: 0,
    totalCompleted: 0,
    totalEarnings: 0,
  });

  const { requests } = useNearbyRideRequests(driverId, position, {
    enabled: !!isOnline,
    intervalMs: 6000,
  });

  // Toggle Online/Offline — no driverId in the URL, the backend identifies
  // the driver from the auth cookie via #[CurrentUser].
  const handleToggle = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    try {
      await axiosInstanceDriver.patch(
        `/api/driver/status`,
        { isOnline: newStatus },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
      setIsOnline(!newStatus);
    }
  };

  // Fetch real online/offline status on mount — previously this was
  // hardcoded to `true`, which is why toggling off and refreshing always
  // showed "online" again regardless of what was actually saved.
  useEffect(() => {
    const fetchOnlineStatus = async () => {
      try {
        const res = await axiosInstanceDriver.get(`/api/driver/me`, {
          withCredentials: true,
        });
        setIsOnline(!!res.data?.driver?.isOnline);
      } catch (err) {
        console.error("Failed to load driver status", err);
        setIsOnline(false); // fail safe: don't claim to be online if we don't know
      }
    };
    fetchOnlineStatus();
  }, []);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstanceDriver.get(`/api/driver/stats`, {
          withCredentials: true,
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };
    fetchStats();
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f9fafc" }} className="bg-header">
      <Grid container spacing={3}>
        {/* Completed Rides */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #FFF7E5, #FFE3B3)",
                height: 230,
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar
                  sx={{
                    mx: "auto",
                    bgcolor: "rgba(255, 193, 7, 0.2)",
                    color: "#E68900",
                    width: 70,
                    height: 70,
                  }}
                >
                  <FaCar size={40} />
                </Avatar>
                <Typography variant="h4" fontWeight={700} mt={2}>
                  {stats.totalCompleted}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Completed Rides
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Total Rides */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={1}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #E6F0FF, #C9DBFF)",
                height: 230,
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar
                  sx={{
                    mx: "auto",
                    bgcolor: "rgba(33, 150, 243, 0.2)",
                    color: "#2196F3",
                    width: 70,
                    height: 70,
                  }}
                >
                  <FaRoad size={40} />
                </Avatar>
                <Typography variant="h4" fontWeight={700} mt={2}>
                  {stats.totalRides}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Total Rides
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Earnings */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={2}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #E2FFE5, #B5FFBD)",
                height: 230,
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar
                  sx={{
                    mx: "auto",
                    bgcolor: "rgba(76, 175, 80, 0.2)",
                    color: "#1BB93E",
                    width: 70,
                    height: 70,
                  }}
                >
                  <FaCoins size={40} />
                </Avatar>
                <Typography variant="h4" fontWeight={700} mt={2}>
                  ${stats.totalEarnings}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Today's Earnings
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Online/Offline */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={3}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background: isOnline
                  ? "linear-gradient(135deg, #E0F7FA, #B2EBF2)"
                  : "linear-gradient(135deg, #FCE4EC, #F8BBD0)",
                height: 230,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ textAlign: "center", pt: 2, fontFamily: "Sans-serif" }}
              >
                Status
              </Typography>
              <CardContent
                sx={{
                  textAlign: "center",
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: "100%",
                  mt: -3,
                }}
              >
                <Switch
                  checked={!!isOnline}
                  onChange={handleToggle}
                  size="medium"
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#00C853" },
                    p: 1,
                  }}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 1 }}>
                  <span className={`status-dot ${isOnline ? "is-online" : "is-offline"}`} />
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color={isOnline ? "green" : "red"}
                  >
                    {isOnline ? "You're Online" : "You're Offline"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Map Card */}
        <Grid item xs={12} md={12}>
          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={4}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                height: 300,
                background: "linear-gradient(135deg, #E8EAF6, #C5CAE9)",
                position: "relative",
              }}
            >
              <CardContent
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Current Location
                    </Typography>
                    {isOnline && (
                      <span className="live-chip">
                        <span className="live-chip__dot" /> LIVE
                      </span>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {requests.length > 0 && (
                      <Badge badgeContent={requests.length} color="error">
                        <Typography variant="body2" sx={{ color: "#1976d2", fontWeight: 600 }}>
                          nearby
                        </Typography>
                      </Badge>
                    )}
                    <Button
                      variant="text"
                      size="small"
                      sx={{ textTransform: "none", color: "#1976d2" }}
                      onClick={() => navigate("/driver-map")}
                    >
                      View All
                    </Button>
                  </Box>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    overflow: "hidden",
                    position: "relative",
                    minHeight: 220,
                  }}
                >
                  <DriverLocationMap
                    position={position}
                    accuracy={accuracy}
                    accuracyWarning={accuracyWarning}
                  />

                  {accuracy && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#fff",
                        borderRadius: "8px",
                        px: 1,
                        py: 0.2,
                        fontSize: 13,
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        color: accuracyWarning ? "red" : "#333",
                        zIndex: 10,
                      }}
                    >
                      Accuracy: ±{Math.round(accuracy)} m
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Header;