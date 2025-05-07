// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/axiosInstance";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading"); // 'loading' | 'ok' | 'unauth'
  const [user, setUser] = useState(null);

  /* --------  check session on first mount  -------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/auth/user"); // cookie sent automatically
        if (!cancelled) {
          setUser(data);
          setStatus("ok");
        }
      } catch {
        if (!cancelled) setStatus("unauth");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* --------  helpers called by UI  -------- */
  const login = (userPayload) => {
    setUser(userPayload);
    setStatus("ok");
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch {
      // single network call
      /* ignore network errors */
    }
    setUser(null);
    setStatus("unauth");
  };

  return (
    <AuthCtx.Provider
      value={{
        status,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
