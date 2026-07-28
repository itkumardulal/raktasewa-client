/* src/pages/UnSettledRequest.jsx */
import React, { useState, useEffect } from "react";
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
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChatIcon from "@mui/icons-material/Chat";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import { fetchUnSettledRequests } from "../services/unsettledService";
import ContactActionsDialog, {
  ContactQuickButtons,
  contactsFromRequest,
  contextFromRequest,
} from "../components/ContactActions";
import UnsettledMatchPanel from "../components/UnsettledMatchPanel";
import { DEFAULT_CONTACT_MESSAGE } from "../constants/contactTemplates";
import { sortByLatest } from "../utils/exportData";
import AsyncDonorSelect from "../components/AsyncDonorSelect";
import { settleRequest } from "../services/settleService";
import Swal from "sweetalert2";

export default function UnSettledRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRow, setOpenRow] = useState(null);
  const [contactRow, setContactRow] = useState(null);
  const [error, setError] = useState(null);
  const [selectedById, setSelectedById] = useState({});
  const [confirmingId, setConfirmingId] = useState(null);

  const handleView = (row) => setOpenRow(row);
  const handleClose = () => setOpenRow(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUnSettledRequests();
      if (res.success && Array.isArray(res.requests)) {
        setRequests(sortByLatest(res.requests, "created_at"));
      } else {
        setError("Failed to load blood requests");
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
      await Swal.fire({ icon: "success", title: "Request settled" });
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
    { field: "patient_name", headerName: "Patient Name", flex: 1, minWidth: 150 },
    { field: "patient_blood_group", headerName: "Blood Group", width: 120 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => (params || "").toUpperCase(),
    },
    { field: "requester_name", headerName: "Requester", flex: 1, minWidth: 140 },
    {
      field: "requester_phone",
      headerName: "Contact",
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <ContactQuickButtons
          phone={params.value}
          name={params.row.requester_name}
          role="Requester / Receiver"
          context={contextFromRequest(params.row)}
          defaultMessage={DEFAULT_CONTACT_MESSAGE}
        />
      ),
    },
    {
      field: "select_donor",
      headerName: "Assign donor",
      flex: 1,
      minWidth: 170,
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
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          disabled={!selectedById[params.row.id] || confirmingId === params.row.id}
          onClick={() => handleConfirm(params.row)}
        >
          {confirmingId === params.row.id ? "…" : "Confirm"}
        </Button>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => params.value,
    },
  ];

  const rowsWithActions = requests.map((request) => ({
    ...request,
    actions: (
      <Stack direction="row" spacing={0}>
        <Tooltip title="View + matches">
          <IconButton
            size="small"
            onClick={() => handleView(request)}
            aria-label="view matches"
            color="error"
          >
            <BloodtypeIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <IconButton
          size="small"
          onClick={() => handleView(request)}
          aria-label="view"
        >
          <VisibilityIcon fontSize="inherit" />
        </IconButton>
        <IconButton
          size="small"
          color="secondary"
          onClick={() => setContactRow(request)}
          aria-label="contact"
        >
          <ChatIcon fontSize="inherit" />
        </IconButton>
      </Stack>
    ),
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Unsettled requests
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Includes requests older than 3 days that left the New queue, plus other unsettled needs.
        Open a row for donor matches and organization outreach, or assign a donor below to settle.
      </Typography>

      <Paper elevation={3} sx={{ width: "100%", height: 600 }}>
        {loading ? (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <DataGrid
            rows={rowsWithActions}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
          />
        )}
      </Paper>

      <Dialog
        open={Boolean(openRow)}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>Unsettled request · matches & outreach</DialogTitle>
        {openRow && (
          <DialogContent dividers>
            <Stack spacing={0.75} sx={{ mb: 1 }}>
              {[
                ["Patient", openRow.patient_name],
                ["Blood group", openRow.patient_blood_group],
                ["Urgency", openRow.urgency_level],
                ["Hospital", openRow.hospital_name],
                ["Area", openRow.city_district],
                ["Requester", `${openRow.requester_name || "—"} · ${openRow.requester_phone || ""}`],
                ["Note", openRow.special_note],
              ]
                .filter(([, val]) => val)
                .map(([label, val]) => (
                  <Typography key={label} variant="body2">
                    <strong>{label}:</strong> {String(val)}
                  </Typography>
                ))}
            </Stack>

            <UnsettledMatchPanel request={openRow} />
          </DialogContent>
        )}
        <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setContactRow(openRow)}
          >
            Contact requester
          </Button>
          <Button onClick={handleClose}>Close</Button>
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
