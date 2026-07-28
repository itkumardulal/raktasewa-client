import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchTodayRequests } from "../services/requestService";
import { fetchPendingDonors } from "../services/donorService";
import {
  getSeenDonorIds,
  getSeenRequestIds,
  isNotificationsInitialized,
  isSoundMuted,
  markAllSeen,
  markDonorsSeen,
  markNotificationsInitialized,
  markRequestsSeen,
  setSoundMuted,
} from "../utils/notificationStorage";
import {
  playDonorHappySound,
  playRequestAlertSound,
  unlockNotificationAudio,
} from "../utils/notificationSounds";

function formatWhen(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Manual-refresh notifications for NEW requests (3-day window) + pending donors.
 * Badge counts = unseen IDs. Seen → count goes down; new arrivals → count goes up.
 */
export function useAdminNotifications() {
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [seenRequests, setSeenRequests] = useState(() => getSeenRequestIds());
  const [seenDonors, setSeenDonors] = useState(() => getSeenDonorIds());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [muted, setMuted] = useState(() => isSoundMuted());
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  const refresh = useCallback(async ({ playSounds = true } = {}) => {
    setLoading(true);
    setError(null);
    try {
      await unlockNotificationAudio();
      const [reqRes, donorRes] = await Promise.all([
        fetchTodayRequests(),
        fetchPendingDonors(),
      ]);

      const nextRequests = Array.isArray(reqRes?.requests) ? reqRes.requests : [];
      const nextDonors = Array.isArray(donorRes?.donors) ? donorRes.donors : [];

      const requestIds = nextRequests.map((r) => String(r.id));
      const donorIds = nextDonors.map((d) => String(d.id));

      // First visit: seed current backlog as seen so only later arrivals bump the badge
      if (!isNotificationsInitialized()) {
        markAllSeen(requestIds, donorIds);
        markNotificationsInitialized();
        setSeenRequests(getSeenRequestIds());
        setSeenDonors(getSeenDonorIds());
        setRequests(nextRequests);
        setDonors(nextDonors);
        setLastRefreshedAt(new Date());
        return { newRequestCount: 0, newDonorCount: 0 };
      }

      const prevSeenReq = getSeenRequestIds();
      const prevSeenDon = getSeenDonorIds();
      const newRequestIds = requestIds.filter((id) => !prevSeenReq.has(id));
      const newDonorIds = donorIds.filter((id) => !prevSeenDon.has(id));

      if (playSounds && !isSoundMuted()) {
        if (newRequestIds.length > 0) playRequestAlertSound();
        if (newDonorIds.length > 0) playDonorHappySound();
      }

      setRequests(nextRequests);
      setDonors(nextDonors);
      setSeenRequests(prevSeenReq);
      setSeenDonors(prevSeenDon);
      setLastRefreshedAt(new Date());

      return {
        newRequestCount: newRequestIds.length,
        newDonorCount: newDonorIds.length,
      };
    } catch (err) {
      console.error(err);
      setError("Could not refresh notifications.");
      return { newRequestCount: 0, newDonorCount: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh({ playSounds: false });
  }, [refresh]);

  const unreadRequestCount = useMemo(
    () => requests.filter((r) => !seenRequests.has(String(r.id))).length,
    [requests, seenRequests]
  );

  const unreadDonorCount = useMemo(
    () => donors.filter((d) => !seenDonors.has(String(d.id))).length,
    [donors, seenDonors]
  );

  const unreadCount = unreadRequestCount + unreadDonorCount;

  const items = useMemo(() => {
    const reqItems = requests.map((r) => ({
      key: `request-${r.id}`,
      id: r.id,
      kind: "request",
      unread: !seenRequests.has(String(r.id)),
      title: r.patient_name || "Blood request",
      subtitle: `${r.patient_blood_group || "—"} · NEW · ${r.hospital_name || "Hospital n/a"}`,
      when: formatWhen(r.created_at),
      to: "/new-requests",
    }));

    const donorItems = donors.map((d) => ({
      key: `donor-${d.id}`,
      id: d.id,
      kind: "donor",
      unread: !seenDonors.has(String(d.id)),
      title: d.fullname || "Donor application",
      subtitle: `${d.blood_group || "—"} · Pending approval`,
      when: formatWhen(d.created_at),
      to: "/pending-donors",
    }));

    return [...reqItems, ...donorItems].sort((a, b) => {
      if (a.unread !== b.unread) return a.unread ? -1 : 1;
      return String(b.when).localeCompare(String(a.when));
    });
  }, [requests, donors, seenRequests, seenDonors]);

  const markItemSeen = useCallback((item) => {
    if (item.kind === "request") {
      setSeenRequests(new Set(markRequestsSeen([item.id])));
    } else {
      setSeenDonors(new Set(markDonorsSeen([item.id])));
    }
  }, []);

  /** Mark a list of request IDs seen (e.g. after opening New Requests page). */
  const markRequestIdsSeen = useCallback((ids) => {
    if (!ids?.length) return;
    setSeenRequests(new Set(markRequestsSeen(ids)));
  }, []);

  /** Mark a list of donor IDs seen (e.g. after opening Pending Donors page). */
  const markDonorIdsSeen = useCallback((ids) => {
    if (!ids?.length) return;
    setSeenDonors(new Set(markDonorsSeen(ids)));
  }, []);

  const markEverythingSeen = useCallback(() => {
    const reqIds = requests.map((r) => r.id);
    const donorIds = donors.map((d) => d.id);
    markAllSeen(reqIds, donorIds);
    setSeenRequests(getSeenRequestIds());
    setSeenDonors(getSeenDonorIds());
  }, [requests, donors]);

  const toggleMute = useCallback(() => {
    const next = !isSoundMuted();
    setSoundMuted(next);
    setMuted(next);
    if (!next) unlockNotificationAudio();
  }, []);

  return {
    items,
    unreadCount,
    unreadRequestCount,
    unreadDonorCount,
    loading,
    error,
    muted,
    lastRefreshedAt,
    refresh,
    markItemSeen,
    markRequestIdsSeen,
    markDonorIdsSeen,
    markEverythingSeen,
    toggleMute,
  };
}
