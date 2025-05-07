import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import ArcDesign from "../components/ArcDesign";
import BarChart from "../components/BarChart";
import { dashboardData } from "../services/dashboardService"; // ✅ your service

export default function Dashboard() {
  const [donutData, setDonutData] = useState(null);
  const [barGraph, setBarGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardData(); // ✅ use your service
        if (res.donutData && res.barGraphData) {
          setDonutData(res.donutData);
          setBarGraph(res.barGraphData);
        } else {
          throw new Error("Invalid dashboard data.");
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const unsettled = donutData?.unsettledRequests || 0;
  const settled = donutData?.settledRequests || 0;
  const totalDonors = donutData?.totalDonors || 0;

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Dashboard
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {/* Arc Gauges */}
          <Box
            sx={{
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
              justifyContent: "center",
              mb: 6,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <ArcDesign value={unsettled} />
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Unsettled requests
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <ArcDesign value={settled} />
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Settled requests
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <ArcDesign value={totalDonors} />
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Total Donors
              </Typography>
            </Box>
          </Box>

          {/* Bar Graph */}
          {barGraph && (
            <Box sx={{ width: "100%", maxWidth: 900 }}>
              <BarChart
                labels={barGraph.labels}
                requests={barGraph.requests}
                donors={barGraph.donors}
                settled={barGraph.settled}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
