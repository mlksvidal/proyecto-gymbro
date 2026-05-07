import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { auth } from "../lib/auth.js";

// GET /api/sync/pull?since=<unix_ms>
// Returns all data newer than `since` for the authenticated user.
// Auth required — uses Better Auth session cookie.
// The client passes the timestamp of its last successful pull.
// Response maps back to camelCase to match Dexie entity shapes.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Verify session
  const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = session.user.id;

  // 2. Parse `since` query param (Unix ms timestamp)
  const sinceRaw = req.query.since;
  const since = sinceRaw
    ? new Date(Number(sinceRaw)).toISOString()
    : new Date(0).toISOString(); // fallback: fetch everything

  if (sinceRaw && isNaN(Number(sinceRaw))) {
    return res.status(400).json({ error: "Invalid `since` timestamp" });
  }

  // 3. Supabase client with service role
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // 4. Fetch all entities updated since `since` for this user
  const [workoutsRes, setsRes, prsRes, achievementsRes, profileRes] =
    await Promise.all([
      supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userId)
        .gte("updated_at", since),

      supabase
        .from("sets")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", since), // sets have no updated_at (immutable after creation)

      supabase
        .from("prs")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", since),

      supabase
        .from("achievement_records")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", since),

      supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single(),
    ]);

  // 5. Map snake_case DB columns back to camelCase for the client
  const workouts = (workoutsRes.data ?? []).map((w) => ({
    id: w.id,
    routineId: w.routine_id,
    routineName: w.routine_name,
    dayName: w.day_name,
    startedAt: w.started_at,
    completedAt: w.completed_at,
    durationMinutes: w.duration_minutes,
    totalVolumeKg: w.total_volume_kg,
    setsCompleted: w.sets_completed,
    xpEarned: w.xp_earned,
  }));

  const sets = (setsRes.data ?? []).map((s) => ({
    id: s.id,
    workoutId: s.workout_id,
    exerciseId: s.exercise_id,
    exerciseName: s.exercise_name,
    setNumber: s.set_number,
    reps: s.reps,
    weight: s.weight_kg,
    completed: s.completed,
    prFlag: s.pr_flag,
    completedAt: s.completed_at,
  }));

  const prs = (prsRes.data ?? []).map((p) => ({
    id: p.id,
    exerciseId: p.exercise_id,
    exerciseName: p.exercise_name,
    weight: p.weight_kg,
    reps: p.reps,
    estimated1RM: p.one_rm_estimated,
    achievedAt: p.achieved_at,
    workoutId: p.workout_id,
  }));

  const achievements = (achievementsRes.data ?? []).map((a) => ({
    id: a.achievement_id,
    unlockedAt: a.unlocked_at,
  }));

  const profile = profileRes.data
    ? {
        username: profileRes.data.username,
        displayName: profileRes.data.display_name,
        goal: profileRes.data.goal,
        experienceLevel: profileRes.data.experience_level,
        level: profileRes.data.level,
        xp: profileRes.data.xp,
        avatarKind: profileRes.data.avatar_kind,
        avatarValue: profileRes.data.avatar_value,
        units: profileRes.data.units,
        defaultRestSeconds: profileRes.data.default_rest_seconds,
        autoStartTimer: profileRes.data.auto_start_timer,
        daysPerWeekGoal: profileRes.data.days_per_week_goal,
        vibrationIntensity: profileRes.data.vibration_intensity,
        onboardingComplete: profileRes.data.onboarding_complete,
      }
    : null;

  return res.status(200).json({
    ok: true,
    pulledAt: Date.now(),
    workouts,
    sets,
    prs,
    achievements,
    userProfile: profile,
  });
}
