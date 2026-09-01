import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  Divider 
} from '@mui/material';
import { MdClose, MdNotifications } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import {
  addNotification,
  clearNotifications,
  setNotifications,
  selectDriverNotifications,
} from '../../features/driver/driverNotificationsSlice';
import { socket } from '../../provider/DriverSocketProvider';

const NotificationCenter = () => {
  const notifications = useSelector(selectDriverNotifications);
  const dispatch = useDispatch();

  // Listen for socket events that notify about ride responses or generic notifications.
  useEffect(() => {
    const handleRideResponseUpdate = (data) => {
      const notif = {
        message: data.response === "approved" 
          ? `Your ride from ${data.ride.pickup} to ${data.ride.destination} has been approved!`
          : `Your ride from ${data.ride.pickup} to ${data.ride.destination} has been declined.`,
        createdAt: new Date().toISOString(),
      };
      dispatch(addNotification(notif));
      toast.info(notif.message);
    };

    const handleGenericNotification = (data) => {
      const notif = {
        message: data.message || "New notification",
        createdAt: new Date().toISOString(),
      };
      dispatch(addNotification(notif));
      toast.info(notif.message);
    };

    socket.on("rideResponseUpdate", handleRideResponseUpdate);
    socket.on("genericNotification", handleGenericNotification);

    return () => {
      socket.off("rideResponseUpdate", handleRideResponseUpdate);
      socket.off("genericNotification", handleGenericNotification);
    };
    // eslint-disable-next-line
  }, [dispatch]);

  // Remove an individual notification
  const clearNotification = (index) => {
    // Remove by index
    const filtered = notifications.filter((_, i) => i !== index);
    dispatch(setNotifications(filtered));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    dispatch(clearNotifications());
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 20,
        width: { xs: '90%', sm: 300 },
        maxHeight: '80vh',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 3,
        borderRadius: 2,
        p: 2,
        zIndex: 1300,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <MdNotifications size={28} />
        <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
          Notifications
        </Typography>
        <IconButton onClick={clearAllNotifications}>
          <MdClose />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {notifications.length === 0 ? (
          <Typography variant="body2" sx={{ mt: 2 }}>
            No notifications
          </Typography>
        ) : (
          notifications.map((notif, index) => (
            <ListItem key={index} alignItems="flex-start">
              <ListItemText
                primary={notif.message}
                secondary={new Date(notif.createdAt).toLocaleString()}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => clearNotification(index)}>
                  <MdClose />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default NotificationCenter;