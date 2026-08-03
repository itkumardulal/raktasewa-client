import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
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
  MenuItem,
  FormControlLabel,
  Switch,
  Checkbox,
  FormGroup,
  Typography,
  Divider,
  Chip,
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
import {
  ROLE_OPTIONS,
  ROLES,
  PRESETS,
  FEATURES,
  roleLabel,
  parsePermissions,
} from "../utils/permissions";

const emptyForm = () => ({
  email: "",
  full_name: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: ROLES.STAFF,
  is_active: true,
  permissions: [...PRESETS.operator],
});

export default function UserAccountPage() {
  const [rows, setRows] = useState([]);
  const [catalog, setCatalog] = useState(FEATURES);
  const [presets, setPresets] = useState(PRESETS);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [formMessage, setFormMessage] = useState(null);

  const groups = useMemo(() => {
    const map = {};
    catalog.forEach((f) => {
      if (!map[f.group]) map[f.group] = [];
      map[f.group].push(f);
    });
    return map;
  }, [catalog]);

  const resetForm = () => {
    setForm(emptyForm());
    setFormMessage(null);
    setEditingUserId(null);
  };

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const togglePermission = (key) => {
    setForm((prev) => {
      const set = new Set(prev.permissions);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      return { ...prev, permissions: [...set] };
    });
  };

  const applyPreset = (name) => {
    const list = presets[name] || PRESETS[name] || [];
    setForm((prev) => ({ ...prev, permissions: [...list] }));
  };

  const loadUsers = async () => {
    try {
      const res = await fetchUsers();
      if (res.success && Array.isArray(res.users)) {
        setRows(res.users.map((u) => ({ ...u, id: u.id })));
      }
      if (Array.isArray(res.features) && res.features.length) {
        setCatalog(res.features);
      }
      if (res.presets) setPresets(res.presets);
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

    if (!editingUserId && !form.password) {
      setFormMessage({
        type: "error",
        text: "Password is required for new users.",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: form.email,
        full_name: form.full_name || null,
        phone: form.phone || null,
        role: form.role,
        is_active: form.is_active,
        permissions:
          form.role === ROLES.SUPER_ADMIN ? [] : form.permissions,
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
        await loadUsers();
        resetForm();
        setOpen(false);
      } else {
        setFormMessage({
          type: "error",
          text: res.message || "Operation failed.",
        });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Server error. Please try again.";
      setFormMessage({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setForm({
      email: user.email || "",
      full_name: user.full_name || "",
      phone: user.phone || "",
      password: "",
      confirmPassword: "",
      role: user.role === ROLES.SUPER_ADMIN ? ROLES.SUPER_ADMIN : ROLES.STAFF,
      is_active: user.is_active !== 0 && user.is_active !== false,
      permissions: parsePermissions(user.permissions),
    });
    setEditingUserId(user.id);
    setFormMessage(null);
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
      setFormMessage({
        type: "error",
        text: err?.response?.data?.message || "Server error on delete.",
      });
    }
  };

  const columns = [
    {
      field: "full_name",
      headerName: "Name",
      flex: 1,
      minWidth: 120,
      valueFormatter: (value) => value || "—",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.2,
      minWidth: 160,
    },
    {
      field: "role",
      headerName: "Role",
      width: 140,
      valueFormatter: (value) => roleLabel(value),
    },
    {
      field: "is_active",
      headerName: "Active",
      width: 90,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value === 0 || params.value === false ? "Off" : "On"}
          color={params.value === 0 || params.value === false ? "default" : "success"}
        />
      ),
    },
    {
      field: "permissions",
      headerName: "Features",
      width: 100,
      valueGetter: (_v, row) =>
        row.role === ROLES.SUPER_ADMIN
          ? "All"
          : String(parsePermissions(row.permissions).length),
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 150,
      valueFormatter: (value) =>
        value ? dayjs(value).format("MMM D, YYYY") : "—",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
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

  const filteredRows = rows.filter((row) => {
    const q = searchText.toLowerCase();
    return (
      row.email?.toLowerCase().includes(q) ||
      row.full_name?.toLowerCase().includes(q) ||
      row.phone?.toLowerCase().includes(q)
    );
  });

  const isStaff = form.role === ROLES.STAFF;

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
          placeholder="Search name, email, phone"
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

      {formMessage && !open ? (
        <Alert severity={formMessage.type} sx={{ mb: 2 }}>
          {formMessage.text}
        </Alert>
      ) : null}

      <Paper elevation={3} sx={{ height: 520 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSizeOptions={[5, 10]}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
        />
      </Paper>

      <Dialog
        open={open}
        onClose={() => {
          document.activeElement?.blur();
          setTimeout(() => setOpen(false), 50);
          resetForm();
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingUserId ? "Edit User" : "Add New User"}
        </DialogTitle>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
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
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Full name"
                  value={form.full_name}
                  onChange={handleChange("full_name")}
                  fullWidth
                />
                <TextField
                  label="Phone"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  fullWidth
                />
              </Stack>
              <TextField
                label="Email"
                value={form.email}
                onChange={handleChange("email")}
                fullWidth
                required
                autoComplete="username"
              />
              <TextField
                select
                label="Role"
                value={form.role}
                onChange={handleChange("role")}
                fullWidth
                required
              >
                {ROLE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                  />
                }
                label="Account active"
              />
              <TextField
                label={editingUserId ? "New Password (optional)" : "Password"}
                type="password"
                value={form.password}
                onChange={handleChange("password")}
                fullWidth
                required={!editingUserId}
                autoComplete="new-password"
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                fullWidth
                required={!editingUserId || Boolean(form.password)}
                autoComplete="new-password"
              />

              {isStaff ? (
                <Box>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    Feature access
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                    <Button size="small" variant="outlined" onClick={() => applyPreset("admin")}>
                      Admin preset
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => applyPreset("operator")}>
                      Operator preset
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setForm((p) => ({ ...p, permissions: [] }))}
                    >
                      Clear
                    </Button>
                  </Stack>
                  {Object.entries(groups).map(([group, items]) => (
                    <Box key={group} sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {group}
                      </Typography>
                      <Divider sx={{ mb: 0.5 }} />
                      <FormGroup row>
                        {items.map((f) => (
                          <FormControlLabel
                            key={f.key}
                            control={
                              <Checkbox
                                size="small"
                                checked={form.permissions.includes(f.key)}
                                onChange={() => togglePermission(f.key)}
                              />
                            }
                            label={f.label}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">
                  Super Admin always has full access (all menus + delete + user management).
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                document.activeElement?.blur();
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
