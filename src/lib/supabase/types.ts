// ============================================================
// GYMBRO — Supabase Generated Types
// Sprint 24 — Backend Supabase
//
// THIS FILE IS AUTO-GENERATED — do not edit manually.
// Regenerate after schema changes:
//   npx supabase gen types typescript --project-id [ref] > src/lib/supabase/types.ts
// Or via MCP: mcp__supabase__generate_typescript_types({ project_id: "[ref]" })
//
// Placeholder until Supabase project is provisioned and MCP is available.
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          goal: string | null
          experience_level: string | null
          level: number
          xp: number
          avatar_kind: string
          avatar_value: string
          units: string
          default_rest_seconds: number
          auto_start_timer: boolean
          days_per_week_goal: number
          vibration_intensity: string
          onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          goal?: string | null
          experience_level?: string | null
          level?: number
          xp?: number
          avatar_kind?: string
          avatar_value?: string
          units?: string
          default_rest_seconds?: number
          auto_start_timer?: boolean
          days_per_week_goal?: number
          vibration_intensity?: string
          onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string | null
          display_name?: string | null
          goal?: string | null
          experience_level?: string | null
          level?: number
          xp?: number
          avatar_kind?: string
          avatar_value?: string
          units?: string
          default_rest_seconds?: number
          auto_start_timer?: boolean
          days_per_week_goal?: number
          vibration_intensity?: string
          onboarding_complete?: boolean
          updated_at?: string
        }
      }
      routines: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          days_per_week: number | null
          difficulty: string | null
          estimated_minutes: number | null
          image_url: string | null
          days: Json | null
          is_seed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          name: string
          description?: string | null
          days_per_week?: number | null
          difficulty?: string | null
          estimated_minutes?: number | null
          image_url?: string | null
          days?: Json | null
          is_seed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          days_per_week?: number | null
          difficulty?: string | null
          estimated_minutes?: number | null
          image_url?: string | null
          days?: Json | null
          is_seed?: boolean
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          routine_id: string | null
          routine_name: string | null
          day_name: string | null
          started_at: number
          completed_at: number | null
          duration_minutes: number | null
          total_volume_kg: number | null
          sets_completed: number | null
          xp_earned: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          routine_id?: string | null
          routine_name?: string | null
          day_name?: string | null
          started_at: number
          completed_at?: number | null
          duration_minutes?: number | null
          total_volume_kg?: number | null
          sets_completed?: number | null
          xp_earned?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          routine_id?: string | null
          routine_name?: string | null
          day_name?: string | null
          completed_at?: number | null
          duration_minutes?: number | null
          total_volume_kg?: number | null
          sets_completed?: number | null
          xp_earned?: number | null
          updated_at?: string
        }
      }
      sets: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          exercise_id: string
          exercise_name: string | null
          set_number: number | null
          reps: number | null
          weight_kg: number | null
          completed: boolean
          pr_flag: boolean
          completed_at: number | null
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          workout_id: string
          exercise_id: string
          exercise_name?: string | null
          set_number?: number | null
          reps?: number | null
          weight_kg?: number | null
          completed?: boolean
          pr_flag?: boolean
          completed_at?: number | null
          created_at?: string
        }
        Update: {
          exercise_name?: string | null
          set_number?: number | null
          reps?: number | null
          weight_kg?: number | null
          completed?: boolean
          pr_flag?: boolean
          completed_at?: number | null
        }
      }
      prs: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          exercise_name: string | null
          weight_kg: number
          reps: number
          one_rm_estimated: number | null
          achieved_at: number
          workout_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          exercise_id: string
          exercise_name?: string | null
          weight_kg: number
          reps: number
          one_rm_estimated?: number | null
          achieved_at: number
          workout_id?: string | null
          created_at?: string
        }
        Update: {
          exercise_name?: string | null
          weight_kg?: number
          reps?: number
          one_rm_estimated?: number | null
          workout_id?: string | null
        }
      }
      achievement_records: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: number
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: number
          created_at?: string
        }
        Update: {
          unlocked_at?: number
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
