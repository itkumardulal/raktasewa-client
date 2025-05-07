import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  fetchOrganizations,
  addOrganization,
  updateOrganization,
  deleteOrganization,
} from "../services/organizationService";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function Organization() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [formMessage, setFormMessage] = useState(null);
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    phone_number: "",
    email: "",
    other_info: "",
  });
  const [viewRow, setViewRow] = useState(null); // ✅ store full row object

  const [viewInfoOpen, setViewInfoOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const handleChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const resetForm = () => {
    setForm({
      name: "",
      contact_person: "",
      phone_number: "",
      email: "",
      other_info: "",
    });
    setEditingRow(null);
    setFormMessage(null);
  };

  const loadOrganizations = async () => {
    try {
      const res = await fetchOrganizations();
      if (res.success && Array.isArray(res.organizations)) {
        setRows(res.organizations.map((org) => ({ ...org, id: org.id })));
      }
    } catch {
      setFormMessage({ type: "error", text: "Failed to load organizations." });
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.phone_number) {
      setFormMessage({
        type: "error",
        text: "Name and phone number are required.",
      });
      return;
    }

    try {
      let res;
      if (editingRow) {
        res = await updateOrganization(editingRow, form);
      } else {
        res = await addOrganization(form);
      }

      if (res.success) {
        setFormMessage({
          type: "success",
          text: `${editingRow ? "Updated" : "Added"} successfully.`,
        });
        await loadOrganizations();
        setOpen(false);
        resetForm();
      } else {
        setFormMessage({
          type: "error",
          text: res.message || "Operation failed.",
        });
      }
    } catch {
      setFormMessage({
        type: "error",
        text: "Server error. Please try again.",
      });
    }
  };

  const handleEdit = (row) => {
    setForm(row);
    setEditingRow(row.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this organization?"
    );
    if (!confirmed) return;

    try {
      const res = await deleteOrganization(id);
      if (res.success) {
        await loadOrganizations();
      } else {
        setFormMessage({
          type: "error",
          text: res.message || "Failed to delete.",
        });
      }
    } catch {
      setFormMessage({ type: "error", text: "Server error during deletion." });
    }
  };

  const columns = [
    { field: "name", headerName: "Organization Name", flex: 1 },
    { field: "contact_person", headerName: "Contact Person", flex: 1 },
    { field: "phone_number", headerName: "Phone Number", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filterable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            color="info"
            onClick={() => {
              setViewRow(params.row);
              setViewInfoOpen(true);
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Organizations</Typography>
        <Button
          variant="contained"
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          Add Organization
        </Button>
      </Box>

      <Paper elevation={3} sx={{ height: 500 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10]}
        />
      </Paper>

      {/* Add/Edit Modal */}
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingRow ? "Edit Organization" : "Add New Organization"}
        </DialogTitle>
        <DialogContent dividers>
          {formMessage && (
            <Alert severity={formMessage.type} sx={{ mb: 2 }}>
              {formMessage.text}
            </Alert>
          )}
          <Stack spacing={2} mt={1}>
            <TextField
              label="Organization Name"
              value={form.name}
              onChange={handleChange("name")}
              fullWidth
            />
            <TextField
              label="Contact Person"
              value={form.contact_person}
              onChange={handleChange("contact_person")}
              fullWidth
            />
            <TextField
              label="Phone Number"
              value={form.phone_number}
              onChange={handleChange("phone_number")}
              fullWidth
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={handleChange("email")}
              fullWidth
            />
            <TextField
              label="Other Info"
              value={form.other_info}
              onChange={handleChange("other_info")}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {editingRow ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Info Modal */}
      <Dialog
        open={viewInfoOpen}
        onClose={() => setViewInfoOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Organization Details</DialogTitle>
        <DialogContent dividers>
          {viewRow && (
            <Stack spacing={1}>
              <Typography>
                <strong>Organization Name:</strong> {viewRow.name}
              </Typography>
              <Typography>
                <strong>Contact Person:</strong> {viewRow.contact_person}
              </Typography>
              <Typography>
                <strong>Phone Number:</strong> {viewRow.phone_number}
              </Typography>
              <Typography>
                <strong>Email:</strong> {viewRow.email}
              </Typography>
              <Typography>
                <strong>Other Info:</strong>
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {viewRow.other_info || "—"}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewInfoOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
