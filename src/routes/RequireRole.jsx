import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { canAccessSegment, isSuperAdmin, normalizeRole } from "../utils/permissions";

/** @deprecated Prefer RequireFeature — kept for compatibility. */
export default function RequireRole({ children, segment, roles }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <p>Checking session…</p>;
  if (status === "unauth") {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (Array.isArray(roles) && roles.length > 0) {
    const role = normalizeRole(user?.role);
    const ok = roles.map(normalizeRole).includes(role) || isSuperAdmin(user);
    if (!ok) return <Navigate to="/" replace />;
  }

  if (segment != null && !canAccessSegment(user, segment)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
