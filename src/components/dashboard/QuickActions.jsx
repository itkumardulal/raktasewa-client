import React from "react";
import { Box, Button, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

/** Quick links to existing routes only — no new APIs */
const ACTIONS = [
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
    label: "Export / Settled",
    to: "/settled-requests",
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
