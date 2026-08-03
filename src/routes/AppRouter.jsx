import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

import LoginPage from "../pages/Login";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import AddDonorPage from "../pages/AddDonor";
import DonorListPage from "../pages/DonorList";
import VIDonorListPage from "../pages/VIDonorList";
import { AuthProvider } from "../contexts/AuthContext";
import RequireAuth from "./RequireAuth";
import RequireFeature from "./RequireFeature";
import NewRequestList from "../pages/NewRequestList";
import AllRequestList from "../pages/AllRequestList";
import SettledRequest from "../pages/SettledRequest";
import UnSettledRequest from "../pages/UnSettledRequest";
import FlaggedRequests from "../pages/FlaggedRequests";
import PendingDonor from "../pages/PendingDonor";
import AssignedDonors from "../pages/AssignedDonors";
import ReportsPage from "../pages/ReportsPage";
import HowItWorksManual from "../pages/HowItWorksManual";
import Organization from "../pages/Organization";
import UserAccountPage from "../pages/UserAccounts";

const MissionCenterPage = lazy(
  () => import("../features/gamification/pages/MissionCenterPage")
);
const LogActivityPage = lazy(
  () => import("../features/gamification/pages/LogActivityPage")
);
const LeaderboardPage = lazy(
  () => import("../features/gamification/pages/LeaderboardPage")
);
const GamiConfigPage = lazy(
  () => import("../features/gamification/pages/GamiConfigPage")
);

function LazyPage({ children }) {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      }
    >
      {children}
    </Suspense>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="signin" element={<LoginPage />} />

          <Route
            element={
              <RequireAuth>
                <MainLayout />
              </RequireAuth>
            }
          >
            <Route
              index
              element={
                <RequireFeature segment="">
                  <Dashboard />
                </RequireFeature>
              }
            />
            <Route
              path="how-it-works"
              element={
                <RequireFeature segment="how-it-works">
                  <HowItWorksManual />
                </RequireFeature>
              }
            />

            <Route
              path="add-donor"
              element={
                <RequireFeature segment="add-donor">
                  <AddDonorPage />
                </RequireFeature>
              }
            />
            <Route
              path="enrolled-donors"
              element={
                <RequireFeature segment="enrolled-donors">
                  <DonorListPage />
                </RequireFeature>
              }
            />
            <Route
              path="vi-donor-lists"
              element={
                <RequireFeature segment="vi-donor-lists">
                  <VIDonorListPage />
                </RequireFeature>
              }
            />
            <Route
              path="pending-donors"
              element={
                <RequireFeature segment="pending-donors">
                  <PendingDonor />
                </RequireFeature>
              }
            />
            <Route
              path="assigned-donors"
              element={
                <RequireFeature segment="assigned-donors">
                  <AssignedDonors />
                </RequireFeature>
              }
            />
            <Route
              path="all-requests"
              element={
                <RequireFeature segment="all-requests">
                  <AllRequestList />
                </RequireFeature>
              }
            />
            <Route
              path="new-requests"
              element={
                <RequireFeature segment="new-requests">
                  <NewRequestList />
                </RequireFeature>
              }
            />
            <Route
              path="settled-requests"
              element={
                <RequireFeature segment="settled-requests">
                  <SettledRequest />
                </RequireFeature>
              }
            />
            <Route
              path="unsettled-requests"
              element={
                <RequireFeature segment="unsettled-requests">
                  <UnSettledRequest />
                </RequireFeature>
              }
            />
            <Route
              path="flagged-requests"
              element={
                <RequireFeature segment="flagged-requests">
                  <FlaggedRequests />
                </RequireFeature>
              }
            />
            <Route
              path="reports"
              element={
                <RequireFeature segment="reports">
                  <ReportsPage />
                </RequireFeature>
              }
            />
            <Route
              path="organization"
              element={
                <RequireFeature segment="organization">
                  <Organization />
                </RequireFeature>
              }
            />
            <Route
              path="user-accounts"
              element={
                <RequireFeature userManagerOnly segment="user-accounts">
                  <UserAccountPage />
                </RequireFeature>
              }
            />
            <Route
              path="mission-center"
              element={
                <RequireFeature segment="mission-center">
                  <LazyPage>
                    <MissionCenterPage />
                  </LazyPage>
                </RequireFeature>
              }
            />
            <Route
              path="log-activity"
              element={
                <RequireFeature segment="log-activity">
                  <LazyPage>
                    <LogActivityPage />
                  </LazyPage>
                </RequireFeature>
              }
            />
            <Route
              path="leaderboards"
              element={
                <RequireFeature segment="leaderboards">
                  <LazyPage>
                    <LeaderboardPage />
                  </LazyPage>
                </RequireFeature>
              }
            />
            <Route
              path="gamification-config"
              element={
                <RequireFeature userManagerOnly segment="gamification-config">
                  <LazyPage>
                    <GamiConfigPage />
                  </LazyPage>
                </RequireFeature>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
