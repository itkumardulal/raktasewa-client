/* New requests = status "new" within last 3 days (older auto-moved to unsettled). */
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChatIcon from "@mui/icons-material/Chat";
import { fetchTodayRequests } from "../services/requestService";
import AsyncDonorSelect from "../components/AsyncDonorSelect";
import { settleRequest } from "../services/settleService";
import Swal from "sweetalert2";
import ContactActionsDialog, {
  ContactQuickButtons,
  contactsFromRequest,
  contextFromRequest,
} from "../components/ContactActions";
import UnsettledMatchPanel from "../components/UnsettledMatchPanel";
import { DEFAULT_CONTACT_MESSAGE } from "../constants/contactTemplates";
import { sortByLatest } from "../utils/exportData";
import { useAdminNotificationsContext } from "../contexts/AdminNotificationsContext";

function daysOpen(createdAt) {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  created.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today - created) / 86400000));
}

export default function NewRequestList() {
  const { markRequestIdsSeen } = useAdminNotificationsContext();
  const [requests, setRequests] = useState([]);
  const [windowDays, setWindowDays] = useState(3);
  const [loading, setLoading] = useState(true);
  const [openRow, setOpenRow] = useState(null);
  const [contactRow, setContactRow] = useState(null);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);
  const [selectedById, setSelectedById] = useState({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTodayRequests();
      if (res.success && Array.isArray(res.requests)) {
        const list = sortByLatest(res.requests, "created_at");
        setRequests(list);
        if (res.window_days) setWindowDays(res.window_days);
        // Opening this page counts as seen → badge decreases
        markRequestIdsSeen(list.map((r) => r.id));
      } else {
        setError("Failed to load new requests");
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

  const handleConfirm = async (row) => {
    const donor = selectedById[row.id];
    if (!donor?.id) {
      Swal.fire({ icon: "error", title: "Select a donor first" });
      return;
    }
    setConfirmingId(row.id);
    try {
      await settleRequest({ request: { id: row.id }, donor: { id: donor.id } });
      await Swal.fire({
        icon: "success",
        title: "Request settled",
        text: "Donor marked assigned. Waiting-day counter starts from this donation.",
      });
      setSelectedById((prev) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
      await load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to settle",
        text: err.response?.data?.error || "Something went wrong",
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "patient_name", headerName: "Patient", flex: 1, minWidth: 140 },
    { field: "patient_blood_group", headerName: "Blood", width: 90 },
    {
      field: "age_days",
      headerName: "Days open",
      width: 110,
      valueGetter: (_v, row) => daysOpen(row.created_at),
      renderCell: (params) => {
        const d = params.value;
        const left = d == null ? "—" : Math.max(0, windowDays - d);
        return (
          <Chip
            size="small"
            color={left <= 1 ? "warning" : "default"}
            label={d == null ? "—" : `${d}d · ${left}d left`}
          />
        );
      },
    },
    {
      field: "urgency_level",
      headerName: "Urgency",
      width: 110,
    },
    {
      field: "requester_phone",
      headerName: "Contact",
      width: 170,
      sortable: false,
      renderCell: (params) => (
        <ContactQuickButtons
          phone={params.value}
          name={params.row.requester_name}
          role="Requester"
          context={contextFromRequest(params.row)}
          defaultMessage={DEFAULT_CONTACT_MESSAGE}
        />
      ),
    },
    {
      field: "select_donor",
      headerName: "Assign donor",
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => (
        <AsyncDonorSelect
          value={selectedById[params.row.id] || null}
          onChange={(donor) =>
            setSelectedById((prev) => ({ ...prev, [params.row.id]: donor }))
          }
        />
      ),
    },
    {
      field: "confirm",
      headerName: "Settle",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          disabled={!selectedById[params.row.id] || confirmingId === params.row.id}
          onClick={() => handleConfirm(params.row)}
        >
          {confirmingId === params.row.id ? "…" : "Confirm"}
        </Button>
      ),
    },
    {
      field: "actions",
      headerName: "More",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton size="small" onClick={() => setOpenRow(params.row)}>
            <VisibilityIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" color="secondary" onClick={() => setContactRow(params.row)}>
            <ChatIcon fontSize="inherit" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter(
      (row) =>
        row.patient_name?.toLowerCase().includes(q) ||
        row.patient_blood_group?.toLowerCase().includes(q) ||
        row.requester_name?.toLowerCase().includes(q) ||
        row.requester_phone?.toLowerCase().includes(q) ||
        row.hospital_name?.toLowerCase().includes(q)
    );
  }, [requests, searchText]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        New requests
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing latest unsettled <strong>new</strong> requests from the last {windowDays} days.
        Older new requests automatically move to <strong>Unsettled</strong>. Assign a donor and
        confirm to settle.
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder="Search patient, blood group, hospital, phone…"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Paper elevation={3} sx={{ width: "100%", height: 560 }}>
        {loading ? (
          <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
          />
        )}
      </Paper>

      <Dialog open={Boolean(openRow)} onClose={() => setOpenRow(null)} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle>New request · match & connect</DialogTitle>
        {openRow && (
          <DialogContent dividers>
            <Stack spacing={0.75} sx={{ mb: 1 }}>
              {[
                ["Patient", openRow.patient_name],
                ["Blood", openRow.patient_blood_group],
                ["Hospital", openRow.hospital_name],
                ["Area", openRow.city_district],
                ["Urgency", openRow.urgency_level],
                ["Requester", `${openRow.requester_name || "—"} · ${openRow.requester_phone || ""}`],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <Typography key={k} variant="body2">
                    <strong>{k}:</strong> {String(v)}
                  </Typography>
                ))}
            </Stack>
            <UnsettledMatchPanel request={openRow} />
          </DialogContent>
        )}
        <DialogActions>
          <Button color="secondary" onClick={() => setContactRow(openRow)}>
            Contact requester
          </Button>
          <Button onClick={() => setOpenRow(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <ContactActionsDialog
        open={Boolean(contactRow)}
        onClose={() => setContactRow(null)}
        contacts={contactsFromRequest(contactRow)}
        context={contextFromRequest(contactRow)}
        title="Contact requester"
      />
    </Box>
  );
}
