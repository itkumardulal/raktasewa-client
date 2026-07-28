/** Persist seen notification IDs + mute preference (per browser). */

const SEEN_REQUESTS_KEY = "raktasewa_notif_seen_requests";
const SEEN_DONORS_KEY = "raktasewa_notif_seen_donors";
const INIT_KEY = "raktasewa_notif_initialized";
const MUTE_KEY = "raktasewa_notif_muted";

function readIdSet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

function writeIdSet(key, set) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

export function isNotificationsInitialized() {
  return localStorage.getItem(INIT_KEY) === "1";
}

export function markNotificationsInitialized() {
  localStorage.setItem(INIT_KEY, "1");
}

export function getSeenRequestIds() {
  return readIdSet(SEEN_REQUESTS_KEY);
}

export function getSeenDonorIds() {
  return readIdSet(SEEN_DONORS_KEY);
}

export function markRequestsSeen(ids) {
  const set = getSeenRequestIds();
  ids.forEach((id) => set.add(String(id)));
  writeIdSet(SEEN_REQUESTS_KEY, set);
  return set;
}

export function markDonorsSeen(ids) {
  const set = getSeenDonorIds();
  ids.forEach((id) => set.add(String(id)));
  writeIdSet(SEEN_DONORS_KEY, set);
  return set;
}

export function markAllSeen(requestIds, donorIds) {
  markRequestsSeen(requestIds);
  markDonorsSeen(donorIds);
}

export function isSoundMuted() {
  return localStorage.getItem(MUTE_KEY) === "1";
}

export function setSoundMuted(muted) {
  localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
}
