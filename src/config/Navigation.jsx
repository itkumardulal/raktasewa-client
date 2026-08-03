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
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FlagIcon from "@mui/icons-material/Flag";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import TuneIcon from "@mui/icons-material/Tune";
import NavCountBadge from "../components/NavCountBadge";
import { canAccessSegment } from "../utils/permissions";

/** Same segments / routes — icons & labels only refreshed for UX */
export const NAVIGATION = [
  { kind: "header", title: "Overview" },

  { segment: "", title: "Dashboard", icon: <DashboardIcon /> },
  {
    segment: "how-it-works",
    title: "How it works (Manual)",
    icon: <MenuBookIcon />,
  },

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
      {
        segment: "assigned-donors",
        title: "Assigned Donors",
        icon: <HourglassTopIcon />,
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
        title: "New Request (3 days)",
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
      {
        segment: "flagged-requests",
        title: "Spam / Flagged",
        icon: <FlagIcon />,
      },
    ],
  },

  { kind: "header", title: "Insights" },
  {
    segment: "reports",
    title: "Reports & Export",
    icon: <AssessmentIcon />,
  },

  { kind: "header", title: "Mission" },
  {
    segment: "mission-center",
    title: "Mission Center",
    icon: <MilitaryTechIcon />,
  },
  {
    segment: "log-activity",
    title: "Log Activity",
    icon: <PhoneInTalkIcon />,
  },
  {
    segment: "leaderboards",
    title: "Leaderboards",
    icon: <LeaderboardIcon />,
  },
  {
    segment: "gamification-config",
    title: "Gamification Config",
    icon: <TuneIcon />,
  },

  { kind: "header", title: "Admin" },
  { segment: "organization", title: "Organization", icon: <Diversity3Icon /> },
  {
    segment: "user-accounts",
    title: "User Accounts",
    icon: <ManageAccountsIcon />,
  },
];

function filterNavByUser(items, user) {
  const out = [];
  let i = 0;

  while (i < items.length) {
    const item = items[i];

    if (item.kind === "header") {
      let j = i + 1;
      while (j < items.length && items[j].kind !== "header") j += 1;
      const section = items.slice(i + 1, j);
      const visible = section
        .map((entry) => {
          if (entry.children?.length) {
            const children = entry.children.filter((c) =>
              canAccessSegment(user, c.segment)
            );
            if (children.length === 0) return null;
            return { ...entry, children };
          }
          if (canAccessSegment(user, entry.segment)) return entry;
          return null;
        })
        .filter(Boolean);

      if (visible.length > 0) {
        out.push(item);
        out.push(...visible);
      }
      i = j;
      continue;
    }

    if (item.children?.length) {
      const children = item.children.filter((c) =>
        canAccessSegment(user, c.segment)
      );
      if (children.length > 0) out.push({ ...item, children });
    } else if (canAccessSegment(user, item.segment)) {
      out.push(item);
    }
    i += 1;
  }

  return out;
}

/** Filter by user features, then attach unread count badges. */
export function buildNavigationWithBadges({
  unreadRequestCount = 0,
  unreadDonorCount = 0,
  user,
} = {}) {
  const base = filterNavByUser(NAVIGATION, user);

  return base.map((item) => {
    if (!item.children) return item;

    const isDonorGroup = item.segment === "/blood-donor";
    const isRequestGroup = item.segment === "/blood-request";

    return {
      ...item,
      action: isDonorGroup ? (
        <NavCountBadge count={unreadDonorCount} />
      ) : isRequestGroup ? (
        <NavCountBadge count={unreadRequestCount} />
      ) : (
        item.action
      ),
      children: item.children.map((child) => {
        if (child.segment === "pending-donors") {
          return {
            ...child,
            action: <NavCountBadge count={unreadDonorCount} />,
          };
        }
        if (child.segment === "new-requests") {
          return {
            ...child,
            action: <NavCountBadge count={unreadRequestCount} />,
          };
        }
        return child;
      }),
    };
  });
}
