
// components/shared/LoadingScreen.jsx
import React from 'react';
import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingScreen = ({ message = "Please wait...", size = 60 }) => (
  <Box sx={{ 
    height: "100vh", 
    display: "flex", 
    flexDirection: "column",
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: "#fff" 
  }}>
    <CircularProgress size={size} />
    <Typography sx={{ mt: 2, color: "gray" }}>{message}</Typography>
  </Box>
);

export default LoadingScreen;