import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  canAccessSegment,
  canManageUsers,
  hasFeature,
  isSuperAdmin,
} from "../utils/permissions";

/**
 * Guard a route by feature / segment access.
 */
export default function RequireFeature({
  children,
  segment,
  feature,
  superAdminOnly = false,
  userManagerOnly = false,
}) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <p>Checking session…</p>;
  if (status === "unauth") {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (superAdminOnly && !isSuperAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  if (userManagerOnly && !canManageUsers(user)) {
    return <Navigate to="/" replace />;
  }

  if (feature && !hasFeature(user, feature) && !isSuperAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  if (segment != null && !canAccessSegment(user, segment)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
