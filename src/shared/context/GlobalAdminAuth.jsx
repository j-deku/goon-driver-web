import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminInfo, selectAdminAuthChecked, selectIsAdminAuthenticated } from "../../features/admin/adminSlice";

export default function GlobalAdminAuth({ children }) {
  const dispatch = useDispatch();
  const checked = useSelector(selectAdminAuthChecked);
  const authenticated = useSelector(selectIsAdminAuthenticated);
  const location = useLocation();

  useEffect(() => {
    if (!checked) dispatch(fetchAdminInfo());
  }, [dispatch, checked]);

  if (!checked) {
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!authenticated) {
    if (location.pathname.startsWith(`${import.meta.env.VITE_AUTH_LINK1}/login`)) return null;
    return <Navigate to={`${import.meta.env.VITE_AUTH_LINK1}/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}