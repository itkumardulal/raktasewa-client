import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  fetchMissions,
  fetchTeamPerformance,
  fetchAchievements,
} from "../services/gamiService";
import { useGami } from "../context/GamiContext";
import {
  MissionTimeline,
  ProgressCard,
  TierBadge,
  StatChip,
} from "../components/GamiWidgets";
import { adminColors } from "../../../theme/adminTheme";

export default function MissionCenterPage() {
  const { summary, themeVars, ready, refresh } = useGami();
  const [tab, setTab] = useState(0);
  const [missions, setMissions] = useState([]);
  const [team, setTeam] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [unlocked, setUnlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [m, t, a] = await Promise.all([
          fetchMissions(),
          fetchTeamPerformance(),
          fetchAchievements(),
        ]);
        setMissions(m.missions || []);
        setTeam(t);
        setAchievements(a.achievements || []);
        setUnlocked(a.unlocked || []);
        await refresh?.();
      } catch {
        setError("Could not load Mission Center. Run the gamification SQL migration if needed.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const active = missions.filter((m) => m.bucket === "active");
  const upcoming = missions.filter((m) => m.bucket === "upcoming");
  const completed = missions.filter((m) => m.bucket === "completed");
  const personal = missions.filter((m) => m.scope === "user");
  const teamMissions = missions.filter((m) => m.scope !== "user");

  const accent = themeVars?.accent || adminColors.primary;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        "--gami-accent": accent,
        boxShadow: themeVars?.glow ? `inset 0 0 80px ${themeVars.glow}` : "none",
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Mission Center
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Self evaluation and team evaluation — earn marks, hit targets, unlock rewards.
      </Typography>

      {!ready && !loading ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Gamification tables not ready. Run{" "}
          <code>server/sql/migrate_gamification_core.sql</code> on MySQL.
        </Alert>
      ) : null}

      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ProgressCard
                title="Personal points"
                value={summary?.points || 0}
                subtitle={summary?.tier ? `Tier: ${summary.tier.name}` : ""}
                accent={accent}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ProgressCard
                title="Team score"
                value={summary?.team_score || 0}
                subtitle={`Team size ${summary?.team_size || 0}`}
                accent={accent}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ProgressCard
                title="Personal rank"
                value={summary?.rank || "—"}
                subtitle={`Streak ${summary?.streak || 0} days`}
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
                  Current tier
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <TierBadge tier={summary?.tier} themeVars={themeVars} />
                </Box>
                {summary?.next_tier ? (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Next: {summary.next_tier.name} at {summary.next_tier.min_points} pts
                  </Typography>
                ) : null}
                {summary?.next_reward ? (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    Reward: {summary.next_reward.reward_title || "Granted"}
                  </Typography>
                ) : null}
              </Paper>
            </Grid>
          </Grid>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Personal" />
            <Tab label="Team" />
            <Tab label="Active" />
            <Tab label="Upcoming" />
            <Tab label="Completed" />
            <Tab label="Timeline" />
            <Tab label="Achievements" />
          </Tabs>

          {tab === 0 && <MissionTimeline missions={personal} />}
          {tab === 1 && (
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                <StatChip label="Settled" value={team?.metrics?.settled_requests || 0} />
                <StatChip label="Donors added" value={team?.metrics?.registered_donors || 0} />
                <StatChip label="Calls" value={team?.metrics?.calls_made || 0} />
                <StatChip label="Follow-ups" value={team?.metrics?.follow_ups || 0} />
                <StatChip label="Team score" value={team?.metrics?.total_score || 0} />
              </Stack>
              <MissionTimeline missions={teamMissions} />
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Team members
              </Typography>
              <Grid container spacing={1}>
                {(team?.members || []).map((m) => (
                  <Grid key={m.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                      elevation={0}
                      sx={{ p: 1.5, border: `1px solid ${adminColors.border}`, borderRadius: 2 }}
                    >
                      <Typography fontWeight={600}>
                        {m.full_name || m.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {m.role} · {m.points} pts · {m.tier?.name || "—"}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          {tab === 2 && <MissionTimeline missions={active} />}
          {tab === 3 && <MissionTimeline missions={upcoming} />}
          {tab === 4 && <MissionTimeline missions={completed} />}
          {tab === 5 && <MissionTimeline missions={missions} />}
          {tab === 6 && (
            <Grid container spacing={1}>
              {achievements.map((a) => {
                const got = unlocked.some((u) => Number(u.achievement_id) === Number(a.id));
                return (
                  <Grid key={a.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${adminColors.border}`,
                        opacity: got ? 1 : 0.55,
                      }}
                    >
                      <Typography fontWeight={600}>{a.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {a.description}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        {got ? "Unlocked" : "Locked"}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}
