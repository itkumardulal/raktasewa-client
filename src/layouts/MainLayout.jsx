import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import { createTheme, useColorScheme } from "@mui/material/styles";
import { IconButton, Tooltip, Stack } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import { NAVIGATION } from "../config/Navigation";
import { logoutService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

/* ---------- theme ---------- */
const demoTheme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: { colorSchemeSelector: "class" },
  breakpoints: { values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 } },
});

/* ---------- helper: router adapter ---------- */
function useToolpadRouter() {
  const location = useLocation();
  const navigate = useNavigate();
  return React.useMemo(
    () => ({
      pathname: location.pathname,
      searchParams: new URLSearchParams(location.search),
      navigate,
    }),
    [location, navigate]
  );
}

/* ---------- tiny dark / light switch ---------- */
function ModeToggle() {
  const { mode, setMode } = useColorScheme();

  const handleToggle = () => setMode(mode === "dark" ? "light" : "dark");

  return (
    <Tooltip title="Toggle light / dark">
      <IconButton color="inherit" onClick={handleToggle}>
        {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
}

/* ---------- logout button ---------- */
function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // flips context → "unauth" (optional)

  const handleLogout = async () => {
    try {
      await logoutService(); // ① ask the server to clear the cookie
      logout(); // ② reset context (if you use it)
    } catch (err) {
      console.error(err.message);
    }
    navigate("/signin", { replace: true }); // ③ send user to sign-in
  };

  return (
    <Tooltip title="Sign out">
      <IconButton color="inherit" onClick={handleLogout}>
        <LogoutIcon />
      </IconButton>
    </Tooltip>
  );
}

/* ---------- combined toolbar actions ---------- */
function ToolbarActions() {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <ModeToggle />
      <LogoutButton />
    </Stack>
  );
}

/* ---------- main layout ---------- */
export default function MainLayout() {
  const router = useToolpadRouter();

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      branding={{
        logo: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
              maxWidth: "100%",
            }}
          >
            <img
              src="/logo.png"
              alt="EBSSS logo"
              style={{ height: "28px", width: "auto", flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#1976d2",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%", // full width by default
              }}
              className="app-title"
            >
              Emergency Blood Supply Support System
            </span>
          </div>
        ),
        title: "",
        homeUrl: "/",
      }}
    >
      <DashboardLayout
        slots={{ toolbarActions: ToolbarActions }} /* right-corner buttons */
      >
        <PageContainer>
          <Outlet />
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}
