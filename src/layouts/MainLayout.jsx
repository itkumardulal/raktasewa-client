import React, { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useColorScheme } from "@mui/material/styles";
import {
  IconButton,
  Tooltip,
  Stack,
  Avatar,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import { buildNavigationWithBadges } from "../config/Navigation";
import { logoutService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import {
  AdminNotificationsProvider,
  useAdminNotificationsContext,
} from "../contexts/AdminNotificationsContext";
import adminTheme, { adminColors } from "../theme/adminTheme";
import NotificationBell from "../components/NotificationBell";

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

function ModeToggle() {
  const { mode, setMode } = useColorScheme();
  const handleToggle = () => setMode(mode === "dark" ? "light" : "dark");

  return (
    <Tooltip title="Toggle theme">
      <IconButton color="inherit" onClick={handleToggle} size="small">
        {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
}

function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutService();
      logout();
    } catch (err) {
      console.error(err.message);
    }
    navigate("/signin", { replace: true });
  };

  return (
    <Tooltip title="Sign out">
      <IconButton color="inherit" onClick={handleLogout} size="small">
        <LogoutIcon />
      </IconButton>
    </Tooltip>
  );
}

function ToolbarActions() {
  const { user } = useAuth();
  const initial = (user?.email || "A").charAt(0).toUpperCase();

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip
        size="small"
        label="Live"
        color="success"
        variant="outlined"
        sx={{ display: { xs: "none", sm: "inline-flex" }, height: 24 }}
      />
      <NotificationBell />
      <ModeToggle />
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          gap: 1,
          pl: 0.5,
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: adminColors.primary,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {initial}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ display: "block", lineHeight: 1.2, fontWeight: 700 }}>
            {user?.email || "Admin"}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
            {user?.role || "admin"}
          </Typography>
        </Box>
      </Box>
      <LogoutButton />
    </Stack>
  );
}

function MainLayoutShell() {
  const router = useToolpadRouter();
  const { unreadRequestCount, unreadDonorCount } = useAdminNotificationsContext();

  const navigation = useMemo(
    () =>
      buildNavigationWithBadges({
        unreadRequestCount,
        unreadDonorCount,
      }),
    [unreadRequestCount, unreadDonorCount]
  );

  return (
    <AppProvider
      navigation={navigation}
      router={router}
      theme={adminTheme}
      branding={{
        logo: (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              maxWidth: "100%",
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="EBSSS logo"
              sx={{ height: 28, width: "auto", flexShrink: 0, borderRadius: 1 }}
            />
            <Typography
              sx={{
                fontSize: { xs: 12, sm: 13 },
                fontWeight: 700,
                color: adminColors.primary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                letterSpacing: "-0.01em",
              }}
            >
              Emergency Blood Supply
            </Typography>
          </Box>
        ),
        title: "",
        homeUrl: "/",
      }}
    >
      <DashboardLayout slots={{ toolbarActions: ToolbarActions }}>
        <PageContainer
          sx={{
            maxWidth: "100% !important",
            "& .MuiStack-root": { maxWidth: "100%" },
          }}
        >
          <Outlet />
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}

export default function MainLayout() {
  return (
    <AdminNotificationsProvider>
      <MainLayoutShell />
    </AdminNotificationsProvider>
  );
}
