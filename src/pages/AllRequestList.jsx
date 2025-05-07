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
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { fetchRequests } from "../services/requestService";
import AsyncDonorSelect from "../components/AsyncDonorSelect";
import { settleRequest } from "../services/settleService";
import Swal from "sweetalert2";
import WhatsAppIcon from "@mui/icons-material/WhatsApp"; // import this at the top

export default function AllRequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRow, setOpenRow] = useState(null);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [confirmingId, setConfirmingId] = useState(null); // loading state for per-row confirm

  const handleView = (row) => setOpenRow(row);
  const handleClose = () => setOpenRow(null);

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

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchRequests();
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

  const handleConfirm = async (row) => {
    if (!row.selectedDonor) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please select a donor first",
      });
      return;
    }

    setConfirmingId(row.id);
    await new Promise((res) => setTimeout(res, 3000)); // 3s delay

    const payload = {
      request: { id: row.id },
      donor: { id: row.selectedDonor.id },
    };

    try {
      await settleRequest(payload);

      await Swal.fire({
        icon: "success",
        title: "Request Settled 🎉",
        text: "The request has been successfully settled!",
        confirmButtonText: "OK",
      });

      window.location.reload(); // full reload after success
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to settle request",
        text: err.response?.data?.error || "Something went wrong",
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "patient_name",
      headerName: "Patient Name",
      flex: 1,
      minWidth: 150,
    },
    { field: "patient_blood_group", headerName: "Blood Group", width: 120 },
    // { field: "requester_phone", headerName: "Phone", width: 150 },
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
      field: "select_donor",
      headerName: "Select Donor",
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => (
        <AsyncDonorSelect
          value={params.row.selectedDonor}
          onChange={(donor) => {
            params.api.updateRows([{ id: params.id, selectedDonor: donor }]);
          }}
        />
      ),
    },
    {
      field: "confirm",
      headerName: "Confirm",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          disabled={!params.row.selectedDonor || confirmingId === params.row.id}
          onClick={() => handleConfirm(params.row)}
          startIcon={
            confirmingId === params.row.id ? (
              <CircularProgress size={16} color="inherit" />
            ) : null
          }
        >
          {confirmingId === params.row.id ? "Confirming..." : "Confirm"}
        </Button>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleView(params.row)}
          aria-label="view"
        >
          <VisibilityIcon fontSize="inherit" />
        </IconButton>
      ),
    },
  ];

  const rowsWithActions = requests.map((request) => ({
    ...request,
  }));

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const filteredRows = rowsWithActions.filter((row) => {
    return (
      row.patient_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.patient_blood_group
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      row.requester_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.requester_phone?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <TextField
        fullWidth
        placeholder="Search Requestor..."
        value={searchText}
        onChange={handleSearchChange}
      />
      <Paper elevation={3} sx={{ width: "100%", height: 600, mt: 2 }}>
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
            rows={filteredRows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            pagination
          />
        )}
      </Paper>

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
