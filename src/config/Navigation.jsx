import React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import ListAltIcon from "@mui/icons-material/ListAlt";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import FilePresentIcon from "@mui/icons-material/FilePresent";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

export const NAVIGATION = [
  { kind: "header", title: "Main items" },

  // Dash­board — now a real path
  { segment: "", title: "Dashboard", icon: <DashboardIcon /> },

  // ----- Blood-Donor group -----
  {
    segment: "/blood-donor",
    title: "Blood Donor",
    icon: <BloodtypeIcon />,
    children: [
      { segment: "add-donor", title: "Add Donor", icon: <PersonAddAltIcon /> },
      {
        segment: "enrolled-donors",
        title: "Enrolled Donors",
        icon: <ListAltIcon />,
      },
      {
        segment: "vi-donor-lists", // LIMITED BLOOD TYPE all the AB+ AND O- UNIVERSAL RECEIVER
        title: "VI Donor List",
        icon: <FilePresentIcon />,
      },
      {
        segment: "pending-donors", // LIMITED BLOOD TYPE all the AB+ AND O- UNIVERSAL RECEIVER
        title: "Pending Donors",
        icon: <PendingActionsIcon />,
      },
    ],
  },

  // ----- Blood-Request group -----
  {
    segment: "/blood-request", // parent segment
    title: "Blood Request",
    icon: <BarChartIcon />,
    children: [
      {
        segment: "all-requests",
        title: "All Request",
        icon: <DescriptionIcon />,
      },
      {
        segment: "new-requests",
        title: "New Request",
        icon: <DescriptionIcon />,
      },
      {
        segment: "settled-requests",
        title: "Settled Request",
        icon: <DescriptionIcon />,
      },
      {
        segment: "unsettled-requests",
        title: "Unsettled Request",
        icon: <DescriptionIcon />,
      },
    ],
  },

  // ----- History -----
  { segment: "organization", title: "Organization", icon: <Diversity3Icon /> },

  {
    segment: "user-accounts",
    title: "User Accounts",
    icon: <ManageAccountsIcon />,
  },
];
