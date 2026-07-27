import React, { useState, useEffect, Fragment } from "react";
import Swal from "sweetalert2";
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
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatIcon from "@mui/icons-material/Chat";
import {
  deleteDonor,
  fetchPendingDonors,
  updateDonor,
  updateDonorStatus,
} from "../services/donorService";
import { DONOR_STATUSES } from "../constants/constants";
import ContactActionsDialog, {
  ContactQuickButtons,
  contactsFromDonor,
} from "../components/ContactActions";
import { DEFAULT_CONTACT_MESSAGE } from "../constants/contactTemplates";

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "fullname", headerName: "Full Name", flex: 1, minWidth: 150 },
  { field: "age", headerName: "Age", width: 100 },
  { field: "gender", headerName: "Gender", width: 100 },
  { field: "blood_group", headerName: "Blood", width: 100 },
  { field: "phone_number", headerName: "Phone Number", width: 150 },
  {
    field: "whatsapp",
    headerName: "Contact",
    width: 150,
    sortable: false,
    filterable: false,
    renderCell: (params) => params.value,
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      const handleChange = async (e) => {
        const newStatus = e.target.value;

        try {
          await updateDonorStatus(params.row.id, newStatus);
          window.location.reload();
        } catch (err) {
          console.log("Server error during status update", err);
        }
      };

      return (
        <TextField
          select
          size="small"
          fullWidth
          defaultValue={params.row.status}
          onChange={handleChange}
        >
          {DONOR_STATUSES.map((s, index) => (
            <MenuItem key={index} value={s}>
              {s.toUpperCase()}
            </MenuItem>
          ))}
        </TextField>
      );
    },
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 150,
    sortable: false,
    filterable: false,
    renderCell: (params) => params.value,
  },
];

