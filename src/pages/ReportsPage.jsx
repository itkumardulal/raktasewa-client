/* Reports & export — filter all admin data, CSV (Excel) + printable PDF */
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DataGrid } from "@mui/x-data-grid";
import { fetchReportData } from "../services/requestService";
import { downloadCsv, printPdfTable, sortByLatest } from "../utils/exportData";
import { ContactQuickButtons } from "../components/ContactActions";
import { DEFAULT_CONTACT_MESSAGE } from "../constants/contactTemplates";

const DATASETS = [
  { id: "requests", label: "Blood requests" },
  { id: "donors", label: "Donors" },
  { id: "settled", label: "Settled donations" },
  { id: "organizations", label: "Organizations" },
];

const REQUEST_STATUSES = ["all", "new", "unsettled", "settled"];
const DONOR_STATUSES = ["all", "pending", "available", "assigned"];
const BLOOD_GROUPS = ["all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function ContactCell({ phone, name, role, context }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        width: "100%",
        minWidth: 0,
        py: 0.5,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          maxWidth: 96,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
        title={phone || "No phone"}
      >
        {phone || "—"}
      </Typography>
      <ContactQuickButtons
        phone={phone}
        name={name}
        role={role}
        context={context || {}}
        defaultMessage={DEFAULT_CONTACT_MESSAGE}
      />
    </Box>
  );
}

function inDateRange(value, from, to) {
  if (!value) return !from && !to;
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return true;
  if (from) {
    const f = new Date(from);
    f.setHours(0, 0, 0, 0);
    if (t < f.getTime()) return false;
  }
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (t > end.getTime()) return false;
  }
  return true;
}

