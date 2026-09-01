/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Snackbar,
  Alert,
  IconButton,
  Typography,
  Box,
  Slide,
  Chip,
} from "@mui/material";
import { WifiOff, Wifi, Refresh, Close, Replay } from "@mui/icons-material";
import { Howl } from "howler";
import useOfflineQueueBootstrap from "../../../hooks/useOfflineQueueBootstrap/useOfflineQueueBootstrap";

const AUTO_HIDE_MS = 2500;

const NetworkStatusSnackbar = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [offlineStartTime, setOfflineStartTime] = useState(null);

  const { queuedCount, retryNow } = useOfflineQueueBootstrap();

  const onlineTone = useRef(
    new Howl({ src: ["/sounds/bubble-pop.mp3"], volume: 2 })
  ).current;

  const SlideTransition = (props) => <Slide {...props} direction="up" />;

  const showStatus = useCallback((message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
    window.setTimeout(() => setShowSnackbar(false), AUTO_HIDE_MS);
  }, []);

  // One-time verification to detect "captive router / no internet" cases
  const verifyActualConnection = useCallback(async () => {
    try {
      await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-store",
      });

      // If browser says offline, respect it.
      if (!navigator.onLine) {
        handleOffline();
      }
    } catch {
      handleOffline();
    }
    
  }, []);

  const handleOnline = useCallback(() => {
    setIsOnline(true);

    const offlineDuration =
      offlineStartTime != null
        ? ((Date.now() - offlineStartTime) / 1000).toFixed(1)
        : 0;

    if (offlineDuration > 0) {
      showStatus(
        `Back online after ${offlineDuration}s${
          queuedCount > 0 ? ` • retrying ${queuedCount} queued request(s)…` : ""
        }`,
        "success"
      );
    } else {
      showStatus("You are back online", "success");
    }

    onlineTone.play();
    setOfflineStartTime(null);

    // Flush queued API calls
    retryNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offlineStartTime, queuedCount, retryNow, showStatus]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setOfflineStartTime(Date.now());
    showStatus("You are currently offline", "warning");
  }, [showStatus]);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial verification
    verifyActualConnection();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline, verifyActualConnection]);

  const handleRefresh = () => window.location.reload();
  const handleClose = () => setShowSnackbar(false);

  const handleRetryNow = () => {
    if (isOnline) {
      retryNow();
      showStatus("Retrying queued requests…", "info");
    } else {
      showStatus("Retry will auto-run when you're back online", "warning");
    }
  };

  return (
    <Snackbar
      open={showSnackbar}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      TransitionComponent={SlideTransition}
      sx={{
        "& .MuiSnackbarContent-root": {
          minWidth: 320,
          maxWidth: 420,
        },
      }}
    >
      <Alert
        severity={snackbarSeverity}
        sx={{
          width: "100%",
          backgroundColor: "#1a237e",
          color: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
          "& .MuiAlert-icon": {
            color: isOnline ? "#4caf50" : "#ff9800",
          },
          "& .MuiAlert-message": {
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        },
        }}
        icon={isOnline ? <Wifi sx={{ fontSize: 40 }} /> : <WifiOff sx={{ fontSize: 40 }} />}
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {queuedCount > 0 && (
              <Chip
                label={`${queuedCount} pending`}
                onClick={handleRetryNow}
                size="small"
                variant="outlined"
                sx={{
                  color: "#bbdefb",
                  borderColor: "#bbdefb",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
                }}
              />
            )}

            <IconButton
              size="small"
              onClick={handleRetryNow}
              sx={{
                color: "#ffffff",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
              }}
              title="Retry all queued requests now"
            >
              <Replay fontSize="small" />
            </IconButton>

            {!isOnline && (
              <IconButton
                size="small"
                onClick={handleRefresh}
                sx={{
                  color: "#ffffff",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                }}
                title="Reload page"
              >
                <Refresh fontSize="small" />
              </IconButton>
            )}

            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                color: "#ffffff",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              fontSize: "14px",
              color: "#ffffff",
            }}
          >
            {snackbarMessage}
          </Typography>

          {!isOnline && (
            <Typography
              variant="body2"
              sx={{
                ml: 2,
                color: "#bbdefb",
                fontSize: "13px",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={handleRefresh}
            >
              Refresh
            </Typography>
          )}
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default NetworkStatusSnackbar;
