import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { auth } from "../lib/auth.js";

// POST /api/sync/push
// Receives local Dexie data from the client and upserts into Supabase.
// Auth required — uses Better Auth session cookie.
// Strategy: last-write-wins via updated_at (or created_at for immutable records).

// ---------------------------------------------------------------------------
// Input schemas (mirrors Dexie types + adds userId for server-side assignment)
// ---------------------------------------------------------------------------

const WorkoutSchema = z.object({
  id: z.string(),
  routineId: z.string().optional(),
  routineName: z.string().optional(),
  dayName: z.string().optional(),
  startedAt: z.number(),
  completedAt: z.number().optional(),
  durationMinutes: z.number().optional(),
  totalVolumeKg: z.number().optional(),
  setsCompleted: z.number().optional(),
  xpEarned: z.number().optional(),
});

const SetSchema = z.object({
  id: z.string(),
  workoutId: z.string(),
  exerciseId: z.string(),
  exerciseName: z.string().optional(),
  setNumber: z.number().optional(),
  reps: z.number().optional(),
  weight: z.number().optional(),
  completed: z.boolean().optional(),
  prFlag: z.boolean().optional(),
  completedAt: z.number().optional(),
});

const PRSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  exerciseName: z.string().optional(),
  weight: z.number(),
  reps: z.number(),
  estimated1RM: z.number().optional(),
  achievedAt: z.number(),
  workoutId: z.string().optional(),
});

const AchievementSchema = z.object({
  id: z.string(),
  unlockedAt: z.number(),
});

const UserProfileSchema = z.object({
  username: z.string().optional(),
  displayName: z.string().optional(),
  goal: z.string().optional(),
  experienceLevel: z.string().optional(),
  level: z.number().optional(),
  xp: z.number().optional(),
  avatarKind: z.string().optional(),
  avatarValue: z.string().optional(),
  units: z.string().optional(),
  defaultRestSeconds: z.number().optional(),
  autoStartTimer: z.boolean().optional(),
  daysPerWeekGoal: z.number().optional(),
  vibrationIntensity: z.string().optional(),
  onboardingComplete: z.boolean().optional(),
});

const PushBodySchema = z.object({
  workouts: z.array(WorkoutSchema).optional().default([]),
  sets: z.array(SetSchema).optional().default([]),
  prs: z.array(PRSchema).optional().default([]),
  achievements: z.array(AchievementSchema).optional().default([]),
  userProfile: UserProfileSchema.optional(),
});

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Verify session
  const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = session.user.id;

  // 2. Validate body
  const parsed = PushBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid body",
      details: parsed.error.flatten(),
    });
  }
  const { workouts, sets, prs, achievements, userProfile } = parsed.data;

  // 3. Supabase client with service role (bypasses RLS — we enforce userId ourselves)
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const pushed: Record<string, number> = {
    workouts: 0,
    sets: 0,
    prs: 0,
    achievements: 0,
    profile: 0,
  };
  const errors: Array<{ entity: string; id: string; error: string }> = [];

  // 4. Upsert workouts
  if (workouts.length > 0) {
    const rows = workouts.map((w) => ({
      id: w.id,
      user_id: userId,
      routine_id: w.routineId ?? null,
      routine_name: w.routineName ?? null,
      day_name: w.dayName ?? null,
      started_at: w.startedAt,
      completed_at: w.completedAt ?? null,
      duration_minutes: w.durationMinutes ?? null,
      total_volume_kg: w.totalVolumeKg ?? null,
      sets_completed: w.setsCompleted ?? null,
      xp_earned: w.xpEarned ?? null,
      updated_at: new Date().toISOString(),
    }));
    const { error, count } = await supabase
      .from("workouts")
      .upsert(rows, { onConflict: "id", count: "exact" });
    if (error) {
      errors.push({ entity: "workouts", id: "batch", error: error.message });
    } else {
      pushed.workouts = count ?? rows.length;
    }
  }

  // 5. Upsert sets
  if (sets.length > 0) {
    const rows = sets.map((s) => ({
      id: s.id,
      user_id: userId,
      workout_id: s.workoutId,
      exercise_id: s.exerciseId,
      exercise_name: s.exerciseName ?? null,
      set_number: s.setNumber ?? null,
      reps: s.reps ?? null,
      weight_kg: s.weight ?? null,
      completed: s.completed ?? false,
      pr_flag: s.prFlag ?? false,
      completed_at: s.completedAt ?? null,
    }));
    const { error, count } = await supabase
      .from("sets")
      .upsert(rows, { onConflict: "id", count: "exact" });
    if (error) {
      errors.push({ entity: "sets", id: "batch", error: error.message });
    } else {
      pushed.sets = count ?? rows.length;
    }
  }

  // 6. Upsert PRs
  if (prs.length > 0) {
    const rows = prs.map((p) => ({
      id: p.id,
      user_id: userId,
      exercise_id: p.exerciseId,
      exercise_name: p.exerciseName ?? null,
      weight_kg: p.weight,
      reps: p.reps,
      one_rm_estimated: p.estimated1RM ?? null,
      achieved_at: p.achievedAt,
      workout_id: p.workoutId ?? null,
    }));
    const { error, count } = await supabase
      .from("prs")
      .upsert(rows, { onConflict: "id", count: "exact" });
    if (error) {
      errors.push({ entity: "prs", id: "batch", error: error.message });
    } else {
      pushed.prs = count ?? rows.length;
    }
  }

  // 7. Upsert achievements
  if (achievements.length > 0) {
    const rows = achievements.map((a) => ({
      id: `${userId}_${a.id}`,
      user_id: userId,
      achievement_id: a.id,
      unlocked_at: a.unlockedAt,
    }));
    const { error, count } = await supabase
      .from("achievement_records")
      .upsert(rows, { onConflict: "id", count: "exact" });
    if (error) {
      errors.push({ entity: "achievements", id: "batch", error: error.message });
    } else {
      pushed.achievements = count ?? rows.length;
    }
  }

  // 8. Upsert user profile
  if (userProfile) {
    const { error } = await supabase
      .from("users")
      .upsert(
        {
          id: userId,
          username: userProfile.username ?? null,
          display_name: userProfile.displayName ?? null,
          goal: userProfile.goal ?? null,
          experience_level: userProfile.experienceLevel ?? null,
          level: userProfile.level ?? 1,
          xp: userProfile.xp ?? 0,
          avatar_kind: userProfile.avatarKind ?? "mascot",
          avatar_value: userProfile.avatarValue ?? "idle",
          units: userProfile.units ?? "kg",
          default_rest_seconds: userProfile.defaultRestSeconds ?? 90,
          auto_start_timer: userProfile.autoStartTimer ?? true,
          days_per_week_goal: userProfile.daysPerWeekGoal ?? 4,
          vibration_intensity: userProfile.vibrationIntensity ?? "medium",
          onboarding_complete: userProfile.onboardingComplete ?? false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    if (error) {
      errors.push({ entity: "userProfile", id: userId, error: error.message });
    } else {
      pushed.profile = 1;
    }
  }

  return res.status(200).json({
    ok: true,
    pushed,
    errors: errors.length > 0 ? errors : undefined,
  });
}
