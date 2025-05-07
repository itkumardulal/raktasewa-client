/* src/pages/NewRequestList.jsx */
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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { fetchUnSettledRequests } from "../services/unsettledService";
import WhatsAppIcon from "@mui/icons-material/WhatsApp"; // import this at the top

const handleWhatsApp = (phone_number) => {
  const phoneNumber = phone_number;

  if (!phoneNumber) {
    alert("Phone number is missing.");
    return;
  }

  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");

  window.open(
    `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
      "Hi! We are contacting you regarding a blood donation request."
    )}`,
    "_blank"
  );
};

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "patient_name", headerName: "Patient Name", flex: 1, minWidth: 150 },
  { field: "patient_blood_group", headerName: "Blood Group", width: 120 },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    minWidth: 150,
    valueFormatter: (params) => (params || "").toUpperCase(),
  },
  { field: "requester_name", headerName: "Requester", flex: 1, minWidth: 150 },
  {
    field: "requester_phone",
    headerName: "Requester Phone",
    width: 250,
    renderCell: (params) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <span>{params.value}</span>
        <WhatsAppIcon
          fontSize="small"
          color="success"
          sx={{ cursor: "pointer" }}
          onClick={() => handleWhatsApp(params.value)}
        />
      </Box>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 100,
    sortable: false,
    filterable: false,
    renderCell: (params) => params.value,
  },
];

export default function UnSettledRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRow, setOpenRow] = useState(null);
  const [error, setError] = useState(null);

  const handleView = (row) => setOpenRow(row);
  const handleClose = () => setOpenRow(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchUnSettledRequests();
        if (res.success && Array.isArray(res.requests)) {
          setRequests(res.requests);
        } else {
          setError("Failed to load blood requests");
        }
      } catch (err) {
        setError("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rowsWithActions = requests.map((request) => ({
    ...request,
    actions: (
      <IconButton
        size="small"
        onClick={() => handleView(request)}
        aria-label="view"
      >
        <VisibilityIcon fontSize="inherit" />
      </IconButton>
    ),
  }));

  return (
    <Box sx={{ p: 3 }}>
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

      {/* View Modal */}
      <Dialog
        open={Boolean(openRow)}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Blood Request Details</DialogTitle>
        {openRow && (
          <DialogContent dividers>
            {Object.entries(openRow).map(([key, val]) =>
              key !== "actions" ? (
                <Typography key={key} sx={{ mb: 1 }}>
                  <strong>{key.replace(/_/g, " ")}:</strong> {val}
                </Typography>
              ) : null
            )}
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
