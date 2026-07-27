import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Box, Paper, Typography } from "@mui/material";
import { adminColors } from "../../theme/adminTheme";

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  "#DC2626",
  "#F59E0B",
  "#22C55E",
  "#3B82F6",
  "#A855F7",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

/**
 * Blood group distribution donut — computed client-side from donors list.
 */
export default function BloodGroupDonut({ donors = [] }) {
  const { labels, values } = useMemo(() => {
    const map = {};
    for (const d of donors || []) {
      const g = d.blood_group || "Unknown";
      map[g] = (map[g] || 0) + 1;
    }
    const labels = Object.keys(map);
    const values = Object.values(map);
    return { labels, values };
  }, [donors]);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: adminColors.muted, boxWidth: 10, usePointStyle: true },
      },
    },
    cutout: "62%",
  };

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
        Blood Group Distribution
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        From enrolled donors
      </Typography>
      <Box sx={{ height: 260 }}>
        {values.length ? (
          <Doughnut data={data} options={options} />
        ) : (
          <Typography color="text.secondary" variant="body2">
            No donor blood-group data yet.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
