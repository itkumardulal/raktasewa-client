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
import ChatIcon from "@mui/icons-material/Chat";
import ContactActionsDialog, {
  ContactQuickButtons,
  contactsFromRequest,
  contextFromRequest,
} from "../components/ContactActions";
import { DEFAULT_CONTACT_MESSAGE } from "../constants/contactTemplates";
import { sortByLatest } from "../utils/exportData";

export default function AllRequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRow, setOpenRow] = useState(null);
  const [contactRow, setContactRow] = useState(null);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [confirmingId, setConfirmingId] = useState(null); // loading state for per-row confirm

  const handleView = (row) => setOpenRow(row);
  const handleClose = () => setOpenRow(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchRequests();
        if (res.success && Array.isArray(res.requests)) {
          setRequests(sortByLatest(res.requests, "created_at"));
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
      headerName: "Contact",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span style={{ fontSize: 12 }}>{params.value}</span>
          <ContactQuickButtons
            phone={params.value}
            name={params.row.requester_name}
            role="Requester / Receiver"
            context={contextFromRequest(params.row)}
            defaultMessage={DEFAULT_CONTACT_MESSAGE}
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
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <IconButton
            size="small"
            onClick={() => handleView(params.row)}
            aria-label="view"
          >
            <VisibilityIcon fontSize="inherit" />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            onClick={() => setContactRow(params.row)}
            aria-label="contact"
          >
            <ChatIcon fontSize="inherit" />
          </IconButton>
        </>
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
          <Button
            variant="contained"
            color="success"
            onClick={() => setContactRow(openRow)}
          >
            Contact
          </Button>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <ContactActionsDialog
        open={Boolean(contactRow)}
        onClose={() => setContactRow(null)}
        contacts={contactsFromRequest(contactRow)}
        context={contextFromRequest(contactRow)}
        title="Contact requester / donor"
      />
    </Box>
  );
}
