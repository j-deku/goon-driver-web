// src/driver/DriverLayout.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PrivateRouteDriver from "./utils/PrivateRouteDriver";
import AuthLayout from "./components/AuthLayout/AuthLayout";
import DriverSocketProvider from "./provider/DriverSocketProvider";

import Dashboard from "./Pages/Home/Home";
import History from "./Pages/History/History";
import Earnings from "./Pages/Earnings/Earnings";
import Support from "./Pages/Support/Support";
import Settings from "./Pages/Settings/Settings";
import EditFare from "./Pages/EditFare/EditFare";
import CreateRide from "./Pages/CreateRide/CreateRide";
import EditRide from "./Pages/EditRide/EditRide";
import RideDetails from "./Pages/RideDetails/RideDetails";
import NotFound from "./Pages/NotFound/NotFound";
import RideRequestModal from "./components/RideRequestModal/RideRequestModal";
import DriverBookings from "./Pages/DriverBookings/DriverBookings";
import DriverMapPage from "./Pages/DriverMapPage/DriverMapPage";
import Privacy from "./Pages/Privacy/Privacy";
import Terms from "./Pages/Terms/Terms";

export default function DriverLayout() {
  return (
    <>
    {/* <DriverSocketProvider>*/}
      <RideRequestModal />
      <Routes>
        {/* All routes here "/driver/" */}
        <Route
          path="dashboard"
          element={
            <PrivateRouteDriver>
              <AuthLayout>
                <Dashboard />
              </AuthLayout>
            </PrivateRouteDriver>
          }
        />
        <Route path="driver-map" 
        element={
          <PrivateRouteDriver>
          <DriverMapPage />
          </PrivateRouteDriver>
        } 
        />
        <Route
          path="history"
          element={
            <PrivateRouteDriver>
              <AuthLayout>
                <History />
              </AuthLayout>
            </PrivateRouteDriver>
          }
        />
        <Route
          path="earnings"
          element={
            <PrivateRouteDriver>
              <AuthLayout>
                <Earnings />
              </AuthLayout>
            </PrivateRouteDriver>
          }
        />
        <Route
          path="support"
          element={
            <PrivateRouteDriver>
              <AuthLayout>
                <Support />
              </AuthLayout>
            </PrivateRouteDriver>
          }
        />
        <Route
          path="terms"
          element={
            <PrivateRouteDriver>
              <AuthLayout>
                <Terms />
              </AuthLayout>
            </PrivateRouteDriver>
          }
        />
        <Route
          path="privacy"
          element={
            <PrivateRouteDriver>
              <AuthLayout>
                <Privacy />
              </AuthLayout>
            </PrivateRouteDriver>
          }
        />
        <Route
          path="profile-settings"
          element={
            <PrivateRouteDriver>
              <AuthLayout>
                <Settings />
              </AuthLayout>
            </PrivateRouteDriver>
          }
        />
        <Route
          path="edit-fare/:rideId"
          element={
            <PrivateRouteDriver>
              <AuthLayout>
                <EditFare />
              </AuthLayout>
            </PrivateRouteDriver>
          }
        />
        <Route
          path="create-ride"
          element={
            <PrivateRouteDriver>
              <AuthLayout>
                <CreateRide />
              </AuthLayout>
            </PrivateRouteDriver>
          }
        />
        <Route
          path="edit-ride/:rideId"
          element={
            <PrivateRouteDriver>
              <AuthLayout>
                <EditRide />
              </AuthLayout>
            </PrivateRouteDriver>
          }
        />
        <Route
          path="ride-details/:rideId"
          element={
            <PrivateRouteDriver>
              <AuthLayout>
                <RideDetails />
              </AuthLayout>
            </PrivateRouteDriver>
          }
        />
        <Route
          path="my-bookings"
          element={
            <PrivateRouteDriver>
              <AuthLayout>
                <DriverBookings />
              </AuthLayout>
            </PrivateRouteDriver>
          }
        />

        {/* Redirect unknown to dashboard */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    {/* </DriverSocketProvider> */}
    </>
  );
}
