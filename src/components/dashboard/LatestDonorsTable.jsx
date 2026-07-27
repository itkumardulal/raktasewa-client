import React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Skeleton,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { adminColors } from "../../theme/adminTheme";

function statusColor(status) {
  const s = (status || "").toLowerCase();
  if (s === "available") return adminColors.success;
  if (s === "assigned") return adminColors.info;
  if (s === "pending") return adminColors.warning;
  return adminColors.muted;
}

/**
 * Latest donors table — read-only snapshot from existing /donors API.
 */
export default function LatestDonorsTable({ donors = [], loading = false }) {
  const rows = (donors || []).slice(0, 8);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: `1px solid ${adminColors.border}`,
        bgcolor: "background.paper",
        height: "100%",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6">Latest Donors</Typography>
          <Typography variant="caption" color="text.secondary">
            Most recent enrolled donors
          </Typography>
        </Box>
        <Button component={RouterLink} to="/enrolled-donors" size="small" variant="text">
          View all
        </Button>
      </Stack>

      {loading ? (
        <Stack spacing={1}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={40} />
          ))}
        </Stack>
      ) : rows.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          No donors to show yet.
        </Typography>
      ) : (
        <TableContainer sx={{ maxHeight: 360 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Donor</TableCell>
                <TableCell>Blood</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: `${adminColors.primary}33`,
                          color: adminColors.primary,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {(d.fullname || "?").charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {d.fullname || "—"}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={d.blood_group || "—"} sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {d.district || d.address || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={(d.status || "—").toUpperCase()}
                      sx={{
                        bgcolor: `${statusColor(d.status)}22`,
                        color: statusColor(d.status),
                        fontWeight: 700,
                        height: 22,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      component={RouterLink}
                      to="/enrolled-donors"
                      size="small"
                      sx={{ minWidth: 0 }}
                    >
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
