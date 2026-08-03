/* Spam / Flagged blood requests */
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
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UndoIcon from "@mui/icons-material/Undo";
import Swal from "sweetalert2";
import {
  fetchFlaggedRequests,
  unflagRequest,
} from "../services/requestService";
import { sortByLatest } from "../utils/exportData";

export default function FlaggedRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [openRow, setOpenRow] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFlaggedRequests();
      if (res.success && Array.isArray(res.requests)) {
        setRequests(sortByLatest(res.requests, "flagged_at"));
        setWarning(res.warning || null);
      } else {
        setError("Failed to load flagged requests");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRestore = async (row) => {
    const result = await Swal.fire({
      title: "Restore this request?",
      text: "It will leave Spam / Flagged and return to the active queue.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, restore",
    });
    if (!result.isConfirmed) return;

    setBusyId(row.id);
    try {
      const res = await unflagRequest({ request_id: row.id });
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Restored",
          text: res.message || "Request restored.",
          timer: 1500,
          showConfirmButton: false,
        });
        await load();
      } else {
        Swal.fire("Error", res.message || "Restore failed", "error");
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Server error",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "patient_name", headerName: "Patient", flex: 1, minWidth: 130 },
    { field: "patient_blood_group", headerName: "Blood", width: 90 },
    { field: "requester_name", headerName: "Requester", width: 130 },
    { field: "requester_phone", headerName: "Phone", width: 130 },
    {
      field: "flag_reason",
      headerName: "Flag reason",
      flex: 1.2,
      minWidth: 180,
    },
    {
      field: "previous_status",
      headerName: "Was",
      width: 100,
      valueFormatter: (v) => v || "—",
    },
    {
      field: "flagged_at",
      headerName: "Flagged at",
      width: 160,
      valueFormatter: (v) => (v ? new Date(v).toLocaleString() : "—"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton size="small" onClick={() => setOpenRow(params.row)}>
            <VisibilityIcon fontSize="inherit" />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            disabled={busyId === params.row.id}
            onClick={() => handleRestore(params.row)}
            title="Restore"
          >
            {busyId === params.row.id ? (
              <CircularProgress size={16} />
            ) : (
              <UndoIcon fontSize="inherit" />
            )}
          </IconButton>
        </Box>
      ),
    },
  ];

  const filtered = requests.filter((row) => {
    const q = searchText.toLowerCase();
    return (
      row.patient_name?.toLowerCase().includes(q) ||
      row.flag_reason?.toLowerCase().includes(q) ||
      row.requester_phone?.toLowerCase().includes(q) ||
      row.requester_name?.toLowerCase().includes(q)
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
        Spam / Flagged requests
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Fake or unwanted requests removed from active queues. You can restore
        them if needed.
      </Typography>

      {warning ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {warning}
        </Alert>
      ) : null}

      <TextField
        fullWidth
        size="small"
        placeholder="Search flagged requests..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Paper elevation={3} sx={{ width: "100%", height: 600 }}>
        {loading ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        )}
      </Paper>

      <Dialog
        open={Boolean(openRow)}
        onClose={() => setOpenRow(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Flagged request details</DialogTitle>
        {openRow ? (
          <DialogContent dividers>
            {[
              ["Patient", openRow.patient_name],
              ["Blood", openRow.patient_blood_group],
              ["Requester", openRow.requester_name],
              ["Phone", openRow.requester_phone],
              ["Hospital", openRow.hospital_name],
              ["Flag reason", openRow.flag_reason],
              ["Previous status", openRow.previous_status],
              ["Flagged at", openRow.flagged_at],
              ["Note", openRow.special_note],
            ].map(([label, val]) => (
              <Typography key={label} sx={{ mb: 1 }}>
                <strong>{label}:</strong> {val || "—"}
              </Typography>
            ))}
          </DialogContent>
        ) : null}
        <DialogActions>
          <Button onClick={() => setOpenRow(null)}>Close</Button>
          {openRow ? (
            <Button
              variant="contained"
              onClick={() => {
                setOpenRow(null);
                handleRestore(openRow);
              }}
            >
              Restore
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
