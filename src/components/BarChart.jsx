import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { adminColors } from "../theme/adminTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChart({ labels, requests, donors, settled }) {
  const data = {
    labels,
    datasets: [
      {
        label: "Requests",
        data: requests,
        backgroundColor: adminColors.info,
        borderRadius: 6,
      },
      {
        label: "Donors",
        data: donors,
        backgroundColor: adminColors.success,
        borderRadius: 6,
      },
      {
        label: "Settled",
        data: settled,
        backgroundColor: adminColors.warning,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: adminColors.muted, boxWidth: 12, usePointStyle: true },
      },
      title: {
        display: true,
        text: "Monthly Overview — Requests · Donors · Settled",
        color: adminColors.text,
        font: { size: 14, weight: "600" },
      },
    },
    scales: {
      x: {
        ticks: { color: adminColors.muted },
        grid: { color: "rgba(148,163,184,0.08)" },
      },
      y: {
        ticks: { color: adminColors.muted },
        grid: { color: "rgba(148,163,184,0.08)" },
      },
    },
  };

  return (
    <div style={{ height: 340, width: "100%" }}>
      <Bar options={options} data={data} />
    </div>
  );
}
