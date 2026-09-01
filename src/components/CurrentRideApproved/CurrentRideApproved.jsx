import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material';
import axiosInstanceDriver from '../../../axiosInstanceDriver';
import { useSelector } from 'react-redux';
import { selectIsDriverAuthenticated } from '../../features/driver/driverSlice';

const CurrentRideApproved = () => {
  const isAuthenticated = useSelector(selectIsDriverAuthenticated);
  const [currentRide, setCurrentRide] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentRide = async () => {
    setLoading(true);
    try {
      const res = await axiosInstanceDriver.get('/api/driver/current-ride', {
        withCredentials: true,
      });
      if (res.data.success) {
        setCurrentRide(res.data.ride);
      }
    } catch (error) {
      setCurrentRide(null);
      // Optionally, show a notification here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentRide();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </Box>
    );
  }

  if (!currentRide) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Typography variant="body1"><Skeleton /></Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 500, 
      mx: 'auto', 
      mt: 4,
      }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Current Ride
          </Typography>
          <Typography variant="body1"><strong>Pickup:</strong> {currentRide.pickup}</Typography>
          <Typography variant="body1"><strong>Destination:</strong> {currentRide.destination}</Typography>
          <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
            Status: {currentRide.status?.toUpperCase()}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CurrentRideApproved;