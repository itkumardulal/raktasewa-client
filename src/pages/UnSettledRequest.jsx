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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChatIcon from "@mui/icons-material/Chat";
import { fetchUnSettledRequests } from "../services/unsettledService";
import ContactActionsDialog, {
  ContactQuickButtons,
  contactsFromRequest,
  contextFromRequest,
} from "../components/ContactActions";
import { DEFAULT_CONTACT_MESSAGE } from "../constants/contactTemplates";

export default function UnSettledRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRow, setOpenRow] = useState(null);
  const [contactRow, setContactRow] = useState(null);
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
      } catch {
        setError("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => params.value,
    },
  ];

  const rowsWithActions = requests.map((request) => ({
    ...request,
    actions: (
      <Stack direction="row" spacing={0}>
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
      >
        <DialogTitle>Blood Request Details</DialogTitle>
        {openRow && (
          <DialogContent dividers>
            {Object.entries(openRow).map(([key, val]) =>
              key !== "actions" ? (
                <Typography key={key} sx={{ mb: 1 }}>
                  <strong>{key.replace(/_/g, " ")}:</strong> {String(val)}
                </Typography>
              ) : null
            )}
          </DialogContent>
        )}
        <DialogActions>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setContactRow(openRow);
            }}
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
        title="Contact requester"
      />
    </Box>
  );
}
