import api from "../../../lib/axiosInstance";

export async function fetchGamiHealth() {
  const { data } = await api.get("/gamification/health");
  return data;
}

export async function fetchMySummary() {
  const { data } = await api.get("/gamification/me");
  return data;
}

export async function fetchMissions() {
  const { data } = await api.get("/gamification/missions");
  return data;
}

export async function createMission(payload) {
  const { data } = await api.post("/gamification/missions", payload);
  return data;
}

export async function updateMission(id, payload) {
  const { data } = await api.put(`/gamification/missions/${id}`, payload);
  return data;
}

export async function archiveMission(id) {
  const { data } = await api.delete(`/gamification/missions/${id}`);
  return data;
}

export async function fetchPointRules() {
  const { data } = await api.get("/gamification/point-rules");
  return data;
}

export async function upsertPointRule(payload) {
  const { data } = await api.post("/gamification/point-rules", payload);
  return data;
}

export async function logActivity(payload) {
  const { data } = await api.post("/gamification/activity", payload);
  return data;
}

export async function fetchRewards() {
  const { data } = await api.get("/gamification/rewards");
  return data;
}

export async function createReward(payload) {
  const { data } = await api.post("/gamification/rewards", payload);
  return data;
}

export async function updateReward(id, payload) {
  const { data } = await api.put(`/gamification/rewards/${id}`, payload);
  return data;
}

export async function fetchTiers() {
  const { data } = await api.get("/gamification/tiers");
  return data;
}

export async function upsertTier(payload) {
  const { data } = await api.post("/gamification/tiers", payload);
  return data;
}

export async function fetchAchievements() {
  const { data } = await api.get("/gamification/achievements");
  return data;
}

export async function upsertAchievement(payload) {
  const { data } = await api.post("/gamification/achievements", payload);
  return data;
}

export async function fetchLeaderboard(period = "monthly") {
  const { data } = await api.get("/gamification/leaderboard", {
    params: { period },
  });
  return data;
}

export async function fetchTeamPerformance(params = {}) {
  const { data } = await api.get("/gamification/team-performance", { params });
  return data;
}

export async function fetchBloodIntelligence() {
  const { data } = await api.get("/gamification/blood-intelligence");
  return data;
}

export async function fetchCampaigns() {
  const { data } = await api.get("/gamification/campaigns");
  return data;
}

export async function createCampaign(payload) {
  const { data } = await api.post("/gamification/campaigns", payload);
  return data;
}

export async function fetchThemes() {
  const { data } = await api.get("/gamification/themes");
  return data;
}

export async function upsertTheme(payload) {
  const { data } = await api.post("/gamification/themes", payload);
  return data;
}

export async function fetchCelebrations() {
  const { data } = await api.get("/gamification/celebrations");
  return data;
}

export async function markCelebrationSeen(celebration_id) {
  const { data } = await api.post("/gamification/celebrations/seen", {
    celebration_id,
  });
  return data;
}
