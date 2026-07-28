import React from "react";
import { Button, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import MenuBookIcon from "@mui/icons-material/MenuBook";

/** Quick links to existing routes only — no new APIs */
const ACTIONS = [
  {
    label: "How it works",
    to: "/how-it-works",
    icon: <MenuBookIcon fontSize="small" />,
  },
  {
    label: "Add Donor",
    to: "/add-donor",
    icon: <PersonAddAltIcon fontSize="small" />,
  },
  {
    label: "New Blood Request",
    to: "/new-requests",
    icon: <BloodtypeIcon fontSize="small" />,
  },
  {
    label: "Add Organization",
    to: "/organization",
    icon: <Diversity3Icon fontSize="small" />,
  },
  {
    label: "Assigned Donors",
    to: "/assigned-donors",
    icon: <HourglassTopIcon fontSize="small" />,
  },
  {
    label: "Reports & Export",
    to: "/reports",
    icon: <AssessmentOutlinedIcon fontSize="small" />,
  },
];

export default function QuickActions() {
  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      useFlexGap
      spacing={1}
      sx={{ gap: 1 }}
    >
      {ACTIONS.map((action) => (
        <Button
          key={action.to}
          component={RouterLink}
          to={action.to}
          variant="outlined"
          color="primary"
          size="small"
          startIcon={action.icon}
          sx={{
            borderRadius: 999,
            px: 1.75,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          {action.label}
        </Button>
      ))}
    </Stack>
  );
}
