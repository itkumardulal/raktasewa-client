import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { fetchLeaderboard } from "../services/gamiService";
import { adminColors } from "../../../theme/adminTheme";

const PERIODS = ["daily", "weekly", "monthly", "yearly", "all-time"];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("monthly");
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchLeaderboard(period);
        setUsers(res.users || []);
        setTeams(res.teams || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [period]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Leaderboards
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Rank by marks — user and team views.
      </Typography>
      <TextField
        select
        size="small"
        label="Period"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        sx={{ mb: 2, minWidth: 180 }}
      >
        {PERIODS.map((p) => (
          <MenuItem key={p} value={p}>
            {p}
          </MenuItem>
        ))}
      </TextField>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Users" />
        <Tab label="Teams" />
      </Tabs>
      <Paper
        elevation={0}
        sx={{
          height: 480,
          border: `1px solid ${adminColors.border}`,
          borderRadius: 3,
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : tab === 0 ? (
          <DataGrid
            rows={users.map((u, i) => ({
              id: u.user_id,
              rank: i + 1,
              name: u.full_name || u.email,
              role: u.role,
              points: Number(u.points),
            }))}
            columns={[
              { field: "rank", headerName: "#", width: 70 },
              { field: "name", headerName: "User", flex: 1 },
              { field: "role", headerName: "Role", width: 120 },
              { field: "points", headerName: "Points", width: 120 },
            ]}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          />
        ) : (
          <DataGrid
            rows={teams.map((t, i) => ({
              id: t.team_admin_id,
              rank: i + 1,
              name: t.admin_name,
              points: Number(t.points),
            }))}
            columns={[
              { field: "rank", headerName: "#", width: 70 },
              { field: "name", headerName: "Team (Admin)", flex: 1 },
              { field: "points", headerName: "Points", width: 120 },
            ]}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          />
        )}
      </Paper>
    </Box>
  );
}
