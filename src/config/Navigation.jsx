import React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import ListAltIcon from "@mui/icons-material/ListAlt";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import FilePresentIcon from "@mui/icons-material/FilePresent";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import NewReleasesIcon from "@mui/icons-material/NewReleases";

/** Same segments / routes — icons & labels only refreshed for UX */
export const NAVIGATION = [
  { kind: "header", title: "Overview" },

  { segment: "", title: "Dashboard", icon: <DashboardIcon /> },

  { kind: "header", title: "Donors" },
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
        segment: "vi-donor-lists",
        title: "VI Donor List",
        icon: <FilePresentIcon />,
      },
      {
        segment: "pending-donors",
        title: "Pending Donors",
        icon: <PendingActionsIcon />,
      },
    ],
  },

  { kind: "header", title: "Requests" },
  {
    segment: "/blood-request",
    title: "Blood Request",
    icon: <VolunteerActivismIcon />,
    children: [
      {
        segment: "all-requests",
        title: "All Request",
        icon: <DescriptionIcon />,
      },
      {
        segment: "new-requests",
        title: "New Request",
        icon: <NewReleasesIcon />,
      },
      {
        segment: "settled-requests",
        title: "Settled Request",
        icon: <AssignmentTurnedInIcon />,
      },
      {
        segment: "unsettled-requests",
        title: "Unsettled Request",
        icon: <ReportProblemIcon />,
      },
    ],
  },

  { kind: "header", title: "Admin" },
  { segment: "organization", title: "Organization", icon: <Diversity3Icon /> },
  {
    segment: "user-accounts",
    title: "User Accounts",
    icon: <ManageAccountsIcon />,
  },
];
