import React, { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Box, 
  Chip,
  LinearProgress,
  Alert
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { socket } from "../../provider/DriverSocketProvider";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { selectIsDriverAuthenticated } from "../../features/driver/driverSlice";

const RideRequestModal = () => {
  const [pendingRide, setPendingRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const isAuthenticated = useSelector(selectIsDriverAuthenticated);

  // Initialize notification sound
  useEffect(() => {
    audioRef.current = new Audio('/clinking-glass.mp3'); // Add notification sound to public folder
    audioRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("❌ Driver not authenticated, not setting up listeners");
      return;
    }

    const handleRideRequest = (data) => {
      console.log("=== 🚨 MODAL RECEIVED RIDE REQUEST ===");
      console.log("📍 Booking ID:", data.bookingId);
      
      // Clear any existing error
      setError(null);
      
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      
      // Show toast notification with ride details
      toast.info(`🚨 New Ride Request: ${data.ride?.pickup} → ${data.ride?.destination}`);
      
      // Set the ride data to show modal
      setPendingRide({
        ...data.ride,
        bookingId: data.bookingId,
        rideId: data.rideId,
        timestamp: data.ride?.timestamp || new Date().toISOString()
      });
      
      // Start countdown timer
      setTimeLeft(30);
      startTimer();
    };

    const handleRideRequestExpired = (data) => {
      console.log("⏰ Ride request expired:", data);
      
      if (pendingRide && (
        pendingRide.bookingId === data.bookingId || 
        pendingRide.rideId === data.rideId
      )) {
        toast.warning("⏰ Ride request expired");
        setPendingRide(null);
        clearTimer();
      }
    };

    const handleConnectionError = () => {
      setError("Connection lost. Please check your internet connection.");
    };

    const handleReconnect = () => {
      setError(null);
      toast.success("🔌 Reconnected to server");
    };

    // Set up event listeners
    socket.on("rideRequest", handleRideRequest);
    socket.on("rideRequestExpired", handleRideRequestExpired);
    socket.on("connect_error", handleConnectionError);
    socket.on("reconnect", handleReconnect);
    
    console.log("✅ Modal is now listening for ride request events");
    
    return () => {
      // Clean up listeners
    //  socket.off("rideRequest", handleRideRequest);
      socket.off("rideRequestExpired", handleRideRequestExpired);
      socket.off("connect_error", handleConnectionError);
    //  socket.off("reconnect", handleReconnect);
      
      clearTimer();
      console.log("🧹 Modal cleaned up event listeners");
    };
  }, [isAuthenticated, pendingRide]);

  const startTimer = () => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setPendingRide(null);
          toast.warning("⏰ Ride request timed out");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const respondToRide = async (response) => {
    if (!pendingRide?.rideId && !pendingRide?._id) {
      toast.error("❌ Missing ride ID");
      return;
    }

    const rideId = pendingRide.rideId || pendingRide._id;
    setLoading(true);
    clearTimer();

    try {
      console.log(`📤 Responding to ride ${rideId} with: ${response}`);
      
      const res = await axiosInstanceDriver.post(
        "/api/driver/ride/respond",
        { 
          rideId, 
          response,
          bookingId: pendingRide.bookingId,
          timestamp: new Date().toISOString()
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setPendingRide(null);
        setTimeLeft(30);
        
        // Emit response to user
        if (pendingRide.bookingId) {
          socket.emit("rideResponse", {
            bookingId: pendingRide.bookingId,
            rideId,
            response,
            driverResponse: response,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        toast.error(res.data.message || "Failed to respond to ride");
        setError(res.data.message);
      }
    } catch (error) {
      console.error("❌ Error responding to ride:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Error responding to ride";
      
      toast.error(errorMessage);
      setError(errorMessage);
      
      // Don't close modal on error - let driver retry
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setPendingRide(null);
      clearTimer();
      setTimeLeft(30);
      setError(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeProgress = () => {
    return ((30 - timeLeft) / 30) * 100;
  };

  // Debug logging
  console.log("🔍 Modal render state:", {
    pendingRide: !!pendingRide,
    isAuthenticated,
    timeLeft,
    loading,
    error
  });

  return (
    <Dialog 
      open={!!pendingRide} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">🚨 New Ride Request</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={formatTime(timeLeft)}
              color={timeLeft <= 10 ? "error" : "primary"}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              {pendingRide?.timestamp && new Date(pendingRide.timestamp).toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={getTimeProgress()}
          color={timeLeft <= 10 ? "error" : "primary"}
          sx={{ mt: 1 }}
        />
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {pendingRide ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Pickup Location
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                📍 {pendingRide.pickup}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Destination
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                🎯 {pendingRide.destination}
              </Typography>
            </Box>
            
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Fare
                </Typography>
                <Typography variant="h6" color="primary">
                  ${pendingRide.price?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
              
              <Box flex={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Passengers
                </Typography>
                <Typography variant="body1">
                  👥 {pendingRide.passengers || 1}
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  📅 {pendingRide.selectedDate ? 
                    new Date(pendingRide.selectedDate).toLocaleDateString() : 
                    'Today'
                  }
                </Typography>
              </Box>
              
              <Box flex={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Time
                </Typography>
                <Typography variant="body1">
                  ⏰ {pendingRide.selectedTime || 'Now'}
                </Typography>
              </Box>
            </Box>
            
            {pendingRide.description && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2">
                  {pendingRide.description}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Typography>No ride details available</Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <LoadingButton 
          color="error" 
          onClick={() => respondToRide("declined")} 
          loading={loading}
          variant="outlined"
          disabled={timeLeft <= 0}
          sx={{ minWidth: 100 }}
        >
          Decline
        </LoadingButton>
        
        <LoadingButton 
          color="success" 
          onClick={() => respondToRide("approved")} 
          loading={loading}
          variant="contained"
          disabled={timeLeft <= 0}
          sx={{ minWidth: 100 }}
        >
          Accept
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default RideRequestModal;