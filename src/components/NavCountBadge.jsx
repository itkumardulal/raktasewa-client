import React from "react";
import { Box } from "@mui/material";
import { adminColors } from "../theme/adminTheme";

/** Red count pill for Toolpad nav `action` slots. Hidden when count is 0. */
export default function NavCountBadge({ count }) {
  const n = Number(count) || 0;
  if (n <= 0) return null;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 20,
        height: 20,
        px: 0.6,
        borderRadius: 999,
        bgcolor: adminColors.primary,
        color: "#fff",
        fontSize: "0.7rem",
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      {n > 99 ? "99+" : n}
    </Box>
  );
}
