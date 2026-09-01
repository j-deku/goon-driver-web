import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { Helmet } from "react-helmet-async";

const RideDetails = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const { data } = await axiosInstanceDriver.get(
          `/api/driver/rides/${rideId}`,
          {
            withCredentials: true,
          }
        );

        if (data.success) {
          setRide(data.ride);
        }
      } catch (err) {
        console.error("Error fetching ride:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [rideId]);

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ride) {
    return <Typography>No ride found.</Typography>;
  }

  // Backend returns pickup/destination as objects.
  const pickup =
    typeof ride.pickup === "object"
      ? ride.pickup?.address || ride.pickup?.formattedAddress || "Unknown"
      : ride.pickup || "Unknown";

  const destination =
    typeof ride.destination === "object"
      ? ride.destination?.address ||
        ride.destination?.formattedAddress ||
        "Unknown"
      : ride.destination || "Unknown";

  // Safely normalize numeric values.
  const price = Number(ride.price ?? 0);
  const commissionRate = Number(ride.commissionRate ?? 0);
  const commissionAmount = Number(ride.commissionAmount ?? 0);
  const payoutAmount = Number(ride.payoutAmount ?? 0);

  return (
    <>
      <Helmet>
        <title>Ride Details -GoOn-Driver</title>
      </Helmet>

      <Box sx={{ maxWidth: 600, mx: "auto", mt: 6 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Ride Details
            </Typography>

            <Typography>
              <strong>Pickup:</strong> {pickup}
            </Typography>

            <Typography>
              <strong>Destination:</strong> {destination}
            </Typography>

            <Typography>
              <strong>Date:</strong>{" "}
              {ride.selectedDate
                ? new Date(ride.selectedDate).toLocaleDateString()
                : "N/A"}
            </Typography>

            <Typography>
              <strong>Time:</strong> {ride.selectedTime || "N/A"}
            </Typography>

            <Typography>
              <strong>Price:</strong> {ride.currency} {price.toFixed(2)}
            </Typography>

            <Typography>
              <strong>Seats:</strong>{" "}
              {ride.maxPassengers ?? ride.passengers ?? 0}
            </Typography>

            <Typography>
              <strong>Type:</strong> {ride.type || "N/A"}
            </Typography>

            <Typography>
              <strong>Status:</strong> {ride.status || "N/A"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography>
              <strong>Commission:</strong>{" "}
              {(commissionRate * 100).toFixed(1)}%
            </Typography>

            <Typography>
              <strong>Fee:</strong> {ride.currency}{" "}
              {commissionAmount.toFixed(2)}
            </Typography>

            <Typography>
              <strong>Payout:</strong> {ride.currency}{" "}
              {payoutAmount.toFixed(2)}
            </Typography>

            {ride.imageUrl && (
              <Box
                component="img"
                src={ride.imageUrl}
                alt="Ride"
                width="100%"
                sx={{
                  mt: 2,
                  borderRadius: 1,
                  objectFit: "cover",
                }}
              />
            )}
          </CardContent>
        </Card>

        <Box textAlign="center">
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
          >
            Back to My Rides
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default RideDetails;