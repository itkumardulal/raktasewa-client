import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchMySummary, markCelebrationSeen } from "../services/gamiService";
import { useAuth } from "../../../contexts/AuthContext";
import { hasFeature } from "../../../utils/permissions";

const GamiContext = createContext(null);

export function GamiProvider({ children }) {
  const { user, status } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [celebration, setCelebration] = useState(null);

  const canLoad =
    status === "auth" &&
    user &&
    hasFeature(user, "gamification.mission");

  const refresh = async () => {
    if (!canLoad) {
      setSummary(null);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchMySummary();
      setSummary(data);
      const unseen = (data.celebrations || []).find((c) => {
        try {
          const p =
            typeof c.payload_json === "string"
              ? JSON.parse(c.payload_json)
              : c.payload_json;
          return !p?.seen;
        } catch {
          return true;
        }
      });
      if (unseen) setCelebration(unseen);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad, user?.id]);

  const dismissCelebration = async () => {
    if (celebration?.id) {
      try {
        await markCelebrationSeen(celebration.id);
      } catch {
        /* ignore */
      }
    }
    setCelebration(null);
  };

  const themeVars = summary?.theme?.css_vars || {};

  return (
    <GamiContext.Provider
      value={{
        summary,
        loading,
        refresh,
        celebration,
        dismissCelebration,
        themeVars,
        ready: Boolean(summary?.ready),
      }}
    >
      {children}
    </GamiContext.Provider>
  );
}

export function useGami() {
  return useContext(GamiContext) || {};
}