export default function ReportsPage() {
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataset, setDataset] = useState("requests");
  const [status, setStatus] = useState("all");
  const [bloodGroup, setBloodGroup] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchReportData();
      if (res.success) setRaw(res);
      else setError("Failed to load report data");
    } catch {
      setError("Server error while loading reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setStatus("all");
    setBloodGroup("all");
  }, [dataset]);

  const { rows, columns, exportColumns, title } = useMemo(() => {
    if (!raw) {
      return { rows: [], columns: [], exportColumns: [], title: "Report" };
    }

    const q = search.trim().toLowerCase();

    if (dataset === "requests") {
      let list = sortByLatest(raw.requests || [], "created_at");
      if (status !== "all") list = list.filter((r) => r.status === status);
      if (bloodGroup !== "all") {
        list = list.filter((r) => r.patient_blood_group === bloodGroup);
      }
      list = list.filter((r) => inDateRange(r.created_at, fromDate, toDate));
      if (q) {
        list = list.filter((r) =>
          [
            r.patient_name,
            r.requester_name,
            r.hospital_name,
            r.city_district,
            r.requester_phone,
            r.requester_alt_phone,
            r.requester_email,
            r.contact_person_at_hospital,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q)
        );
      }
      const exportColumns = [
        { key: "id", header: "ID" },
        { key: "patient_name", header: "Patient" },
        { key: "patient_blood_group", header: "Blood" },
        { key: "status", header: "Status" },
        { key: "urgency_level", header: "Urgency" },
        { key: "hospital_name", header: "Hospital" },
        { key: "city_district", header: "Area" },
        { key: "contact_person_at_hospital", header: "Hospital contact" },
        { key: "requester_name", header: "Requester" },
        { key: "requester_phone", header: "Requester phone" },
        { key: "requester_alt_phone", header: "Alt phone" },
        { key: "requester_email", header: "Email" },
        { key: "created_at", header: "Created" },
      ];
      return {
        title: "Blood requests report",
        exportColumns,
        rows: list.map((r) => ({ ...r, id: r.id })),
        columns: [
          { field: "id", headerName: "ID", width: 70 },
          { field: "patient_name", headerName: "Patient", flex: 1, minWidth: 120 },
          { field: "patient_blood_group", headerName: "Blood", width: 80 },
          { field: "status", headerName: "Status", width: 100 },
          { field: "requester_name", headerName: "Requester", width: 130 },
          {
            field: "requester_phone",
            headerName: "Requester contact",
            width: 210,
            sortable: false,
            renderCell: (params) => (
              <ContactCell
                phone={params.value}
                name={params.row.requester_name}
                role="Requester"
                context={{
                  patientName: params.row.patient_name,
                  bloodGroup: params.row.patient_blood_group,
                  status: params.row.status,
                }}
              />
            ),
          },
          {
            field: "requester_alt_phone",
            headerName: "Alt phone",
            width: 200,
            sortable: false,
            renderCell: (params) =>
              params.value ? (
                <ContactCell
                  phone={params.value}
                  name={params.row.requester_name}
                  role="Alternate phone"
                  context={{
                    patientName: params.row.patient_name,
                    bloodGroup: params.row.patient_blood_group,
                  }}
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  —
                </Typography>
              ),
          },
          {
            field: "requester_email",
            headerName: "Email",
            width: 160,
            valueFormatter: (value) => value || "—",
          },
          { field: "hospital_name", headerName: "Hospital", flex: 1, minWidth: 120 },
          {
            field: "contact_person_at_hospital",
            headerName: "Hospital person",
            width: 130,
            valueFormatter: (value) => value || "—",
          },
        ],
      };
    }

    if (dataset === "donors") {
      let list = sortByLatest(raw.donors || [], "created_at");
      if (status !== "all") list = list.filter((d) => d.status === status);
      if (bloodGroup !== "all") list = list.filter((d) => d.blood_group === bloodGroup);
      list = list.filter((d) => inDateRange(d.created_at, fromDate, toDate));
      if (q) {
        list = list.filter((d) =>
          [d.fullname, d.phone_number, d.email, d.address, d.blood_group]
            .join(" ")
            .toLowerCase()
            .includes(q)
        );
      }
      const exportColumns = [
        { key: "id", header: "ID" },
        { key: "fullname", header: "Name" },
        { key: "blood_group", header: "Blood" },
        { key: "gender", header: "Gender" },
        { key: "status", header: "Status" },
        { key: "phone_number", header: "Phone" },
        { key: "email", header: "Email" },
        { key: "address", header: "Address" },
        { key: "created_at", header: "Created" },
      ];
      return {
        title: "Donors report",
        exportColumns,
        rows: list.map((d) => ({ ...d, id: d.id })),
        columns: [
          { field: "id", headerName: "ID", width: 70 },
          { field: "fullname", headerName: "Name", flex: 1, minWidth: 130 },
          { field: "blood_group", headerName: "Blood", width: 80 },
          { field: "status", headerName: "Status", width: 100 },
          {
            field: "phone_number",
            headerName: "Phone / connect",
            width: 210,
            sortable: false,
            renderCell: (params) => (
              <ContactCell
                phone={params.value}
                name={params.row.fullname}
                role="Donor"
                context={{ bloodGroup: params.row.blood_group, status: params.row.status }}
              />
            ),
          },
          {
            field: "email",
            headerName: "Email",
            width: 170,
            valueFormatter: (value) => value || "—",
          },
          {
            field: "address",
            headerName: "Address",
            flex: 1,
            minWidth: 140,
            valueFormatter: (value) => value || "—",
          },
        ],
      };
    }

    if (dataset === "settled") {
      let list = sortByLatest(raw.settled || [], "settled_at");
      if (bloodGroup !== "all") {
        list = list.filter(
          (s) => s.patient_blood_group === bloodGroup || s.donor_blood_group === bloodGroup
        );
      }
      list = list.filter((s) => inDateRange(s.settled_at, fromDate, toDate));
      if (q) {
        list = list.filter((s) =>
          [
            s.patient_name,
            s.donor_name,
            s.hospital_name,
            s.requester_phone,
            s.donor_phone,
            s.requester_name,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q)
        );
      }
      const exportColumns = [
        { key: "settled_id", header: "Settled ID" },
        { key: "settled_at", header: "Settled at" },
        { key: "patient_name", header: "Patient" },
        { key: "patient_blood_group", header: "Patient blood" },
        { key: "requester_name", header: "Requester" },
        { key: "requester_phone", header: "Requester phone" },
        { key: "donor_name", header: "Donor" },
        { key: "donor_blood_group", header: "Donor blood" },
        { key: "donor_phone", header: "Donor phone" },
        { key: "hospital_name", header: "Hospital" },
        { key: "city_district", header: "Area" },
      ];
      return {
        title: "Settled donations report",
        exportColumns,
        rows: list.map((s) => ({ ...s, id: s.settled_id })),
        columns: [
          { field: "settled_id", headerName: "ID", width: 70 },
          { field: "settled_at", headerName: "Settled", width: 150 },
          { field: "patient_name", headerName: "Patient", width: 120 },
          { field: "patient_blood_group", headerName: "P.Blood", width: 80 },
          {
            field: "requester_phone",
            headerName: "Requester contact",
            width: 210,
            sortable: false,
            renderCell: (params) => (
              <ContactCell
                phone={params.value}
                name={params.row.requester_name}
                role="Requester"
                context={{
                  patientName: params.row.patient_name,
                  bloodGroup: params.row.patient_blood_group,
                  status: "settled",
                }}
              />
            ),
          },
          { field: "donor_name", headerName: "Donor", width: 120 },
          {
            field: "donor_phone",
            headerName: "Donor contact",
            width: 210,
            sortable: false,
            renderCell: (params) => (
              <ContactCell
                phone={params.value}
                name={params.row.donor_name}
                role="Donor"
                context={{
                  bloodGroup: params.row.donor_blood_group,
                  status: "settled",
                }}
              />
            ),
          },
          { field: "hospital_name", headerName: "Hospital", flex: 1, minWidth: 120 },
        ],
      };
    }

    let list = sortByLatest(raw.organizations || [], "created_at");
    list = list.filter((o) => inDateRange(o.created_at, fromDate, toDate));
    if (q) {
      list = list.filter((o) =>
        [o.name, o.contact_person, o.phone_number, o.email].join(" ").toLowerCase().includes(q)
      );
    }
    const exportColumns = [
      { key: "id", header: "ID" },
      { key: "name", header: "Name" },
      { key: "contact_person", header: "Contact person" },
      { key: "phone_number", header: "Phone" },
      { key: "email", header: "Email" },
      { key: "other_info", header: "Notes" },
      { key: "created_at", header: "Created" },
    ];
    return {
      title: "Organizations report",
      exportColumns,
      rows: list.map((o) => ({ ...o, id: o.id })),
      columns: [
        { field: "id", headerName: "ID", width: 70 },
        { field: "name", headerName: "Name", flex: 1, minWidth: 140 },
        {
          field: "contact_person",
          headerName: "Contact person",
          width: 140,
          valueFormatter: (value) => value || "—",
        },
        {
          field: "phone_number",
          headerName: "Phone / connect",
          width: 210,
          sortable: false,
          renderCell: (params) => (
            <ContactCell
              phone={params.value}
              name={params.row.contact_person || params.row.name}
              role="Organization"
              context={{ status: "organization" }}
            />
          ),
        },
        {
          field: "email",
          headerName: "Email",
          flex: 1,
          minWidth: 150,
          valueFormatter: (value) => value || "—",
        },
      ],
    };
  }, [raw, dataset, status, bloodGroup, fromDate, toDate, search]);

  const statusOptions = dataset === "donors" ? DONOR_STATUSES : REQUEST_STATUSES;
  const showStatus = dataset === "requests" || dataset === "donors";
  const showBlood = dataset !== "organizations";

  const handleCsv = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`raktasewa-${dataset}-${stamp}.csv`, rows, exportColumns);
  };

  const handlePdf = () => {
    printPdfTable(title, rows, exportColumns);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        Reports & export
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Phone numbers and contacts are shown with Call / WhatsApp so you can connect instantly.
        Export CSV/PDF still includes full contact fields.
      </Typography>

      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mb: 2, gap: 1 }}>
        {DATASETS.map((d) => (
          <Chip
            key={d.id}
            label={d.label}
            clickable
            color={dataset === d.id ? "primary" : "default"}
            variant={dataset === d.id ? "filled" : "outlined"}
            onClick={() => setDataset(d.id)}
          />
        ))}
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid", borderColor: "divider" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} flexWrap="wrap" useFlexGap>
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 200, flex: 1 }}
          />
          {showStatus ? (
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          {showBlood ? (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Blood</InputLabel>
              <Select
                label="Blood"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                {BLOOD_GROUPS.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          <TextField
            size="small"
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleCsv}
            disabled={!rows.length}
          >
            Excel / CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={handlePdf}
            disabled={!rows.length}
          >
            PDF
          </Button>
        </Stack>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {rows.length} row(s) · {title}
      </Typography>

      <Paper elevation={3} sx={{ width: "100%", height: 560 }}>
        {loading ? (
          <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            disableRowSelectionOnClick
            getRowHeight={() => "auto"}
            sx={{
              "& .MuiDataGrid-cell": {
                alignItems: "center",
                py: 0.5,
              },
            }}
          />
        )}
      </Paper>
    </Box>
  );
}
