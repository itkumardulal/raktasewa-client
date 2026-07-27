// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setStoredToken } from "../lib/axiosInstance";
import { logoutService } from "../services/authService";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading"); // 'loading' | 'ok' | 'unauth'
  const [user, setUser] = useState(null);

  /* --------  check session on first mount  -------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/auth/user");
        if (!cancelled) {
          setUser(data);
          setStatus("ok");
        }
      } catch {
        if (!cancelled) {
          setStoredToken(null);
          setStatus("unauth");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = (userPayload) => {
    setUser(userPayload);
    setStatus("ok");
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch {
      setStoredToken(null);
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
