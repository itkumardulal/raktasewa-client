import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/Login";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import AddDonorPage from "../pages/AddDonor";
import DonorListPage from "../pages/DonorList";
import VIDonorListPage from "../pages/VIDonorList";
import { AuthProvider } from "../contexts/AuthContext";
import RequireAuth from "./RequireAuth";
import NewRequestList from "../pages/NewRequestList";
import AllRequestList from "../pages/AllRequestList";
import SettledRequest from "../pages/SettledRequest";
import UnSettledRequest from "../pages/UnSettledRequest";
import PendingDonor from "../pages/PendingDonor";
import AssignedDonors from "../pages/AssignedDonors";
import ReportsPage from "../pages/ReportsPage";
import HowItWorksManual from "../pages/HowItWorksManual";
import Organization from "../pages/Organization";
import UserAccountPage from "../pages/UserAccounts";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ——— Public sign-in ——— */}
          <Route path="signin" element={<LoginPage />} />

          {/* ——— Protected area (has drawer) ——— */}
          <Route
            element={
              <RequireAuth>
                <MainLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} /> {/* “/” */}
            <Route path="how-it-works" element={<HowItWorksManual />} />
            <Route path="add-donor" element={<AddDonorPage />} />
            <Route path="enrolled-donors" element={<DonorListPage />} />
            <Route path="vi-donor-lists" element={<VIDonorListPage />} />
            <Route path="pending-donors" element={<PendingDonor />} />
            <Route path="assigned-donors" element={<AssignedDonors />} />
            <Route path="all-requests" element={<AllRequestList />} />
            <Route path="new-requests" element={<NewRequestList />} />
            <Route path="settled-requests" element={<SettledRequest />} />
            <Route path="unsettled-requests" element={<UnSettledRequest />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="organization" element={<Organization />} />
            <Route path="user-accounts" element={<UserAccountPage />} />
          </Route>

          {/* ——— Catch-all: anything not matched above ——— */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
