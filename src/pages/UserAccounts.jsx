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
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../services/userService";

export default function UserAccountPage() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [formMessage, setFormMessage] = useState(null);

  const resetForm = () => {
    setForm({
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    });
    setFormMessage(null);
    setEditingUserId(null);
  };

  const handleChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const loadUsers = async () => {
    try {
      const res = await fetchUsers();
      if (res.success && Array.isArray(res.users)) {
        setRows(res.users.map((u) => ({ ...u, id: u.id })));
      }
    } catch {
      setFormMessage({ type: "error", text: "Failed to load users." });
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSave = async () => {
    if (!form.email) {
      setFormMessage({ type: "error", text: "Email is required." });
      return;
    }

    if (
      (form.password || form.confirmPassword) &&
      form.password !== form.confirmPassword
    ) {
      setFormMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: form.email,
        role: form.role,
      };

      if (form.password) {
        payload.password = form.password;
      }

      const res = editingUserId
        ? await updateUser(editingUserId, payload)
        : await addUser({ ...payload, password: form.password });

      if (res.success) {
        setFormMessage({
          type: "success",
          text: `User ${editingUserId ? "updated" : "added"} successfully.`,
        });

        await new Promise((resolve) => setTimeout(resolve, 500));
        await loadUsers();
        resetForm();
        setOpen(false);
      } else {
        setFormMessage({
          type: "error",
          text: res.message || "Operation failed.",
        });
        setOpen(false);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || "Server error. Please try again.";
      setFormMessage({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setForm({
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
    });
    setEditingUserId(user.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirm) return;

    try {
      const res = await deleteUser(id);
      if (res.success) {
        await loadUsers();
      } else {
        setFormMessage({
          type: "error",
          text: res.message || "Delete failed.",
        });
      }
    } catch (err) {
      setFormMessage({ type: "error", text: "Server error on delete." });
    }
  };

  const columns = [
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (params) =>
        dayjs(params.value).format("MMM D, YYYY h:mm A"),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center", // ✅ center vertically
            width: "100%",
            height: "100%", // ✅ stretch to cell height
            gap: 1,
          }}
        >
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row)}
            size="small"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filteredRows = rows.filter((row) =>
    row.email.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search by email"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          Add User
        </Button>
      </Box>

      <Paper elevation={3} sx={{ height: 500 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10]}
        />
      </Paper>

      {/* Modal */}
      <Dialog
        open={open}
        onClose={() => {
          document.activeElement?.blur(); // ✅ prevent aria-hidden warning
          setTimeout(() => setOpen(false), 50);
          resetForm();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingUserId ? "Edit User" : "Add New User"}
        </DialogTitle>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault(); // ✅ prevent page reload
            handleSave();
          }}
        >
          <DialogContent dividers>
            {formMessage && (
              <Alert severity={formMessage.type} sx={{ mb: 2 }}>
                {formMessage.text}
              </Alert>
            )}

            <Stack spacing={2} mt={1}>
              <TextField
                label="Email"
                value={form.email}
                onChange={handleChange("email")}
                fullWidth
                required
                autoComplete="username" // ✅ fixes the warning
              />
              <TextField
                label="New Password"
                type="password"
                value={form.password}
                onChange={handleChange("password")}
                fullWidth
                autoComplete="new-password" // ✅ fix
              />

              <TextField
                label="Confirm New Password"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                fullWidth
                autoComplete="new-password" // ✅ fix
              />
              <input type="hidden" value={form.role} readOnly />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                document.activeElement?.blur(); // ✅ fix for focus error
                setTimeout(() => setOpen(false), 50);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? (
                <CircularProgress size={22} sx={{ color: "#fff" }} />
              ) : editingUserId ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
