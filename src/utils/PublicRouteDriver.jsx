// src/driver/utils/PublicRouteDriver.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import {
  selectIsDriverAuthenticated,
  selectDriverAuthChecked,
  // add this import:
  selectDriverLoading,
  fetchDriverInfo,
} from "../features/driver/driverSlice";
import { Box, CircularProgress } from "@mui/material";

export default function PublicRouteDriver({ children }) {
  const dispatch         = useDispatch();
  const isAuthenticated  = useSelector(selectIsDriverAuthenticated);
  const authChecked      = useSelector(selectDriverAuthChecked);
  const isLoading        = useSelector(selectDriverLoading);

  // On mount, if we haven't checked auth yet, do so:
  useEffect(() => {
    if (!authChecked && !isLoading) {
      dispatch(fetchDriverInfo());
    }
  }, [authChecked, isLoading, dispatch]);

  // Still initializing auth state? Show full-page loader.
  if (!authChecked || isLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // If the user is already logged in, send them to their dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, show the public route (login, register, etc.)
  return <>{children}</>;
}
