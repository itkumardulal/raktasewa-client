import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import { fetchPointRules, logActivity } from "../services/gamiService";
import { adminColors } from "../../../theme/adminTheme";
import { useGami } from "../context/GamiContext";

const MANUAL_KEYS = [
  "call_logged",
  "follow_up",
  "meeting",
  "outreach",
  "emergency_response",
  "referral",
  "campaign_participation",
];

export default function LogActivityPage() {
  const { refresh } = useGami();
  const [rules, setRules] = useState([]);
  const [actionKey, setActionKey] = useState("call_logged");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchPointRules();
        const list = (res.rules || []).filter((r) =>
          MANUAL_KEYS.includes(r.action_key)
        );
        setRules(list);
        if (list[0]) setActionKey(list[0].action_key);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const submit = async () => {
    setSaving(true);
    try {
      const res = await logActivity({ action_key: actionKey, note });
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Logged",
          text: `+${res.points} points awarded`,
          timer: 1600,
          showConfirmButton: false,
        });
        setNote("");
        await refresh?.();
      } else {
        Swal.fire("Error", res.message || "Failed", "error");
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Server error",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 560 }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Log Activity
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Record calls, outreach, meetings, and follow-ups — these count toward marks and missions.
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Connecting people and calls earn priority marks; settlement is the last step of the pipeline.
      </Alert>
      <Paper
        elevation={0}
        sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${adminColors.border}` }}
      >
        <TextField
          select
          fullWidth
          label="Activity type"
          value={actionKey}
          onChange={(e) => setActionKey(e.target.value)}
          sx={{ mb: 2 }}
        >
          {(rules.length ? rules : MANUAL_KEYS.map((k) => ({ action_key: k, label: k, points: 0 }))).map(
            (r) => (
              <MenuItem key={r.action_key} value={r.action_key}>
                {r.label} ({r.points} pts)
              </MenuItem>
            )
          )}
        </TextField>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Who you called, vendor contacted, outreach details…"
          sx={{ mb: 2 }}
        />
        <Button variant="contained" disabled={saving} onClick={submit}>
          {saving ? <CircularProgress size={20} /> : "Submit activity"}
        </Button>
      </Paper>
    </Box>
  );
}
