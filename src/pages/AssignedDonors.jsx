/* Assigned donors — waiting-day counters after donation */
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { fetchAssignedDonors, updateDonorStatus } from "../services/donorService";
import ContactActionsDialog, {
  ContactQuickButtons,
  contactsFromDonor,
} from "../components/ContactActions";
import { DEFAULT_CONTACT_MESSAGE } from "../constants/contactTemplates";
import { sortByLatest } from "../utils/exportData";
import Swal from "sweetalert2";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AssignedDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("all"); // all | waiting | eligible
  const [contactRow, setContactRow] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAssignedDonors();
      if (res.success && Array.isArray(res.donors)) {
        setDonors(sortByLatest(res.donors, "last_donation"));
      } else {
        setError("Failed to load assigned donors");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAvailable = async (row) => {
    const ok = await Swal.fire({
      icon: "question",
      title: "Mark available again?",
      text: row.eligible_now
        ? "Waiting period looks complete. Donor will return to enrolled/available list."
        : `Recommended wait still has ~${row.days_remaining} day(s). Mark available only if medically cleared.`,
      showCancelButton: true,
      confirmButtonText: "Mark available",
    });
    if (!ok.isConfirmed) return;

    setUpdatingId(row.id);
    try {
      await updateDonorStatus(row.id, "available");
      await Swal.fire({ icon: "success", title: "Donor is available again" });
      await load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err.response?.data?.message || "Could not update status",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    let rows = donors;
    if (filter === "waiting") rows = rows.filter((d) => d.wait_status === "waiting");
    if (filter === "eligible") rows = rows.filter((d) => d.eligible_now);
    const q = searchText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (d) =>
        d.fullname?.toLowerCase().includes(q) ||
        d.blood_group?.toLowerCase().includes(q) ||
        d.phone_number?.toLowerCase().includes(q) ||
        d.address?.toLowerCase().includes(q)
    );
  }, [donors, filter, searchText]);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "fullname", headerName: "Donor", flex: 1, minWidth: 150 },
    { field: "blood_group", headerName: "Blood", width: 90 },
    { field: "gender", headerName: "Gender", width: 100 },
    {
      field: "last_donation",
      headerName: "Last donation",
      width: 130,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: "donation_count",
      headerName: "Donations",
      width: 100,
    },
    {
      field: "days_since_donation",
      headerName: "Days since",
      width: 110,
      valueFormatter: (value) => (value == null ? "—" : `${value}d`),
    },
    {
      field: "wait",
      headerName: "Waiting / eligible",
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params) => {
        const row = params.row;
        if (row.wait_status === "no_record") {
          return <Chip size="small" label="No donation date" />;
        }
        if (row.eligible_now) {
          return (
            <Chip
              size="small"
              color="success"
              label={`Eligible · interval ${row.interval_days}d`}
            />
          );
        }
        return (
          <Chip
            size="small"
            color="warning"
            label={`Wait ${row.days_remaining}d / ${row.interval_days}d · next ${formatDate(row.next_eligible_date)}`}
          />
        );
      },
    },
    {
      field: "contact",
      headerName: "Contact",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <ContactQuickButtons
          phone={params.row.phone_number}
          name={params.row.fullname}
          role="Assigned donor"
          context={{ bloodGroup: params.row.blood_group, status: params.row.status }}
          defaultMessage={DEFAULT_CONTACT_MESSAGE}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          disabled={updatingId === params.row.id}
          onClick={() => markAvailable(params.row)}
        >
          {updatingId === params.row.id ? "…" : "Make available"}
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        Assigned donors
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Donors linked to settled requests. Waiting counters use whole-blood guidance — about{" "}
        <strong>90 days (men)</strong> / <strong>120 days (women)</strong> — before marking
        available again.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search assigned donors…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Stack direction="row" spacing={1}>
          {[
            ["all", "All"],
            ["waiting", "Still waiting"],
            ["eligible", "Eligible again"],
          ].map(([key, label]) => (
            <Chip
              key={key}
              label={label}
              clickable
              color={filter === key ? "primary" : "default"}
              variant={filter === key ? "filled" : "outlined"}
              onClick={() => setFilter(key)}
            />
          ))}
        </Stack>
      </Stack>

      <Paper elevation={3} sx={{ width: "100%", height: 600 }}>
        {loading ? (
          <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        )}
      </Paper>

      <ContactActionsDialog
        open={Boolean(contactRow)}
        onClose={() => setContactRow(null)}
        contacts={contactsFromDonor(contactRow)}
        context={{ bloodGroup: contactRow?.blood_group, status: contactRow?.status }}
        title="Contact assigned donor"
      />
    </Box>
  );
}
