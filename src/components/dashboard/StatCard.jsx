import React from "react";
import { Box, Card, CardContent, Typography, Stack } from "@mui/material";
import { adminColors } from "../../theme/adminTheme";

/**
 * Presentational stat card — display only.
 */
export default function StatCard({
  title,
  value,
  description,
  icon,
  color = adminColors.primary,
  trendLabel,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: `1px solid ${adminColors.border}`,
        bgcolor: "background.paper",
        transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: color,
          boxShadow: `0 12px 32px ${color}22`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: `${color}22`,
              color,
            }}
          >
            {icon}
          </Box>
          {trendLabel ? (
            <Typography
              variant="caption"
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 999,
                bgcolor: `${adminColors.success}22`,
                color: adminColors.success,
                fontWeight: 700,
              }}
            >
              {trendLabel}
            </Typography>
          ) : null}
        </Stack>

        <Typography
          variant="h4"
          sx={{ mt: 2, mb: 0.5, fontWeight: 800, letterSpacing: "-0.03em" }}
        >
          {value}
        </Typography>
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
