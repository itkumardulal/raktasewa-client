import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Paper,
  TextField,
  Typography,
  Stack,
  ThemeProvider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import { loginService as apiLogin } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import adminTheme, { adminColors } from "../theme/adminTheme";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await apiLogin(email, password);
      login(user);
      navigate("/", { replace: true });
    } catch {
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={adminTheme} defaultMode="dark">
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: `
            radial-gradient(ellipse at top left, rgba(220,38,38,0.22), transparent 45%),
            radial-gradient(ellipse at bottom right, rgba(59,130,246,0.12), transparent 40%),
            ${adminColors.bg}
          `,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              width: "100%",
              maxWidth: 420,
              borderRadius: 3,
              border: `1px solid ${adminColors.border}`,
              bgcolor: adminColors.card,
            }}
          >
            <Stack alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: adminColors.primary, width: 52, height: 52 }}>
                <BloodtypeIcon />
              </Avatar>
              <Typography
                component="h1"
                variant="h5"
                sx={{ fontFamily: '"Outfit", "DM Sans", sans-serif', fontWeight: 700 }}
              >
                Raktasewa Admin
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Sign in to manage donors, requests, and organizations.
              </Typography>
            </Stack>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
              <TextField
                fullWidth
                required
                margin="normal"
                label="Email Address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                fullWidth
                required
                margin="normal"
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 1, height: 44 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Sign In"}
              </Button>

              {error ? (
                <Typography variant="body2" color="error" sx={{ mb: 1, textAlign: "center" }}>
                  {error}
                </Typography>
              ) : null}
            </Box>
          </Paper>
        </Box>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
          © {new Date().getFullYear()} NLT-AJX Company. All rights reserved.
        </Typography>
      </Box>
    </ThemeProvider>
  );
}
