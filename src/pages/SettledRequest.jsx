import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Typography,
  IconButton,
  Stack,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { DataGrid } from "@mui/x-data-grid";
import { fetchSettledRequests } from "../services/settleService";
import dayjs from "dayjs";
import ContactActionsDialog, {
  ContactQuickButtons,
  contactsFromRequest,
  contextFromRequest,
} from "../components/ContactActions";
import { DEFAULT_CONTACT_MESSAGE } from "../constants/contactTemplates";

const SettledRequest = () => {
  const [settled, setSettled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [contactRow, setContactRow] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchSettledRequests();
        if (res.success && Array.isArray(res.settled)) {
          setSettled(res.settled);
        } else {
          setError("Failed to fetch settled requests");
        }
      } catch {
        setError("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const filteredRows = settled.filter((row) => {
    return (
      row.patient_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.requester_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.donor_name?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const columns = [
    { field: "settled_id", headerName: "ID", width: 70 },
    { field: "patient_name", headerName: "Patient", width: 160 },
    { field: "patient_blood_group", headerName: "Blood Group", width: 110 },
    {
      field: "requester_name",
      headerName: "Requester",
      minWidth: 130,
    },
    {
      field: "requester_phone",
      headerName: "Requester",
      width: 150,
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
    { field: "donor_name", headerName: "Donor", width: 150 },
    { field: "donor_blood_group", headerName: "Donor Group", width: 110 },
    {
      field: "donor_phone",
      headerName: "Donor",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <ContactQuickButtons
          phone={params.value}
          name={params.row.donor_name}
          role="Donor"
          context={contextFromRequest(params.row)}
          defaultMessage={DEFAULT_CONTACT_MESSAGE}
        />
      ),
    },
    {
      field: "settled_at",
      headerName: "Settled At",
      width: 180,
      valueFormatter: (params) => {
        const val = params;
        return val ? dayjs(val).format("MMM D, YYYY h:mm A") : "N/A";
      },
    },
    {
      field: "actions",
      headerName: "Message",
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          color="secondary"
          aria-label="contact both"
          onClick={() => setContactRow(params.row)}
        >
          <ChatIcon fontSize="inherit" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Settled Requests
      </Typography>

      <TextField
        fullWidth
        placeholder="Search by patient, requester, or donor..."
        value={searchText}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
      />

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
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.settled_id}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            pagination
          />
        )}
      </Paper>

      <ContactActionsDialog
        open={Boolean(contactRow)}
        onClose={() => setContactRow(null)}
        contacts={contactsFromRequest(contactRow)}
        context={contextFromRequest(contactRow)}
        title="Contact requester & donor"
      />
    </Box>
  );
};

export default SettledRequest;
