import React, { useEffect, useState } from "react";
import { Alert, Box, Grid, LinearProgress, Paper, Typography } from "@mui/material";
import { fetchMySummary, fetchBloodIntelligence, fetchMissions } from "../services/gamiService";
import { ProgressCard, TierBadge } from "./GamiWidgets";
import { adminColors } from "../../../theme/adminTheme";
import { hasFeature } from "../../../utils/permissions";
import { useAuth } from "../../../contexts/AuthContext";

/** Additive dashboard strip — does not replace existing widgets */
export default function DashboardMissionStrip() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [intel, setIntel] = useState(null);
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    if (!hasFeature(user, "gamification.mission") && !hasFeature(user, "dashboard")) {
      return;
    }
    (async () => {
      try {
        if (hasFeature(user, "gamification.mission")) {
          const [s, m] = await Promise.all([fetchMySummary(), fetchMissions()]);
          setSummary(s);
          setMissions((m.missions || []).filter((x) => x.bucket === "active").slice(0, 3));
        }
      } catch {
        /* ignore — never break dashboard */
      }
      try {
        const bi = await fetchBloodIntelligence();
        setIntel(bi);
      } catch {
        /* ignore */
      }
    })();
  }, [user]);

  if (!summary?.ready && !intel) return null;

  const themeVars = summary?.theme?.css_vars || {};
  const accent = themeVars.accent || adminColors.primary;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Mission Control
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Personal progress, team score, blood intelligence — additive to your existing dashboard.
      </Typography>

      {summary?.ready ? (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ProgressCard title="Personal points" value={summary.points || 0} accent={accent} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ProgressCard title="Team score" value={summary.team_score || 0} accent={accent} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ProgressCard
              title="Personal rank"
              value={summary.rank || "—"}
              subtitle={`Streak ${summary.streak || 0}`}
              accent={accent}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px solid ${adminColors.border}`,
                height: "100%",
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Tier / next reward
              </Typography>
              <Box sx={{ mt: 1 }}>
                <TierBadge tier={summary.tier} themeVars={themeVars} />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                {summary.next_reward?.reward_title ||
                  (summary.next_tier
                    ? `Next tier ${summary.next_tier.name}`
                    : "Keep logging activity")}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          Run migrate_gamification_core.sql to unlock mission widgets.
        </Alert>
      )}

      {missions.length > 0 && (
        <Paper
          elevation={0}
          sx={{ p: 2, mb: 2, borderRadius: 3, border: `1px solid ${adminColors.border}` }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Active missions
          </Typography>
          {missions.map((m) => (
            <Box key={m.id} sx={{ mb: 1.5 }}>
              <Typography variant="body2">
                {m.title} — {m.progress_pct}%
              </Typography>
              <LinearProgress variant="determinate" value={m.progress_pct || 0} sx={{ height: 6, borderRadius: 99 }} />
            </Box>
          ))}
        </Paper>
      )}

      {intel?.rows && (
        <Paper
          elevation={0}
          sx={{ p: 2, borderRadius: 3, border: `1px solid ${adminColors.border}` }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Blood availability heatmap / demand vs supply
          </Typography>
          <Grid container spacing={1}>
            {intel.rows.map((r) => (
              <Grid key={r.blood_group} size={{ xs: 6, sm: 3, md: 3 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    textAlign: "center",
                    bgcolor: r.shortage
                      ? "rgba(220,38,38,0.25)"
                      : r.available > 5
                        ? "rgba(34,197,94,0.2)"
                        : "rgba(245,158,11,0.18)",
                    border: `1px solid ${adminColors.border}`,
                  }}
                >
                  <Typography fontWeight={700}>{r.blood_group}</Typography>
                  <Typography variant="caption" display="block">
                    {r.available} avail
                  </Typography>
                  <Typography variant="caption" display="block">
                    {r.demand} need
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          {intel.emergency_alerts?.length ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Shortage alerts:{" "}
              {intel.emergency_alerts.map((a) => a.blood_group).join(", ")}
            </Alert>
          ) : null}
        </Paper>
      )}
    </Box>
  );
}
