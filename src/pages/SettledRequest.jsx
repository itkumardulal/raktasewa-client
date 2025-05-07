import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Typography,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp"; // import this at the top
import { DataGrid } from "@mui/x-data-grid";
import { fetchSettledRequests } from "../services/settleService";
import dayjs from "dayjs";

const SettledRequest = () => {
  const [settled, setSettled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchSettledRequests();
        if (res.success && Array.isArray(res.settled)) {
          setSettled(res.settled);
        } else {
          setError("Failed to fetch settled requests");
        }
      } catch (err) {
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
    { field: "settled_id", headerName: "ID", width: 70 },

    { field: "patient_name", headerName: "Patient", width: 200 },
    { field: "patient_blood_group", headerName: "Blood Group", width: 120 },
    {
      field: "requester_name",
      headerName: "Requester",
      minWidth: 150,
    },
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
    { field: "donor_name", headerName: "Donor", width: 200 },
    { field: "donor_blood_group", headerName: "Donor Group", width: 120 },
    {
      field: "donor_phone",
      headerName: "Donor Phone",
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
      field: "settled_at", // must match the actual key exactly
      headerName: "Settled At",
      width: 180,
      valueFormatter: (params) => {
        const val = params;
        return val ? dayjs(val).format("MMM D, YYYY h:mm A") : "N/A";
      },
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
          <Paper elevation={3} sx={{ width: "100%", height: 600 }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={(row) => row.settled_id}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              pagination
            />
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default SettledRequest;
