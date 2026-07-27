import React from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  Skeleton,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { adminColors } from "../../theme/adminTheme";

/**
 * Emergency / unsettled requests panel — display + navigate only.
 */
export default function EmergencyPanel({ requests = [], loading = false }) {
  const items = (requests || []).slice(0, 5);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: "100%",
        borderRadius: 3,
        border: `1px solid ${adminColors.warning}55`,
        background: `linear-gradient(160deg, ${adminColors.warning}18, transparent 60%), ${adminColors.card}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <WarningAmberRoundedIcon sx={{ color: adminColors.warning }} />
        <Typography variant="h6">Emergency / Unsettled</Typography>
        <Chip
          size="small"
          label={`${requests?.length || 0}`}
          sx={{ ml: "auto", bgcolor: `${adminColors.warning}33`, color: adminColors.warning, fontWeight: 700 }}
        />
      </Stack>

      {loading ? (
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={64} />
          ))}
        </Stack>
      ) : items.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          No unsettled requests right now.
        </Typography>
      ) : (
        <Stack spacing={1.25}>
          {items.map((req) => (
            <Box
              key={req.id}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: `1px solid ${adminColors.border}`,
                bgcolor: "rgba(15,23,42,0.45)",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700} noWrap>
                    {req.patient_blood_group || "—"} · {req.patient_name || "Patient"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" noWrap>
                    {req.hospital_name || req.location || req.address || "Location n/a"}
                    {req.created_at ? ` · ${new Date(req.created_at).toLocaleString()}` : ""}
                  </Typography>
                  <Chip
                    size="small"
                    label={(req.status || "urgent").toUpperCase()}
                    sx={{ mt: 0.75, height: 22, fontSize: 11, bgcolor: `${adminColors.primary}33`, color: "#fecaca" }}
                  />
                </Box>
                <Button
                  component={RouterLink}
                  to="/unsettled-requests"
                  size="small"
                  variant="contained"
                  color="warning"
                  sx={{ flexShrink: 0, color: "#0F172A", fontWeight: 700 }}
                >
                  Respond
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
