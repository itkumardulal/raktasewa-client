/** Small helpers for gamification UI */
export function formatPoints(n) {
  return Number(n || 0).toLocaleString();
}

export const MANUAL_ACTIVITY_KEYS = [
  "call_logged",
  "follow_up",
  "meeting",
  "outreach",
  "emergency_response",
  "referral",
  "campaign_participation",
];
