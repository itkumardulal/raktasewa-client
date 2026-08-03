/** Admin RBAC — sync with server/constants/features.js
 * Hierarchy: super_admin > admin > staff
 */

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  STAFF: "staff",
};

export const FEATURES = [
  { key: "dashboard", label: "Dashboard", group: "Overview" },
  { key: "manual", label: "How it works (Manual)", group: "Overview" },
  { key: "donors.add", label: "Add Donor", group: "Donors" },
  { key: "donors.list", label: "Enrolled Donors", group: "Donors" },
  { key: "donors.vi", label: "VI Donor List", group: "Donors" },
  { key: "donors.pending", label: "Pending Donors", group: "Donors" },
  { key: "donors.assigned", label: "Assigned Donors", group: "Donors" },
  { key: "requests.all", label: "All Requests", group: "Requests" },
  { key: "requests.new", label: "New Requests", group: "Requests" },
  { key: "requests.settled", label: "Settled Requests", group: "Requests" },
  { key: "requests.unsettled", label: "Unsettled Requests", group: "Requests" },
  { key: "requests.flagged", label: "Spam / Flagged Requests", group: "Requests" },
  { key: "reports", label: "Reports & Export", group: "Insights" },
  { key: "organization", label: "Organizations", group: "Admin" },
  { key: "gamification.mission", label: "Mission Center", group: "Mission" },
  { key: "gamification.leaderboard", label: "Leaderboards", group: "Mission" },
  { key: "gamification.config", label: "Gamification Config", group: "Mission" },
];

export const FEATURE_KEYS = FEATURES.map((f) => f.key);

export const PRESETS = {
  admin: [
    "dashboard",
    "manual",
    "donors.add",
    "donors.list",
    "donors.vi",
    "donors.pending",
    "donors.assigned",
    "requests.all",
    "requests.new",
    "requests.settled",
    "requests.unsettled",
    "requests.flagged",
    "reports",
    "organization",
    "gamification.mission",
    "gamification.leaderboard",
    "gamification.config",
  ],
  operator: [
    "dashboard",
    "manual",
    "donors.pending",
    "donors.assigned",
    "requests.all",
    "requests.new",
    "requests.settled",
    "requests.unsettled",
    "requests.flagged",
    "gamification.mission",
    "gamification.leaderboard",
  ],
};

export const ROLE_OPTIONS = [
  { value: ROLES.SUPER_ADMIN, label: "Super Admin (full control)" },
  { value: ROLES.ADMIN, label: "Admin (can create staff)" },
  { value: ROLES.STAFF, label: "Staff (custom features)" },
];

export const SEGMENT_TO_FEATURE = {
  "": "dashboard",
  "how-it-works": "manual",
  "add-donor": "donors.add",
  "enrolled-donors": "donors.list",
  "vi-donor-lists": "donors.vi",
  "pending-donors": "donors.pending",
  "assigned-donors": "donors.assigned",
  "all-requests": "requests.all",
  "new-requests": "requests.new",
  "settled-requests": "requests.settled",
  "unsettled-requests": "requests.unsettled",
  "flagged-requests": "requests.flagged",
  reports: "reports",
  organization: "organization",
  "user-accounts": "users.manage",
  "mission-center": "gamification.mission",
  "log-activity": "gamification.mission",
  leaderboards: "gamification.leaderboard",
  "gamification-config": "gamification.config",
};

export function normalizeRole(role) {
  const r = String(role || "").toLowerCase().trim();
  if (r === ROLES.SUPER_ADMIN) return ROLES.SUPER_ADMIN;
  if (r === ROLES.ADMIN) return ROLES.ADMIN;
  return ROLES.STAFF;
}

export function parsePermissions(raw) {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function isSuperAdmin(user) {
  return normalizeRole(user?.role) === ROLES.SUPER_ADMIN;
}

export function isAdmin(user) {
  return normalizeRole(user?.role) === ROLES.ADMIN;
}

export function hasFeature(user, featureKey) {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (featureKey === "data.delete") return false;
  if (featureKey === "users.manage") return canManageUsers(user);
  const perms = parsePermissions(user.permissions);
  if (isAdmin(user) && perms.length === 0) {
    return PRESETS.admin.includes(featureKey);
  }
  return perms.includes(featureKey);
}

export function canAccessSegment(user, segment) {
  const feature = SEGMENT_TO_FEATURE[String(segment ?? "")];
  if (!feature) return isSuperAdmin(user);
  if (feature === "users.manage") return canManageUsers(user);
  return hasFeature(user, feature);
}

export function canDelete(user) {
  return isSuperAdmin(user);
}

export function canManageUsers(user) {
  return isSuperAdmin(user) || isAdmin(user);
}

/** Roles the current user may assign when creating/editing */
export function creatableRoles(actor) {
  if (isSuperAdmin(actor)) return ROLE_OPTIONS;
  if (isAdmin(actor)) {
    return ROLE_OPTIONS.filter((o) => o.value === ROLES.STAFF);
  }
  return [];
}

/** Features the actor may assign to staff */
export function assignableFeatures(actor, catalog = FEATURES) {
  if (isSuperAdmin(actor)) return catalog.map((f) => f.key);
  const perms = parsePermissions(actor?.permissions);
  if (perms.length) return perms;
  if (isAdmin(actor)) return [...PRESETS.admin];
  return [];
}

export function canManageOrganizations(user) {
  return hasFeature(user, "organization");
}

export function canViewReports(user) {
  return hasFeature(user, "reports");
}

export function canManageFullDonors(user) {
  return (
    hasFeature(user, "donors.list") ||
    hasFeature(user, "donors.add") ||
    hasFeature(user, "donors.vi")
  );
}

export function roleLabel(role) {
  const r = normalizeRole(role);
  const found = ROLE_OPTIONS.find((o) => o.value === r);
  return found?.label || r;
}

export function featureGroups(catalog = FEATURES) {
  const map = {};
  catalog.forEach((f) => {
    if (!map[f.group]) map[f.group] = [];
    map[f.group].push(f);
  });
  return map;
}
