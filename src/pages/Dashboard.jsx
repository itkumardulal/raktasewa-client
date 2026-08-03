import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import BarChart from "../components/BarChart";
import StatCard from "../components/dashboard/StatCard";
import QuickActions from "../components/dashboard/QuickActions";
import EmergencyPanel from "../components/dashboard/EmergencyPanel";
import LatestDonorsTable from "../components/dashboard/LatestDonorsTable";
import PendingApprovals from "../components/dashboard/PendingApprovals";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import BloodGroupDonut from "../components/dashboard/BloodGroupDonut";
import DashboardMissionStrip from "../features/gamification/components/DashboardMissionStrip";
import { dashboardData } from "../services/dashboardService";
import { fetchDonors, fetchPendingDonors, updateDonorStatus } from "../services/donorService";
import { fetchUnSettledRequests } from "../services/unsettledService";
import { fetchOrganizations } from "../services/organizationService";
import { fetchTodayRequests } from "../services/requestService";
import { fetchUsers } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";
import { adminColors } from "../theme/adminTheme";

function greetingForNow(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatWhen(value) {
  if (!value) return "Just now";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function Dashboard() {
  const { user } = useAuth();
  const [donutData, setDonutData] = useState(null);
  const [barGraph, setBarGraph] = useState(null);
  const [donors, setDonors] = useState([]);
  const [pendingDonors, setPendingDonors] = useState([]);
  const [unsettled, setUnsettled] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [todayRequests, setTodayRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelsLoading, setPanelsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardData();
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

  useEffect(() => {
    (async () => {
      try {
        const [dRes, pRes, uRes, oRes, tRes, usersRes] = await Promise.allSettled([
          fetchDonors(),
          fetchPendingDonors(),
          fetchUnSettledRequests(),
          fetchOrganizations(),
          fetchTodayRequests(),
          fetchUsers(),
        ]);

        if (dRes.status === "fulfilled" && dRes.value?.success && Array.isArray(dRes.value.donors)) {
          setDonors(dRes.value.donors);
        }
        if (pRes.status === "fulfilled" && pRes.value?.success && Array.isArray(pRes.value.donors)) {
          setPendingDonors(pRes.value.donors);
        }
        if (uRes.status === "fulfilled" && uRes.value?.success && Array.isArray(uRes.value.requests)) {
          setUnsettled(uRes.value.requests);
        }
        if (
          oRes.status === "fulfilled" &&
          oRes.value?.success &&
          Array.isArray(oRes.value.organizations)
        ) {
          setOrgs(oRes.value.organizations);
        }
        if (tRes.status === "fulfilled" && Array.isArray(tRes.value?.requests)) {
          setTodayRequests(tRes.value.requests);
        }
        if (
          usersRes.status === "fulfilled" &&
          usersRes.value?.success &&
          Array.isArray(usersRes.value.users)
        ) {
          setUsers(usersRes.value.users);
        }
      } finally {
        setPanelsLoading(false);
      }
    })();
  }, []);

  const unsettledCount = donutData?.unsettledRequests || unsettled.length || 0;
  const settled = donutData?.settledRequests || 0;
  const totalDonors = donutData?.totalDonors || donors.length || 0;
  const totalRequests = unsettledCount + settled;
  const successRate =
    totalRequests > 0 ? Math.round((settled / totalRequests) * 100) : 0;

  const monthDonors = useMemo(() => {
    if (!barGraph?.donors?.length) return 0;
    return Number(barGraph.donors[barGraph.donors.length - 1]) || 0;
  }, [barGraph]);

  const monthRequests = useMemo(() => {
    if (!barGraph?.requests?.length) return 0;
    return Number(barGraph.requests[barGraph.requests.length - 1]) || 0;
  }, [barGraph]);

  const displayName = user?.email?.split("@")[0] || "Admin";

  const activityItems = useMemo(() => {
    const items = [];
    for (const d of pendingDonors.slice(0, 3)) {
      items.push({
        id: `pd-${d.id}`,
        type: "donor",
        title: `Pending donor: ${d.fullname || "Unknown"}`,
        time: formatWhen(d.created_at || d.updated_at),
      });
    }
    for (const d of donors.slice(0, 3)) {
      items.push({
        id: `d-${d.id}`,
        type: "donor",
        title: `Donor on file: ${d.fullname || "Unknown"} (${d.blood_group || "—"})`,
        time: formatWhen(d.created_at || d.updated_at),
      });
    }
    for (const r of unsettled.slice(0, 3)) {
      items.push({
        id: `r-${r.id}`,
        type: "request",
        title: `Unsettled request: ${r.patient_name || "Patient"} · ${r.patient_blood_group || ""}`,
        time: formatWhen(r.created_at || r.updated_at),
      });
    }
    for (const o of orgs.slice(0, 2)) {
      items.push({
        id: `o-${o.id}`,
        type: "org",
        title: `Organization: ${o.name || o.organization_name || "Org"}`,
        time: formatWhen(o.created_at || o.updated_at),
      });
    }
    return items;
  }, [pendingDonors, donors, unsettled, orgs]);

  const handleQuickApproveDonor = async () => {
    const first = pendingDonors[0];
    if (!first?.id) return;
    try {
      await updateDonorStatus(first.id, "available");
      setPendingDonors((prev) => prev.filter((d) => d.id !== first.id));
    } catch (err) {
      console.error(err);
    }
  };

  const cards = [
    {
      title: "Total Donors",
      value: totalDonors,
      description: "Registered in the network",
      icon: <FavoriteBorderIcon fontSize="small" />,
      color: adminColors.primary,
    },
    {
      title: "Active Requests",
      value: unsettledCount,
      description: "Unsettled / needs attention",
      icon: <WarningAmberRoundedIcon fontSize="small" />,
      color: adminColors.warning,
    },
    {
      title: "Completed Requests",
      value: settled,
      description: "Successfully settled",
      icon: <CheckCircleOutlineIcon fontSize="small" />,
      color: adminColors.success,
    },
    {
      title: "Pending Requests",
      value: unsettledCount,
      description: "Awaiting donor match",
      icon: <HourglassEmptyIcon fontSize="small" />,
      color: adminColors.info,
    },
    {
      title: "Organizations",
      value: orgs.length,
      description: "Partner organizations",
      icon: <Diversity3Icon fontSize="small" />,
      color: "#A855F7",
    },
    {
      title: "New Donors (month)",
      value: monthDonors,
      description: "From monthly overview",
      icon: <PersonAddAltIcon fontSize="small" />,
      color: adminColors.success,
      trendLabel: barGraph?.labels?.slice(-1)[0] || undefined,
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      description: "Settled ÷ all requests",
      icon: <TrendingUpIcon fontSize="small" />,
      color: adminColors.info,
    },
    {
      title: "Requests Today",
      value: todayRequests.length || monthRequests,
      description: todayRequests.length ? "From today's request feed" : "Current month in chart",
      icon: <LocalHospitalOutlinedIcon fontSize="small" />,
      color: adminColors.primary,
      trendLabel: barGraph?.labels?.slice(-1)[0] || undefined,
    },
  ];

  return (
    <Box sx={{ width: "100%", pb: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${adminColors.border}`,
          background: `
            linear-gradient(135deg, rgba(220,38,38,0.18), transparent 55%),
            linear-gradient(180deg, rgba(30,41,59,0.9), rgba(15,23,42,0.4))
          `,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              {greetingForNow(now)}, {displayName}
            </Typography>
            <Typography color="text.secondary">
              Here&apos;s today&apos;s system overview.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              {now.toLocaleString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Box>
          <QuickActions />
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {cards.map((card) => (
              <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard {...card} />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mb: 3 }}>
            <PendingApprovals
              pendingDonors={pendingDonors.length}
              organizations={orgs.length}
              pendingRequests={unsettled.length || unsettledCount}
              users={users.length}
              loading={panelsLoading}
              onApproveDonor={handleQuickApproveDonor}
            />
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 3,
                  border: `1px solid ${adminColors.border}`,
                  bgcolor: "background.paper",
                  height: "100%",
                }}
              >
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  Requests vs Donations
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Monthly requests, donors, and settled totals from the live dashboard API.
                </Typography>
                {barGraph && (
                  <Box sx={{ width: "100%", minHeight: 320 }}>
                    <BarChart
                      labels={barGraph.labels}
                      requests={barGraph.requests}
                      donors={barGraph.donors}
                      settled={barGraph.settled}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <BloodGroupDonut donors={donors} />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <EmergencyPanel requests={unsettled} loading={panelsLoading} />
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <ActivityFeed items={activityItems} loading={panelsLoading} />
            </Grid>
          </Grid>

          <LatestDonorsTable donors={donors} loading={panelsLoading} />

          <DashboardMissionStrip />
        </>
      )}
    </Box>
  );
}