export default function PendingDonor() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRow, setOpenRow] = useState(null);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [openEditRow, setOpenEditRow] = useState(null);
  const [contactRow, setContactRow] = useState(null);

  const handleView = (row) => setOpenRow(row);
  const handleClose = () => setOpenRow(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchPendingDonors();
        if (res.success && Array.isArray(res.donors)) {
          setDonors(res.donors);
        } else {
          setError("Failed to load donors");
        }
      } catch (err) {
        setError("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rowsWithActions = donors.map((donor) => ({
    ...donor,
    actions: (
      <Fragment>
        <IconButton size="small" onClick={() => handleView(donor)}>
          <VisibilityIcon fontSize="inherit" />
        </IconButton>
        <IconButton
          size="small"
          aria-label="edit"
          onClick={() => setOpenEditRow(donor)}
        >
          <EditIcon fontSize="inherit" />
        </IconButton>

        <IconButton
          size="small"
          aria-label="delete"
          color="error"
          onClick={() => handleDelete(donor)}
        >
          <DeleteIcon fontSize="inherit" />
        </IconButton>
        <IconButton
          size="small"
          color="secondary"
          aria-label="contact"
          onClick={() => setContactRow(donor)}
        >
          <ChatIcon fontSize="inherit" />
        </IconButton>
      </Fragment>
    ),
    whatsapp: (
      <ContactQuickButtons
        phone={donor.phone_number}
        name={donor.fullname}
        role="Donor"
        defaultMessage={DEFAULT_CONTACT_MESSAGE}
        context={{ bloodGroup: donor.blood_group, status: donor.status }}
      />
    ),
  }));

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Filter the rows based on search
  const filteredRows = rowsWithActions.filter((row) => {
    return (
      row.fullname?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.blood_group?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.phone_number?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Delete donor: ${row.fullname}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteDonor(row.id, { is_deleted: 1 });

        if (res.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Donor deleted successfully.",
            timer: 1500,
            showConfirmButton: false,
          });

          // Reload donors
          const fresh = await fetchPendingDonors();
          if (fresh.success) {
            setDonors(fresh.donors);
          }
        } else {
          Swal.fire("Error", res.message || "Delete failed.", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Server error during deletion.", "error");
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 🔎 Search Box */}
      <Box sx={{ mb: 2, width: 300 }}>
        <TextField
          fullWidth
          placeholder="Search donors..."
          value={searchText}
          onChange={handleSearchChange}
        />
      </Box>

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
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            pagination
          />
        )}
      </Paper>

      {/* View Modal */}
      <Dialog
        open={Boolean(openRow)}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus={false} // <- important
      >
        <DialogTitle>Donor Details</DialogTitle>

        {openRow && (
          <DialogContent dividers>
            {Object.entries(openRow).map(([key, val]) =>
              key !== "actions" && key !== "whatsapp" ? (
                key === "history" ? (
                  // 📋 Special Case for History
                  <Box key={key} sx={{ mb: 2 }}>
                    <Typography sx={{ mb: 1 }}>
                      <strong>History:</strong>
                    </Typography>
                    <TextField
                      value={val || ""}
                      fullWidth
                      multiline
                      minRows={3}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Box>
                ) : (
                  // Default display for other fields
                  <Typography key={key} sx={{ mb: 1 }}>
                    <strong>{key.replace(/_/g, " ")}:</strong> {val}
                  </Typography>
                )
              ) : null
            )}
          </DialogContent>
        )}

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={Boolean(openEditRow)}
        onClose={() => setOpenEditRow(null)}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus={false} // <- important
      >
        <DialogTitle>Edit Donor Details</DialogTitle>
        {openEditRow && (
          <Box
            component="form"
            onSubmit={async (e) => {
              e.preventDefault();

              try {
                const payload = {
                  fullName: openEditRow.fullname,
                  age: openEditRow.age,
                  gender: openEditRow.gender,
                  blood_group: openEditRow.blood_group,
                  email: openEditRow.email,
                  phone_number: openEditRow.phone_number,
                  address: openEditRow.address,
                  history: openEditRow.history || "",
                };

                const res = await updateDonor(openEditRow.id, payload);

                if (res.success) {
                  // alert("Donor updated successfully!");
                  setOpenEditRow(null);
                  // optional: reload donors list after update
                  const fresh = await fetchPendingDonors();
                  if (fresh.success) {
                    setDonors(fresh.donors);
                  }
                } else {
                  alert("Update failed.");
                }
              } catch (error) {
                alert("Server error during update.");
              }
            }}
          >
            <DialogContent dividers>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Full Name"
                  value={openEditRow.fullname}
                  onChange={(e) =>
                    setOpenEditRow((prev) => ({
                      ...prev,
                      fullname: e.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Age"
                  value={openEditRow.age}
                  onChange={(e) =>
                    setOpenEditRow((prev) => ({
                      ...prev,
                      age: e.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Gender"
                  value={openEditRow.gender}
                  onChange={(e) =>
                    setOpenEditRow((prev) => ({
                      ...prev,
                      gender: e.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Blood Group"
                  value={openEditRow.blood_group}
                  onChange={(e) =>
                    setOpenEditRow((prev) => ({
                      ...prev,
                      blood_group: e.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Email"
                  value={openEditRow.email}
                  onChange={(e) =>
                    setOpenEditRow((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Phone Number"
                  value={openEditRow.phone_number}
                  onChange={(e) =>
                    setOpenEditRow((prev) => ({
                      ...prev,
                      phone_number: e.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Address"
                  value={openEditRow.address}
                  onChange={(e) =>
                    setOpenEditRow((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  fullWidth
                />

                <TextField
                  label="History"
                  value={openEditRow.history || ""}
                  onChange={(e) =>
                    setOpenEditRow((prev) => ({
                      ...prev,
                      history: e.target.value,
                    }))
                  }
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpenEditRow(null)}>Cancel</Button>
              <Button type="submit" variant="contained">
                Save
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      <ContactActionsDialog
        open={Boolean(contactRow)}
        onClose={() => setContactRow(null)}
        contacts={contactsFromDonor(contactRow)}
        context={{
          bloodGroup: contactRow?.blood_group,
          status: contactRow?.status,
          patientName: contactRow?.fullname,
        }}
        title="Contact pending donor"
      />
    </Box>
  );
}
