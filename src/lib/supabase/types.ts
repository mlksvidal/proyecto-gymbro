// ============================================================
// GYMBRO — Supabase Database Types
// Generated 2026-05-07 via Supabase MCP from project bleweslodfviwhdsouke
// Regenerate with: npm run db:types (after schema changes)
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      achievement_records: {
        Row: {
          achievement_id: string
          created_at: string | null
          id: string
          unlocked_at: number
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          id: string
          unlocked_at: number
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          id?: string
          unlocked_at?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'achievement_records_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      prs: {
        Row: {
          achieved_at: number
          created_at: string | null
          exercise_id: string
          exercise_name: string | null
          id: string
          one_rm_estimated: number | null
          reps: number
          user_id: string
          weight_kg: number
          workout_id: string | null
        }
        Insert: {
          achieved_at: number
          created_at?: string | null
          exercise_id: string
          exercise_name?: string | null
          id: string
          one_rm_estimated?: number | null
          reps: number
          user_id: string
          weight_kg: number
          workout_id?: string | null
        }
        Update: {
          achieved_at?: number
          created_at?: string | null
          exercise_id?: string
          exercise_name?: string | null
          id?: string
          one_rm_estimated?: number | null
          reps?: number
          user_id?: string
          weight_kg?: number
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'prs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'prs_workout_id_fkey'
            columns: ['workout_id']
            isOneToOne: false
            referencedRelation: 'workouts'
            referencedColumns: ['id']
          },
        ]
      }
      routines: {
        Row: {
          created_at: string | null
          days: Json | null
          days_per_week: number | null
          description: string | null
          difficulty: string | null
          estimated_minutes: number | null
          id: string
          image_url: string | null
          is_seed: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          days?: Json | null
          days_per_week?: number | null
          description?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          id: string
          image_url?: string | null
          is_seed?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          days?: Json | null
          days_per_week?: number | null
          description?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          id?: string
          image_url?: string | null
          is_seed?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'routines_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      sets: {
        Row: {
          completed: boolean | null
          completed_at: number | null
          created_at: string | null
          exercise_id: string
          exercise_name: string | null
          id: string
          pr_flag: boolean | null
          reps: number | null
          set_number: number | null
          user_id: string
          weight_kg: number | null
          workout_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: number | null
          created_at?: string | null
          exercise_id: string
          exercise_name?: string | null
          id: string
          pr_flag?: boolean | null
          reps?: number | null
          set_number?: number | null
          user_id: string
          weight_kg?: number | null
          workout_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: number | null
          created_at?: string | null
          exercise_id?: string
          exercise_name?: string | null
          id?: string
          pr_flag?: boolean | null
          reps?: number | null
          set_number?: number | null
          user_id?: string
          weight_kg?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sets_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sets_workout_id_fkey'
            columns: ['workout_id']
            isOneToOne: false
            referencedRelation: 'workouts'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          auto_start_timer: boolean | null
          avatar_kind: string | null
          avatar_value: string | null
          created_at: string | null
          days_per_week_goal: number | null
          default_rest_seconds: number | null
          display_name: string | null
          experience_level: string | null
          goal: string | null
          id: string
          level: number | null
          onboarding_complete: boolean | null
          units: string | null
          updated_at: string | null
          username: string | null
          vibration_intensity: string | null
          xp: number | null
        }
        Insert: {
          auto_start_timer?: boolean | null
          avatar_kind?: string | null
          avatar_value?: string | null
          created_at?: string | null
          days_per_week_goal?: number | null
          default_rest_seconds?: number | null
          display_name?: string | null
          experience_level?: string | null
          goal?: string | null
          id: string
          level?: number | null
          onboarding_complete?: boolean | null
          units?: string | null
          updated_at?: string | null
          username?: string | null
          vibration_intensity?: string | null
          xp?: number | null
        }
        Update: {
          auto_start_timer?: boolean | null
          avatar_kind?: string | null
          avatar_value?: string | null
          created_at?: string | null
          days_per_week_goal?: number | null
          default_rest_seconds?: number | null
          display_name?: string | null
          experience_level?: string | null
          goal?: string | null
          id?: string
          level?: number | null
          onboarding_complete?: boolean | null
          units?: string | null
          updated_at?: string | null
          username?: string | null
          vibration_intensity?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          completed_at: number | null
          created_at: string | null
          day_name: string | null
          duration_minutes: number | null
          id: string
          routine_id: string | null
          routine_name: string | null
          sets_completed: number | null
          started_at: number
          total_volume_kg: number | null
          updated_at: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          completed_at?: number | null
          created_at?: string | null
          day_name?: string | null
          duration_minutes?: number | null
          id: string
          routine_id?: string | null
          routine_name?: string | null
          sets_completed?: number | null
          started_at: number
          total_volume_kg?: number | null
          updated_at?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          completed_at?: number | null
          created_at?: string | null
          day_name?: string | null
          duration_minutes?: number | null
          id?: string
          routine_id?: string | null
          routine_name?: string | null
          sets_completed?: number | null
          started_at?: number
          total_volume_kg?: number | null
          updated_at?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'workouts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
