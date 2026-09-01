// src/feature/driver/driverNotificationsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
//import { socket } from '../../driver/provider/DriverSocketProvider';

const initialState = {
  notifications: JSON.parse(localStorage.getItem('driverNotifications')) || [],
}; 

const driverNotificationsSlice = createSlice({ 
  name: 'driverNotifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      localStorage.setItem('driverNotifications', JSON.stringify(state.notifications));
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      localStorage.setItem('driverNotifications', JSON.stringify(state.notifications));
      toast.info(action.payload.message);
    },
    clearNotifications: (state) => {
      state.notifications = [];
      localStorage.setItem('driverNotifications', JSON.stringify([]));
    },
  },
});

export const {
  setNotifications,
  addNotification,
  clearNotifications,
} = driverNotificationsSlice.actions;

export const startDriverSocketListeners = (dispatch) => {
  /*
  if (!socket) {
    console.warn("Socket not defined");
    return;
  }
    */
/*
  const handleRideUpdate = (data) => {
    const newNotif = {
      message: `Ride from ${data.ride.pickup} to ${data.ride.destination} has been updated.`,
      createdAt: new Date().toISOString(),
    };
    dispatch(addNotification(newNotif));
  };
  */
/*
  const handleGenericNotification = (data) => {
    const newNotif = {
      message: data.message,
      createdAt: new Date().toISOString(),
    };
    dispatch(addNotification(newNotif));
  };
*/
  //socket.on("rideUpdate", handleRideUpdate);
  //socket.on("notification", handleGenericNotification);
  console.log("Driver socket notification listeners active.");

  return () => {
    //socket.off("rideUpdate", handleRideUpdate);
    //socket.off("notification", handleGenericNotification);
    console.log("Driver socket notification listeners removed.");
  };
};

export const selectDriverNotifications = (state) => state.driverNotifications.notifications;

export default driverNotificationsSlice.reducer;
