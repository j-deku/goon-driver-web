import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUserRoles, selectAuthStatus, selectIsAuthenticated } from "../../features/user/userSlice";
import LoadingPage from "../../user/components/LoadingPage/LoadingPage";
import NotFound from "../../admin/Pages/NotFound/NotFound";

export default function AdminGuard({ allowedRoles = [], children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const roles = useSelector(selectUserRoles);
  const authChecked = useSelector(selectAuthStatus);

  if (!authChecked) {
    return (
      <LoadingPage/>
    );
  }

  if (!isAuthenticated) {
    return <NotFound />;
  }

  if (
    allowedRoles.length > 0 &&
    !roles.some(role => allowedRoles.includes(role))
  ) {
    return <NotFound />;
  }
  return <>{children}</>;
}