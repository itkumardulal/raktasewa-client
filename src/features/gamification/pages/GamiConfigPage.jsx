import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import {
  fetchMissions,
  createMission,
  updateMission,
  archiveMission,
  fetchRewards,
  createReward,
  fetchPointRules,
  upsertPointRule,
  fetchTiers,
  upsertTier,
  fetchAchievements,
  upsertAchievement,
  fetchCampaigns,
  createCampaign,
  fetchThemes,
  upsertTheme,
  fetchCelebrations,
} from "../services/gamiService";
import { adminColors } from "../../../theme/adminTheme";

const REWARD_TYPES = [
  "cash",
  "gift",
  "certificate",
  "tour",
  "coupon",
  "recognition",
  "custom",
];

export default function GamiConfigPage() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [rules, setRules] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [themes, setThemes] = useState([]);
  const [celebrations, setCelebrations] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [m, r, pr, t, a, c, th, cel] = await Promise.all([
        fetchMissions(),
        fetchRewards(),
        fetchPointRules(),
        fetchTiers(),
        fetchAchievements(),
        fetchCampaigns(),
        fetchThemes(),
        fetchCelebrations(),
      ]);
      setMissions(m.missions || []);
      setRewards(r.rewards || []);
      setRules(pr.rules || []);
      setTiers(t.tiers || []);
      setAchievements(a.achievements || []);
      setCampaigns(c.campaigns || []);
      setThemes(th.themes || []);
      setCelebrations(cel.celebrations || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = (type, seed = {}) => {
    setDialog(type);
    setForm(seed);
  };

  const save = async () => {
    try {
      if (dialog === "mission") {
        if (form.id) await updateMission(form.id, form);
        else await createMission(form);
      } else if (dialog === "reward") {
        await createReward(form);
      } else if (dialog === "rule") {
        await upsertPointRule(form);
      } else if (dialog === "tier") {
        await upsertTier(form);
      } else if (dialog === "achievement") {
        await upsertAchievement(form);
      } else if (dialog === "campaign") {
        await createCampaign(form);
      } else if (dialog === "theme") {
        await upsertTheme({
          ...form,
          css_vars: form.css_vars || { accent: "#F59E0B", glow: "rgba(245,158,11,0.3)" },
        });
      }
      setDialog(null);
      await load();
      Swal.fire({ icon: "success", title: "Saved", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Save failed", "error");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Gamification Config
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Super Admin / Admin — create unlimited targets, rewards, point rules, tiers, campaigns, and themes.
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Existing blood-ops pages are unchanged. This panel only configures the mission layer.
      </Alert>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 2 }}
      >
        <Tab label="Missions" />
        <Tab label="Rewards" />
        <Tab label="Point Rules" />
        <Tab label="Tiers" />
        <Tab label="Achievements" />
        <Tab label="Campaigns" />
        <Tab label="Themes" />
        <Tab label="Celebrations" />
      </Tabs>

      <Paper
        elevation={0}
        sx={{ p: 2, borderRadius: 3, border: `1px solid ${adminColors.border}` }}
      >
        {tab === 0 && (
          <>
            <Button variant="contained" sx={{ mb: 2 }} onClick={() => openCreate("mission", { scope: "user", calc_type: "points_sum", target_value: 100, status: "active", priority: 0 })}>
              New mission / target
            </Button>
            <DataGrid
              autoHeight
              rows={missions}
              columns={[
                { field: "id", width: 70 },
                { field: "title", flex: 1 },
                { field: "scope", width: 100 },
                { field: "target_value", width: 110 },
                { field: "current_value", width: 120 },
                { field: "status", width: 100 },
                {
                  field: "actions",
                  width: 180,
                  sortable: false,
                  renderCell: (p) => (
                    <>
                      <Button size="small" onClick={() => openCreate("mission", p.row)}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="warning"
                        onClick={async () => {
                          await archiveMission(p.row.id);
                          load();
                        }}
                      >
                        Archive
                      </Button>
                    </>
                  ),
                },
              ]}
              pageSizeOptions={[10]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            />
          </>
        )}
        {tab === 1 && (
          <>
            <Button variant="contained" sx={{ mb: 2 }} onClick={() => openCreate("reward", { reward_type: "cash", is_active: 1 })}>
              New reward
            </Button>
            <DataGrid
              autoHeight
              rows={rewards}
              columns={[
                { field: "id", width: 70 },
                { field: "title", flex: 1 },
                { field: "reward_type", width: 120 },
                { field: "value_text", flex: 1 },
                { field: "is_active", width: 90 },
              ]}
              pageSizeOptions={[10]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            />
          </>
        )}
        {tab === 2 && (
          <>
            <Button variant="contained" sx={{ mb: 2 }} onClick={() => openCreate("rule", { points: 10, is_active: 1, is_negative: 0 })}>
              New / update rule
            </Button>
            <DataGrid
              autoHeight
              rows={rules}
              columns={[
                { field: "action_key", flex: 1 },
                { field: "label", flex: 1 },
                { field: "points", width: 100 },
                { field: "is_active", width: 90 },
                {
                  field: "edit",
                  width: 100,
                  renderCell: (p) => (
                    <Button size="small" onClick={() => openCreate("rule", p.row)}>
                      Edit
                    </Button>
                  ),
                },
              ]}
              pageSizeOptions={[15]}
              initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
            />
          </>
        )}
        {tab === 3 && (
          <>
            <Button variant="contained" sx={{ mb: 2 }} onClick={() => openCreate("tier", { min_points: 0, sort_order: 0, is_active: 1 })}>
              New tier
            </Button>
            <DataGrid
              autoHeight
              rows={tiers}
              columns={[
                { field: "name", flex: 1 },
                { field: "min_points", width: 120 },
                { field: "theme_key", width: 120 },
                { field: "sort_order", width: 100 },
                {
                  field: "edit",
                  width: 100,
                  renderCell: (p) => (
                    <Button size="small" onClick={() => openCreate("tier", p.row)}>
                      Edit
                    </Button>
                  ),
                },
              ]}
              pageSizeOptions={[10]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            />
          </>
        )}
        {tab === 4 && (
          <>
            <Button
              variant="contained"
              sx={{ mb: 2 }}
              onClick={() =>
                openCreate("achievement", {
                  rule_type: "points_total",
                  rule_value: 100,
                  is_active: 1,
                })
              }
            >
              New achievement
            </Button>
            <DataGrid
              autoHeight
              rows={achievements}
              columns={[
                { field: "code", width: 140 },
                { field: "title", flex: 1 },
                { field: "rule_type", width: 130 },
                { field: "rule_value", width: 110 },
                {
                  field: "edit",
                  width: 100,
                  renderCell: (p) => (
                    <Button size="small" onClick={() => openCreate("achievement", p.row)}>
                      Edit
                    </Button>
                  ),
                },
              ]}
              pageSizeOptions={[10]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            />
          </>
        )}
        {tab === 5 && (
          <>
            <Button
              variant="contained"
              sx={{ mb: 2 }}
              onClick={() =>
                openCreate("campaign", {
                  goal_value: 500,
                  calc_type: "points_sum",
                  status: "active",
                })
              }
            >
              New campaign
            </Button>
            <DataGrid
              autoHeight
              rows={campaigns}
              columns={[
                { field: "id", width: 70 },
                { field: "title", flex: 1 },
                { field: "goal_value", width: 110 },
                { field: "status", width: 100 },
              ]}
              pageSizeOptions={[10]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            />
          </>
        )}
        {tab === 6 && (
          <>
            <Button
              variant="contained"
              sx={{ mb: 2 }}
              onClick={() => openCreate("theme", { is_active: 1 })}
            >
              New theme
            </Button>
            <DataGrid
              autoHeight
              rows={themes}
              getRowId={(r) => r.id}
              columns={[
                { field: "theme_key", width: 140 },
                { field: "label", flex: 1 },
                { field: "is_active", width: 90 },
              ]}
              pageSizeOptions={[10]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            />
          </>
        )}
        {tab === 7 && (
          <DataGrid
            autoHeight
            rows={celebrations}
            columns={[
              { field: "id", width: 70 },
              { field: "user_id", width: 90 },
              { field: "event_type", width: 140 },
              { field: "title", flex: 1 },
              { field: "created_at", flex: 1 },
            ]}
            pageSizeOptions={[15]}
            initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
          />
        )}
      </Paper>

      <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>Configure {dialog}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {dialog === "mission" && (
            <>
              <TextField label="Title" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth />
              <TextField label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline />
              <TextField label="Target value" type="number" value={form.target_value ?? ""} onChange={(e) => setForm({ ...form, target_value: e.target.value })} fullWidth />
              <TextField select label="Calc type" value={form.calc_type || "points_sum"} onChange={(e) => setForm({ ...form, calc_type: e.target.value })} fullWidth>
                <MenuItem value="points_sum">Points sum</MenuItem>
                <MenuItem value="action_count">Action count</MenuItem>
                <MenuItem value="action_points">Action points</MenuItem>
              </TextField>
              <TextField label="Action key (optional)" value={form.action_key || ""} onChange={(e) => setForm({ ...form, action_key: e.target.value })} fullWidth />
              <TextField select label="Scope" value={form.scope || "user"} onChange={(e) => setForm({ ...form, scope: e.target.value })} fullWidth>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="team">Team</MenuItem>
                <MenuItem value="global">Global</MenuItem>
              </TextField>
              <TextField label="Reward ID" type="number" value={form.reward_id ?? ""} onChange={(e) => setForm({ ...form, reward_id: e.target.value || null })} fullWidth />
              <TextField label="Priority" type="number" value={form.priority ?? 0} onChange={(e) => setForm({ ...form, priority: e.target.value })} fullWidth />
              <TextField select label="Status" value={form.status || "active"} onChange={(e) => setForm({ ...form, status: e.target.value })} fullWidth>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
              <TextField label="Start at (ISO)" value={form.start_at || ""} onChange={(e) => setForm({ ...form, start_at: e.target.value })} fullWidth />
              <TextField label="End at (ISO)" value={form.end_at || ""} onChange={(e) => setForm({ ...form, end_at: e.target.value })} fullWidth />
            </>
          )}
          {dialog === "reward" && (
            <>
              <TextField label="Title" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth />
              <TextField select label="Type" value={form.reward_type || "custom"} onChange={(e) => setForm({ ...form, reward_type: e.target.value })} fullWidth>
                {REWARD_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Value text" value={form.value_text || ""} onChange={(e) => setForm({ ...form, value_text: e.target.value })} fullWidth placeholder="Rs 5000 / Family package / Pokhara tour…" />
              <TextField label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline />
            </>
          )}
          {dialog === "rule" && (
            <>
              <TextField label="Action key" value={form.action_key || ""} onChange={(e) => setForm({ ...form, action_key: e.target.value })} fullWidth />
              <TextField label="Label" value={form.label || ""} onChange={(e) => setForm({ ...form, label: e.target.value })} fullWidth />
              <TextField label="Points" type="number" value={form.points ?? 0} onChange={(e) => setForm({ ...form, points: e.target.value })} fullWidth />
            </>
          )}
          {dialog === "tier" && (
            <>
              <TextField label="Name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
              <TextField label="Min points" type="number" value={form.min_points ?? 0} onChange={(e) => setForm({ ...form, min_points: e.target.value })} fullWidth />
              <TextField label="Theme key" value={form.theme_key || ""} onChange={(e) => setForm({ ...form, theme_key: e.target.value })} fullWidth />
              <TextField label="Sort order" type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} fullWidth />
            </>
          )}
          {dialog === "achievement" && (
            <>
              <TextField label="Code" value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} fullWidth />
              <TextField label="Title" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth />
              <TextField label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth />
              <TextField select label="Rule type" value={form.rule_type || "points_total"} onChange={(e) => setForm({ ...form, rule_type: e.target.value })} fullWidth>
                <MenuItem value="points_total">Points total</MenuItem>
                <MenuItem value="action_count">Action count</MenuItem>
                <MenuItem value="points_period">Monthly points</MenuItem>
                <MenuItem value="streak_days">Streak days</MenuItem>
              </TextField>
              <TextField label="Rule value" type="number" value={form.rule_value ?? 1} onChange={(e) => setForm({ ...form, rule_value: e.target.value })} fullWidth />
              <TextField label="Action key" value={form.action_key || ""} onChange={(e) => setForm({ ...form, action_key: e.target.value })} fullWidth />
            </>
          )}
          {dialog === "campaign" && (
            <>
              <TextField label="Title" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth />
              <TextField label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth />
              <TextField label="Goal value" type="number" value={form.goal_value ?? 1} onChange={(e) => setForm({ ...form, goal_value: e.target.value })} fullWidth />
              <TextField label="Reward ID" type="number" value={form.reward_id ?? ""} onChange={(e) => setForm({ ...form, reward_id: e.target.value || null })} fullWidth />
            </>
          )}
          {dialog === "theme" && (
            <>
              <TextField label="Theme key" value={form.theme_key || ""} onChange={(e) => setForm({ ...form, theme_key: e.target.value })} fullWidth />
              <TextField label="Label" value={form.label || ""} onChange={(e) => setForm({ ...form, label: e.target.value })} fullWidth />
              <TextField label="Accent color" value={form.css_vars?.accent || ""} onChange={(e) => setForm({ ...form, css_vars: { ...(form.css_vars || {}), accent: e.target.value } })} fullWidth />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
