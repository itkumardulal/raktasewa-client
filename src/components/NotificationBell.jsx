import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import RefreshIcon from "@mui/icons-material/Refresh";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { useAdminNotifications } from "../hooks/useAdminNotifications";
import { unlockNotificationAudio } from "../utils/notificationSounds";
import { adminColors } from "../theme/adminTheme";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const {
    items,
    unreadCount,
    loading,
    error,
    muted,
    lastRefreshedAt,
    refresh,
    markItemSeen,
    markEverythingSeen,
    toggleMute,
  } = useAdminNotifications();

  const handleOpen = async (event) => {
    setAnchorEl(event.currentTarget);
    await unlockNotificationAudio();
  };

  const handleClose = () => setAnchorEl(null);

  const handleRefresh = async () => {
    await unlockNotificationAudio();
    await refresh({ playSounds: true });
  };

  const handleItemClick = (item) => {
    markItemSeen(item);
    handleClose();
    navigate(item.to);
  };

  return (
    <>
      <Tooltip title={unreadCount ? `${unreadCount} unread` : "Notifications"}>
        <IconButton color="inherit" size="small" onClick={handleOpen} aria-label="Notifications">
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            overlap="circular"
            sx={{
              "& .MuiBadge-badge": {
                fontWeight: 800,
                fontSize: "0.65rem",
                minWidth: 18,
                height: 18,
              },
            }}
          >
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: { xs: 320, sm: 380 },
            maxHeight: 480,
            mt: 1,
            border: `1px solid ${adminColors.border}`,
            bgcolor: adminColors.card,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Box>
              <Typography fontWeight={800} sx={{ lineHeight: 1.2 }}>
                Notifications
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lastRefreshedAt
                  ? `Updated ${lastRefreshedAt.toLocaleTimeString()}`
                  : "Tap refresh for latest"}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.25}>
              <Tooltip title={muted ? "Unmute sounds" : "Mute sounds"}>
                <IconButton size="small" onClick={toggleMute} aria-label="Toggle sound">
                  {muted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <span>
                  <IconButton
                    size="small"
                    onClick={handleRefresh}
                    disabled={loading}
                    aria-label="Refresh notifications"
                    color="primary"
                  >
                    {loading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: 1.5, py: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button size="small" variant="outlined" onClick={handleRefresh} disabled={loading} startIcon={<RefreshIcon />}>
            Refresh
          </Button>
          <Button
            size="small"
            variant="text"
            disabled={unreadCount === 0}
            onClick={markEverythingSeen}
          >
            Mark all read
          </Button>
        </Box>

        <Divider />

        {error ? (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        ) : null}

        {!error && items.length === 0 && !loading ? (
          <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No active requests or pending donors.
            </Typography>
          </Box>
        ) : null}

        <List dense sx={{ py: 0, maxHeight: 320, overflowY: "auto" }}>
          {items.map((item) => (
            <ListItemButton
              key={item.key}
              onClick={() => handleItemClick(item)}
              sx={{
                alignItems: "flex-start",
                bgcolor: item.unread ? `${adminColors.primary}14` : "transparent",
                borderLeft: item.unread ? `3px solid ${adminColors.primary}` : "3px solid transparent",
              }}
            >
              <Box sx={{ mt: 0.5, mr: 1.25, color: item.kind === "request" ? adminColors.warning : adminColors.success }}>
                {item.kind === "request" ? (
                  <BloodtypeIcon fontSize="small" />
                ) : (
                  <VolunteerActivismIcon fontSize="small" />
                )}
              </Box>
              <ListItemText
                primary={
                  <Stack direction="row" justifyContent="space-between" gap={1} alignItems="baseline">
                    <Typography
                      variant="body2"
                      fontWeight={item.unread ? 800 : 600}
                      sx={{ lineHeight: 1.3 }}
                    >
                      {item.title}
                    </Typography>
                    {item.unread ? (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#fff",
                          bgcolor: adminColors.primary,
                          px: 0.75,
                          py: 0.1,
                          borderRadius: 999,
                          fontWeight: 800,
                          fontSize: "0.65rem",
                          flexShrink: 0,
                        }}
                      >
                        NEW
                      </Typography>
                    ) : null}
                  </Stack>
                }
                secondary={
                  <>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.4 }}>
                      {item.subtitle}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.when}
                      {item.kind === "request" ? " · Blood request" : " · Donor application"}
                    </Typography>
                  </>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Menu>
    </>
  );
}
