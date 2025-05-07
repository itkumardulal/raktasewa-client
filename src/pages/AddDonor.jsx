/* src/pages/AddDonorPage.jsx */
import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from "@mui/material";
import { addDonor } from "../services/donorService";

function FieldRow({ label, children }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
      <Typography sx={{ width: 150, textAlign: "right", fontWeight: 500 }}>
        {label}
      </Typography>
      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </Box>
  );
}

const maroon = "#ff3b30";

const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "I don't know",
];
const genders = ["Male", "Female", "Other"];

export default function AddDonorPage() {
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "",
    bloodGroup: "",
    email: "",
    phone: "",
    address: "",
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCheck = (e) =>
    setForm((prev) => ({ ...prev, agree: e.target.checked }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        fullName: form.fullName,
        age: form.age,
        gender: form.gender,
        blood_group: form.bloodGroup,
        email: form.email,
        phone_number: form.phone,
        address: form.address,
        agree_to_terms: form.agree ? 1 : 0,
        source: "portal",
      };

      const response = await addDonor(payload);

      if (response.success) {
        setMessage({
          type: "success",
          text: response.message || "Donor added successfully!",
        });
        setForm({
          fullName: "",
          age: "",
          gender: "",
          bloodGroup: "",
          email: "",
          phone: "",
          address: "",
          agree: false,
        });
      } else {
        setMessage({
          type: "error",
          text: response.message || "Something went wrong.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Network error. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 6, px: { xs: 2, md: 4 } }}>
      <Paper
        component="form"
        onSubmit={submit}
        elevation={8}
        sx={{
          p: { xs: 3, md: 5 },
          width: "100%",
          maxWidth: 1000,
          mx: "auto",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Add Donor Details
        </Typography>

        {/* ✅ Success or Error Message */}
        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        {/* 🔥 Two Column Layout Fields */}
        <FieldRow label="Full Name:">
          <TextField
            fullWidth
            value={form.fullName}
            onChange={handleChange("fullName")}
            required
          />
        </FieldRow>

        <FieldRow label="Age:">
          <TextField
            fullWidth
            type="number"
            value={form.age}
            onChange={handleChange("age")}
            required
            slotProps={{ input: { min: 0 } }}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
            }}
          />
        </FieldRow>

        <FieldRow label="Gender:">
          <Select
            fullWidth
            displayEmpty
            value={form.gender}
            onChange={handleChange("gender")}
            required
          >
            <MenuItem value="" disabled>
              <em>Select gender</em>
            </MenuItem>
            {genders.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </Select>
        </FieldRow>

        <FieldRow label="Blood Group:">
          <Select
            fullWidth
            displayEmpty
            value={form.bloodGroup}
            onChange={handleChange("bloodGroup")}
            required
          >
            <MenuItem value="" disabled>
              <em>Select blood group</em>
            </MenuItem>
            {bloodGroups.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </Select>
        </FieldRow>

        <FieldRow label="Email:">
          <TextField
            fullWidth
            value={form.email}
            onChange={handleChange("email")}
          />
        </FieldRow>

        <FieldRow label="Phone:">
          <TextField
            fullWidth
            value={form.phone}
            onChange={handleChange("phone")}
            required
          />
        </FieldRow>

        <FieldRow label="Address:">
          <TextField
            fullWidth
            value={form.address}
            onChange={handleChange("address")}
            multiline
            minRows={2}
          />
        </FieldRow>

        <FieldRow>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.agree}
                onChange={handleCheck}
                size="small"
              />
            }
            label={
              <Typography variant="caption">
                I agree to the collection and use of my personal information for
                processing my blood donation record.
              </Typography>
            }
          />
        </FieldRow>

        <Box textAlign="center" mt={4}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!form.agree || loading}
            sx={{
              bgcolor: maroon,
              "&:hover": { bgcolor: "#6a0000" },
              textTransform: "none",
              py: 1.3,
              fontSize: "1rem",
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Add Donar"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
