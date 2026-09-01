import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Skeleton,
  Alert,
} from "@mui/material";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import axiosInstanceDriver from "../../../axiosInstanceDriver";

const statusColors = {
  "pending approval": "warning",
  approved: "success",
  "in progress": "info",
  completed: "default",
  declined: "error",
};

export default function DriverBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDriverBookings = useCallback(async () => {
    setLoading(true);
    try {
      // Calls the new backend endpoint we just created
      const response = await axiosInstanceDriver.get(
        `/api/driver/driver-bookings`,
        { withCredentials: true }
      );
      setBookings(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch driver bookings:", err);
      toast.error("Failed to fetch bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDriverBookings();
  }, [fetchDriverBookings]);

  const handleStartRide = async (rideId) => {
    try {
      // Calls the 'startRide' endpoint
      await axiosInstanceDriver.post(`/api/driver/startRide/${rideId}`, {}, { withCredentials: true });
      toast.success("Ride status updated to 'in progress'.");
      // Refresh the list of bookings to update the UI
      fetchDriverBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start ride.");
    }
  };

  return (
    <>
      <Helmet>
        <title>My Rides – TOLI-Driver</title>
      </Helmet>
      <Box sx={{ p: 3 }} mt={20} mb={50}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
          My Assigned Rides
        </Typography>

        {loading ? (
          <Grid container spacing={2}>
            {[...Array(3)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
            ))}
          </Grid>
        ) : bookings.length === 0 ? (
          <Alert severity="info" sx={{ p: 3, fontSize: 20 }}>
            You have no assigned rides at the moment.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {bookings.map((booking) =>
              booking.rides.map((ride) => (
                <Grid item xs={12} sm={6} md={4} key={ride._id}>
                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={ride.imageUrl}
                      alt="Driver Panel"
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" noWrap>
                        {ride.pickup} → {ride.destination}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Passenger: {booking.userId.name}
                      </Typography>
                      <Chip
                        label={ride.status}
                        color={statusColors[ride.status] || "default"}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={ride.status !== "approved"}
                        onClick={() => handleStartRide(ride._id)}
                      >
                        Start Ride
                      </Button>
                      <Button
                        variant="outlined"
                        color="success"
                        fullWidth
                        disabled={ride.status !== "in progress"}
                        sx={{ mt: 1 }}
                        // This button would call a future 'completeRide' endpoint
                        onClick={() => toast.info("Functionality to be implemented.")}
                      >
                        Complete Ride
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Box>
    </>
  );
}