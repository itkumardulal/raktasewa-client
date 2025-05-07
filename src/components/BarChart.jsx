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
        backgroundColor: "#1976d2",
      },
      {
        label: "Donors",
        data: donors,
        backgroundColor: "#2e7d32",
      },
      {
        label: "Settled",
        data: settled,
        backgroundColor: "#ed6c02",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Monthly Overview",
      },
    },
  };

  return <Bar options={options} data={data} />;
}
