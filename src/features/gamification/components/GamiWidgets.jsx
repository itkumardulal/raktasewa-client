import React from "react";
import { Box, LinearProgress, Paper, Stack, Typography, Chip } from "@mui/material";
import { adminColors } from "../../../theme/adminTheme";

export function ProgressCard({ title, value, target, subtitle, accent }) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: `1px solid ${adminColors.border}`,
        bgcolor: "background.paper",
        height: "100%",
      }}
    >
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700 }}>
        {value}
        {target != null ? (
          <Typography component="span" variant="body2" color="text.secondary">
            {" "}
            / {target}
          </Typography>
        ) : null}
      </Typography>
      {subtitle ? (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}
      {target != null ? (
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            mt: 1.5,
            height: 8,
            borderRadius: 99,
            bgcolor: "rgba(148,163,184,0.15)",
            "& .MuiLinearProgress-bar": {
              bgcolor: accent || adminColors.primary,
              borderRadius: 99,
            },
          }}
        />
      ) : null}
    </Paper>
  );
}

export function StatChip({ label, value }) {
  return (
    <Chip
      label={`${label}: ${value}`}
      size="small"
      sx={{ bgcolor: "rgba(148,163,184,0.12)" }}
    />
  );
}

export function TierBadge({ tier, themeVars }) {
  if (!tier) return null;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 0.75,
        borderRadius: 2,
        border: `1px solid ${themeVars?.accent || adminColors.border}`,
        boxShadow: themeVars?.glow ? `0 0 24px ${themeVars.glow}` : "none",
      }}
    >
      <Typography variant="subtitle2" sx={{ color: themeVars?.accent || "inherit" }}>
        {tier.name}
      </Typography>
    </Box>
  );
}

export function MissionTimeline({ missions = [] }) {
  return (
    <Stack spacing={1.5}>
      {missions.map((m) => (
        <Paper
          key={m.id}
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${adminColors.border}`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography fontWeight={600}>{m.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {m.scope} · {m.bucket} · {m.progress_pct}%
              </Typography>
            </Box>
            <Chip size="small" label={m.bucket} color={m.bucket === "completed" ? "success" : "default"} />
          </Stack>
          <LinearProgress
            variant="determinate"
            value={m.progress_pct || 0}
            sx={{ mt: 1, height: 6, borderRadius: 99 }}
          />
        </Paper>
      ))}
      {!missions.length ? (
        <Typography color="text.secondary">No missions yet.</Typography>
      ) : null}
    </Stack>
  );
}
