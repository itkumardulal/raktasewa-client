/** Admin RBAC — per-user features; Super Admin has all. Sync keys with server/constants/features.js */

export const ROLES = {
  SUPER_ADMIN: "super_admin",
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
  { key: "reports", label: "Reports & Export", group: "Insights" },
  { key: "organization", label: "Organizations", group: "Admin" },
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
    "reports",
    "organization",
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
  ],
};

export const ROLE_OPTIONS = [
  { value: ROLES.SUPER_ADMIN, label: "Super Admin (full control)" },
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
  reports: "reports",
  organization: "organization",
  "user-accounts": "users.manage",
};

export function normalizeRole(role) {
  const r = String(role || "").toLowerCase().trim();
  if (r === ROLES.SUPER_ADMIN) return ROLES.SUPER_ADMIN;
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

export function hasFeature(user, featureKey) {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (featureKey === "users.manage" || featureKey === "data.delete") return false;
  return parsePermissions(user.permissions).includes(featureKey);
}

export function canAccessSegment(user, segment) {
  const feature = SEGMENT_TO_FEATURE[String(segment ?? "")];
  if (!feature) return isSuperAdmin(user);
  if (feature === "users.manage") return isSuperAdmin(user);
  return hasFeature(user, feature);
}

export function canDelete(user) {
  return isSuperAdmin(user);
}

export function canManageUsers(user) {
  return isSuperAdmin(user);
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

export function featureGroups() {
  const map = {};
  FEATURES.forEach((f) => {
    if (!map[f.group]) map[f.group] = [];
    map[f.group].push(f);
  });
  return map;
}
