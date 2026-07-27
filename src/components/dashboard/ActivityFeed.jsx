import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Skeleton,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import { adminColors } from "../../theme/adminTheme";

function iconFor(type) {
  if (type === "donor") return <PersonAddAltIcon fontSize="small" color="success" />;
  if (type === "request") return <LocalHospitalOutlinedIcon fontSize="small" color="warning" />;
  if (type === "org") return <BusinessOutlinedIcon fontSize="small" color="info" />;
  return <CheckCircleOutlineIcon fontSize="small" color="primary" />;
}

/**
 * Activity feed built from existing list data (no new API).
 */
export default function ActivityFeed({ items = [], loading = false }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: "100%",
        borderRadius: 3,
        border: `1px solid ${adminColors.border}`,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Recent Activity
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        Derived from current donors, requests, and organizations
      </Typography>

      {loading ? (
        <Box>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={48} sx={{ mb: 1 }} />
          ))}
        </Box>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No recent activity yet.
        </Typography>
      ) : (
        <List dense disablePadding>
          {items.slice(0, 8).map((item) => (
            <ListItem
              key={item.id}
              sx={{
                px: 1,
                py: 1,
                mb: 0.5,
                borderRadius: 2,
                border: `1px solid ${adminColors.border}`,
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{iconFor(item.type)}</ListItemIcon>
              <ListItemText
                primary={item.title}
                secondary={item.time}
                primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
                secondaryTypographyProps={{ variant: "caption" }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
