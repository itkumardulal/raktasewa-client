import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import { red } from "@mui/material/colors";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { loginService as apiLogin } from "../services/authService";

import { useAuth } from "../contexts/AuthContext";

const theme = createTheme({ palette: { mode: "light" } });

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // flips context → “ok”
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await apiLogin(email, password); // server sets cookie
      login(user); // mark auth
      navigate("/", { replace: true });
    } catch {
      setError("Invalid email or password");
      setLoading(false); // ⬅ restore button
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
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
          <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: red[700] }}>
                <BloodtypeIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Sign in
              </Typography>

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ mt: 2, width: "100%" }}
              >
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
                  sx={{ mt: 3, mb: 1, bgcolor: red[900], height: 40 }}
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Sign In"
                  )}
                </Button>

                {error && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ mb: 1, textAlign: "center" }}
                  >
                    {error}
                  </Typography>
                )}

                {/* <Grid container justifyContent="space-between">
                  <Link href="/forgot-password" variant="body2">
                    Forgot password?
                  </Link>
                  <Link href="/signup" variant="body2">
                    Don&#39;t have an account? Sign Up
                  </Link>
                </Grid> */}
              </Box>
            </Box>
          </Paper>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ py: 2 }}
        >
          © 2025 NLT-AJX Company. All rights reserved.
        </Typography>
      </Box>
    </ThemeProvider>
  );
}
