// src/routes/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <p>Checking session…</p>;
  if (status === "unauth")
    return <Navigate to="/signin" state={{ from: location }} replace />;

  return children; // status === 'ok'
}
