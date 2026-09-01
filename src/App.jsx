import "./App.css";
import React, { lazy, useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Lazy loaded layouts
const DriverLayout = lazy(() => import("./DriverLayout"));

// Driver imports
import DriverAuthProvider from "./provider/DriverAuthProvider";
import PublicRouteDriver from "./utils/PublicRouteDriver";
import PrivateRouteDriver from "./utils/PrivateRouteDriver";
import LoginForm from "./Pages/LoginForm/LoginForm";
import RegisForm from "./Pages/RegisForm/RegisForm";
import ForgotPasswordDriver from "./components/ForgotPasswordDriver/ForgotPasswordDriver";
import PasswordResetDriver from "./components/PasswordResetDriver/PasswordResetDriver";
import FormSubmitted from "./Pages/FormSubmitted/FormSubmitted";
import LoadingPage from "./components/LoadingPage/LoadingPage";

export default function App() {
  // Service Worker Sound Notifications
    const AUTH_DR_LK = import.meta.env.VITE_AUTH_LINK_DR; 

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "PLAY_SOUND") {
          const audio = new Audio("/sounds/apple-toast.mp3");
          audio
            .play()
            .catch((err) => console.warn("Audio playback blocked:", err));
        }
      });
    }
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Routes>
        {/* User routes */}
        <Route path="/*" index element={<DriverAuthProvider><DriverLayout/></DriverAuthProvider>} />

        {/* Driver routes */}
        <Route
          path="/*"
          element={
            <DriverAuthProvider>
              <Outlet />
            </DriverAuthProvider>
          }
        >
          <Route
            index
            element={
              <PublicRouteDriver>
                <Navigate to={`${AUTH_DR_LK}/login`} replace />
              </PublicRouteDriver>
            }
          />
          {/* Public driver routes */}
          <Route
            path={`${AUTH_DR_LK}/login`}
            element={
              <PublicRouteDriver>
                <LoginForm />
              </PublicRouteDriver>
            }
          />
          <Route
            path={`${AUTH_DR_LK}/register`}
            element={
              <PublicRouteDriver>
                <RegisForm />
              </PublicRouteDriver>
            }
          />
          <Route
            path={`${AUTH_DR_LK}/forgot-password`}
            element={
              <PublicRouteDriver>
                <ForgotPasswordDriver />
              </PublicRouteDriver>
            }
          />
          <Route
            path={`${AUTH_DR_LK}/reset-password/:token`}
            element={
              <PublicRouteDriver>
                <PasswordResetDriver />
              </PublicRouteDriver>
            }
          />
          <Route
            path={`${AUTH_DR_LK}/form-submitted`}
            element={
              <PublicRouteDriver>
                <FormSubmitted />
              </PublicRouteDriver>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LocalizationProvider>
  );
}
