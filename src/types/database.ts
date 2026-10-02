export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          life_area_id: string | null
          name: string
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          life_area_id?: string | null
          name: string
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          life_area_id?: string | null
          name?: string
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_life_area_id_user_id_fkey"
            columns: ["life_area_id", "user_id"]
            isOneToOne: false
            referencedRelation: "life_areas"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      challenge_habits: {
        Row: {
          challenge_id: string
          created_at: string
          habit_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          habit_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          habit_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_habits_challenge_id_user_id_fkey"
            columns: ["challenge_id", "user_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "challenge_habits_habit_id_user_id_fkey"
            columns: ["habit_id", "user_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      challenge_metrics: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          metric_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          metric_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          metric_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_metrics_challenge_id_user_id_fkey"
            columns: ["challenge_id", "user_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "challenge_metrics_metric_id_user_id_fkey"
            columns: ["metric_id", "user_id"]
            isOneToOne: false
            referencedRelation: "metric_definitions"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      challenge_targets: {
        Row: {
          challenge_id: string
          created_at: string
          frequency_target_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          frequency_target_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          frequency_target_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_targets_challenge_id_user_id_fkey"
            columns: ["challenge_id", "user_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "challenge_targets_frequency_target_id_user_id_fkey"
            columns: ["frequency_target_id", "user_id"]
            isOneToOne: false
            referencedRelation: "frequency_targets"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      challenges: {
        Row: {
          color: string | null
          created_at: string
          description: string
          end_date: string
          icon: string | null
          id: string
          start_date: string
          starter_key: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string
          end_date: string
          icon?: string | null
          id?: string
          start_date: string
          starter_key?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string
          end_date?: string
          icon?: string | null
          id?: string
          start_date?: string
          starter_key?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          muscle_group: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          muscle_group: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          muscle_group?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      focus_timers: {
        Row: {
          accumulated_seconds: number
          challenge_id: string | null
          created_at: string
          id: string
          notes: string
          revision: number
          running_since: string | null
          segments: Json
          status: string
          study_category_id: string
          timezone: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accumulated_seconds?: number
          challenge_id?: string | null
          created_at?: string
          id?: string
          notes?: string
          revision?: number
          running_since?: string | null
          segments?: Json
          status: string
          study_category_id: string
          timezone: string
          topic?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accumulated_seconds?: number
          challenge_id?: string | null
          created_at?: string
          id?: string
          notes?: string
          revision?: number
          running_since?: string | null
          segments?: Json
          status?: string
          study_category_id?: string
          timezone?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "focus_timers_challenge_id_user_id_fkey"
            columns: ["challenge_id", "user_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "focus_timers_study_category_id_user_id_fkey"
            columns: ["study_category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "study_categories"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      frequency_target_rules: {
        Row: {
          created_at: string
          effective_from: string
          effective_until: string | null
          frequency_target_id: string
          id: string
          period: string
          quota: number
          threshold: number | null
          timezone: string
          updated_at: string
          user_id: string
          week_starts_on: number
        }
        Insert: {
          created_at?: string
          effective_from: string
          effective_until?: string | null
          frequency_target_id: string
          id?: string
          period: string
          quota: number
          threshold?: number | null
          timezone: string
          updated_at?: string
          user_id: string
          week_starts_on: number
        }
        Update: {
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          frequency_target_id?: string
          id?: string
          period?: string
          quota?: number
          threshold?: number | null
          timezone?: string
          updated_at?: string
          user_id?: string
          week_starts_on?: number
        }
        Relationships: [
          {
            foreignKeyName: "frequency_target_rules_frequency_target_id_user_id_fkey"
            columns: ["frequency_target_id", "user_id"]
            isOneToOne: false
            referencedRelation: "frequency_targets"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      frequency_targets: {
        Row: {
          active_from: string
          active_until: string | null
          archived_at: string | null
          archived_on: string | null
          category_id: string | null
          count_mode: string
          created_at: string
          description: string
          id: string
          is_private: boolean
          metric_id: string | null
          name: string
          source: string
          source_available_from: string | null
          starter_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_from: string
          active_until?: string | null
          archived_at?: string | null
          archived_on?: string | null
          category_id?: string | null
          count_mode: string
          created_at?: string
          description?: string
          id?: string
          is_private?: boolean
          metric_id?: string | null
          name: string
          source: string
          source_available_from?: string | null
          starter_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_from?: string
          active_until?: string | null
          archived_at?: string | null
          archived_on?: string | null
          category_id?: string | null
          count_mode?: string
          created_at?: string
          description?: string
          id?: string
          is_private?: boolean
          metric_id?: string | null
          name?: string
          source?: string
          source_available_from?: string | null
          starter_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "frequency_targets_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "frequency_targets_metric_id_user_id_fkey"
            columns: ["metric_id", "user_id"]
            isOneToOne: false
            referencedRelation: "metric_definitions"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      goal_milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          goal_id: string
          id: string
          position: number
          revision: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          goal_id: string
          id?: string
          position?: number
          revision?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          goal_id?: string
          id?: string
          position?: number
          revision?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_user_id_fkey"
            columns: ["goal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      goals: {
        Row: {
          category_id: string | null
          challenge_id: string | null
          created_at: string
          description: string
          id: string
          is_private: boolean
          manual_percent: number
          metric_aggregation: string | null
          metric_baseline: number | null
          metric_end_date: string | null
          metric_id: string | null
          metric_start_date: string | null
          metric_target: number | null
          progress_mode: string
          revision: number
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          challenge_id?: string | null
          created_at?: string
          description?: string
          id?: string
          is_private?: boolean
          manual_percent?: number
          metric_aggregation?: string | null
          metric_baseline?: number | null
          metric_end_date?: string | null
          metric_id?: string | null
          metric_start_date?: string | null
          metric_target?: number | null
          progress_mode?: string
          revision?: number
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          challenge_id?: string | null
          created_at?: string
          description?: string
          id?: string
          is_private?: boolean
          manual_percent?: number
          metric_aggregation?: string | null
          metric_baseline?: number | null
          metric_end_date?: string | null
          metric_id?: string | null
          metric_start_date?: string | null
          metric_target?: number | null
          progress_mode?: string
          revision?: number
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "goals_challenge_id_user_id_fkey"
            columns: ["challenge_id", "user_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "goals_metric_id_user_id_fkey"
            columns: ["metric_id", "user_id"]
            isOneToOne: false
            referencedRelation: "metric_definitions"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          business_date: string
          completion_count: number
          created_at: string
          habit_id: string
          id: string
          notes: string
          revision: number
          status: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_date: string
          completion_count: number
          created_at?: string
          habit_id: string
          id?: string
          notes?: string
          revision?: number
          status: string
          timezone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_date?: string
          completion_count?: number
          created_at?: string
          habit_id?: string
          id?: string
          notes?: string
          revision?: number
          status?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_user_id_fkey"
            columns: ["habit_id", "user_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      habit_schedules: {
        Row: {
          anchor_date: string | null
          created_at: string
          effective_from: string
          effective_until: string | null
          frequency: string
          habit_id: string
          id: string
          interval_days: number | null
          required_count: number
          timezone: string
          updated_at: string
          user_id: string
          week_starts_on: number
          weekdays: number[]
        }
        Insert: {
          anchor_date?: string | null
          created_at?: string
          effective_from: string
          effective_until?: string | null
          frequency: string
          habit_id: string
          id?: string
          interval_days?: number | null
          required_count: number
          timezone: string
          updated_at?: string
          user_id: string
          week_starts_on: number
          weekdays?: number[]
        }
        Update: {
          anchor_date?: string | null
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          frequency?: string
          habit_id?: string
          id?: string
          interval_days?: number | null
          required_count?: number
          timezone?: string
          updated_at?: string
          user_id?: string
          week_starts_on?: number
          weekdays?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "habit_schedules_habit_id_user_id_fkey"
            columns: ["habit_id", "user_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      habits: {
        Row: {
          active_from: string
          active_until: string | null
          archived_at: string | null
          archived_on: string | null
          category_id: string | null
          created_at: string
          description: string
          dosage_amount: number | null
          dosage_unit: string | null
          icon: string | null
          id: string
          is_private: boolean
          name: string
          starter_key: string | null
          time_of_day: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_from: string
          active_until?: string | null
          archived_at?: string | null
          archived_on?: string | null
          category_id?: string | null
          created_at?: string
          description?: string
          dosage_amount?: number | null
          dosage_unit?: string | null
          icon?: string | null
          id?: string
          is_private?: boolean
          name: string
          starter_key?: string | null
          time_of_day?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_from?: string
          active_until?: string | null
          archived_at?: string | null
          archived_on?: string | null
          category_id?: string | null
          created_at?: string
          description?: string
          dosage_amount?: number | null
          dosage_unit?: string | null
          icon?: string | null
          id?: string
          is_private?: boolean
          name?: string
          starter_key?: string | null
          time_of_day?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      life_areas: {
        Row: {
          archived_at: string | null
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      metric_definitions: {
        Row: {
          active_from: string
          active_until: string | null
          aggregation: string
          archived_at: string | null
          archived_on: string | null
          category_id: string | null
          created_at: string
          description: string
          id: string
          is_private: boolean
          name: string
          source: string
          source_available_from: string | null
          starter_key: string | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_from: string
          active_until?: string | null
          aggregation?: string
          archived_at?: string | null
          archived_on?: string | null
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          is_private?: boolean
          name: string
          source: string
          source_available_from?: string | null
          starter_key?: string | null
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_from?: string
          active_until?: string | null
          aggregation?: string
          archived_at?: string | null
          archived_on?: string | null
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          is_private?: boolean
          name?: string
          source?: string
          source_available_from?: string | null
          starter_key?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metric_definitions_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      metric_logs: {
        Row: {
          business_date: string
          created_at: string
          id: string
          metric_id: string
          notes: string
          revision: number
          timezone: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          business_date: string
          created_at?: string
          id?: string
          metric_id: string
          notes?: string
          revision?: number
          timezone: string
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          business_date?: string
          created_at?: string
          id?: string
          metric_id?: string
          notes?: string
          revision?: number
          timezone?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "metric_logs_metric_id_user_id_fkey"
            columns: ["metric_id", "user_id"]
            isOneToOne: false
            referencedRelation: "metric_definitions"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      metric_targets: {
        Row: {
          created_at: string
          direction: string
          effective_from: string
          effective_until: string | null
          id: string
          metric_id: string
          period: string
          target: number
          timezone: string
          updated_at: string
          user_id: string
          week_starts_on: number
        }
        Insert: {
          created_at?: string
          direction: string
          effective_from: string
          effective_until?: string | null
          id?: string
          metric_id: string
          period: string
          target: number
          timezone: string
          updated_at?: string
          user_id: string
          week_starts_on: number
        }
        Update: {
          created_at?: string
          direction?: string
          effective_from?: string
          effective_until?: string | null
          id?: string
          metric_id?: string
          period?: string
          target?: number
          timezone?: string
          updated_at?: string
          user_id?: string
          week_starts_on?: number
        }
        Relationships: [
          {
            foreignKeyName: "metric_targets_metric_id_user_id_fkey"
            columns: ["metric_id", "user_id"]
            isOneToOne: false
            referencedRelation: "metric_definitions"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      monthly_reflections: {
        Row: {
          biggest_failures: string
          biggest_wins: string
          career_progress: string
          changes_next_month: string
          created_at: string
          fitness_progress: string
          habits_improved: string
          habits_slipped: string
          id: string
          month_start: string
          notes: string
          revision: number
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          biggest_failures?: string
          biggest_wins?: string
          career_progress?: string
          changes_next_month?: string
          created_at?: string
          fitness_progress?: string
          habits_improved?: string
          habits_slipped?: string
          id?: string
          month_start: string
          notes?: string
          revision?: number
          timezone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          biggest_failures?: string
          biggest_wins?: string
          career_progress?: string
          changes_next_month?: string
          created_at?: string
          fitness_progress?: string
          habits_improved?: string
          habits_slipped?: string
          id?: string
          month_start?: string
          notes?: string
          revision?: number
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      score_categories: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          name: string
          position: number
          starter_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          name: string
          position?: number
          starter_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          name?: string
          position?: number
          starter_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      score_category_weights: {
        Row: {
          created_at: string
          id: string
          policy_id: string
          score_category_id: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          policy_id: string
          score_category_id: string
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          id?: string
          policy_id?: string
          score_category_id?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "score_category_weights_policy_id_user_id_fkey"
            columns: ["policy_id", "user_id"]
            isOneToOne: false
            referencedRelation: "score_policies"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "score_category_weights_score_category_id_user_id_fkey"
            columns: ["score_category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "score_categories"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      score_items: {
        Row: {
          created_at: string
          frequency_target_id: string | null
          habit_id: string | null
          id: string
          metric_id: string | null
          policy_id: string
          score_category_id: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          frequency_target_id?: string | null
          habit_id?: string | null
          id?: string
          metric_id?: string | null
          policy_id: string
          score_category_id: string
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          frequency_target_id?: string | null
          habit_id?: string | null
          id?: string
          metric_id?: string | null
          policy_id?: string
          score_category_id?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "score_items_frequency_target_id_user_id_fkey"
            columns: ["frequency_target_id", "user_id"]
            isOneToOne: false
            referencedRelation: "frequency_targets"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "score_items_habit_id_user_id_fkey"
            columns: ["habit_id", "user_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "score_items_metric_id_user_id_fkey"
            columns: ["metric_id", "user_id"]
            isOneToOne: false
            referencedRelation: "metric_definitions"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "score_items_policy_id_score_category_id_fkey"
            columns: ["policy_id", "score_category_id"]
            isOneToOne: false
            referencedRelation: "score_category_weights"
            referencedColumns: ["policy_id", "score_category_id"]
          },
          {
            foreignKeyName: "score_items_policy_id_user_id_fkey"
            columns: ["policy_id", "user_id"]
            isOneToOne: false
            referencedRelation: "score_policies"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "score_items_score_category_id_user_id_fkey"
            columns: ["score_category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "score_categories"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      score_policies: {
        Row: {
          created_at: string
          effective_from: string
          effective_until: string | null
          id: string
          name: string
          period: string
          timezone: string
          updated_at: string
          user_id: string
          version: number
          week_starts_on: number
        }
        Insert: {
          created_at?: string
          effective_from: string
          effective_until?: string | null
          id?: string
          name: string
          period: string
          timezone: string
          updated_at?: string
          user_id: string
          version: number
          week_starts_on: number
        }
        Update: {
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          id?: string
          name?: string
          period?: string
          timezone?: string
          updated_at?: string
          user_id?: string
          version?: number
          week_starts_on?: number
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          business_date: string
          created_at: string
          duration_seconds: number
          id: string
          notes: string
          quality: number | null
          revision: number
          sleep_start_at: string | null
          timezone: string
          updated_at: string
          user_id: string
          wake_at: string | null
        }
        Insert: {
          business_date: string
          created_at?: string
          duration_seconds: number
          id?: string
          notes?: string
          quality?: number | null
          revision?: number
          sleep_start_at?: string | null
          timezone: string
          updated_at?: string
          user_id: string
          wake_at?: string | null
        }
        Update: {
          business_date?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          notes?: string
          quality?: number | null
          revision?: number
          sleep_start_at?: string | null
          timezone?: string
          updated_at?: string
          user_id?: string
          wake_at?: string | null
        }
        Relationships: []
      }
      study_categories: {
        Row: {
          archived_at: string | null
          category_id: string | null
          created_at: string
          id: string
          name: string
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          name: string
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          name?: string
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_categories_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          business_date: string
          challenge_id: string | null
          created_at: string
          duration_seconds: number
          end_at: string | null
          id: string
          notes: string
          revision: number
          segments: Json
          source: string
          start_at: string | null
          study_category_id: string
          timer_id: string | null
          timezone: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_date: string
          challenge_id?: string | null
          created_at?: string
          duration_seconds: number
          end_at?: string | null
          id?: string
          notes?: string
          revision?: number
          segments?: Json
          source: string
          start_at?: string | null
          study_category_id: string
          timer_id?: string | null
          timezone: string
          topic?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_date?: string
          challenge_id?: string | null
          created_at?: string
          duration_seconds?: number
          end_at?: string | null
          id?: string
          notes?: string
          revision?: number
          segments?: Json
          source?: string
          start_at?: string | null
          study_category_id?: string
          timer_id?: string | null
          timezone?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_challenge_id_user_id_fkey"
            columns: ["challenge_id", "user_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "study_sessions_study_category_id_user_id_fkey"
            columns: ["study_category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "study_categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "study_sessions_timer_id_user_id_fkey"
            columns: ["timer_id", "user_id"]
            isOneToOne: false
            referencedRelation: "focus_timers"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      task_carry_operations: {
        Row: {
          created_at: string
          id: string
          mode: string
          operation_id: string
          result_ids: string[]
          source_date: string
          target_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mode: string
          operation_id: string
          result_ids?: string[]
          source_date: string
          target_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mode?: string
          operation_id?: string
          result_ids?: string[]
          source_date?: string
          target_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_seconds: number | null
          business_date: string
          category_id: string | null
          challenge_id: string | null
          completed_at: string | null
          created_at: string
          estimated_seconds: number | null
          goal_id: string | null
          id: string
          is_private: boolean
          notes: string
          position: number
          priority: string
          revision: number
          status: string
          timezone: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_seconds?: number | null
          business_date: string
          category_id?: string | null
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string
          estimated_seconds?: number | null
          goal_id?: string | null
          id?: string
          is_private?: boolean
          notes?: string
          position?: number
          priority?: string
          revision?: number
          status?: string
          timezone: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_seconds?: number | null
          business_date?: string
          category_id?: string | null
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string
          estimated_seconds?: number | null
          goal_id?: string | null
          id?: string
          is_private?: boolean
          notes?: string
          position?: number
          priority?: string
          revision?: number
          status?: string
          timezone?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_challenge_id_user_id_fkey"
            columns: ["challenge_id", "user_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_goal_id_user_id_fkey"
            columns: ["goal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      tracking_operations: {
        Row: {
          created_at: string
          id: string
          input: Json
          metric_id: string
          operation_id: string
          result: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input: Json
          metric_id: string
          operation_id: string
          result: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input?: Json
          metric_id?: string
          operation_id?: string
          result?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_operations_metric_id_user_id_fkey"
            columns: ["metric_id", "user_id"]
            isOneToOne: false
            referencedRelation: "metric_definitions"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          hide_private_today: boolean
          onboarding_completed: boolean
          privacy_mode: boolean
          selected_challenge_id: string | null
          starter_applied_on: string | null
          theme: string
          timezone: string
          updated_at: string
          user_id: string
          week_starts_on: number
        }
        Insert: {
          created_at?: string
          hide_private_today?: boolean
          onboarding_completed?: boolean
          privacy_mode?: boolean
          selected_challenge_id?: string | null
          starter_applied_on?: string | null
          theme?: string
          timezone?: string
          updated_at?: string
          user_id: string
          week_starts_on?: number
        }
        Update: {
          created_at?: string
          hide_private_today?: boolean
          onboarding_completed?: boolean
          privacy_mode?: boolean
          selected_challenge_id?: string | null
          starter_applied_on?: string | null
          theme?: string
          timezone?: string
          updated_at?: string
          user_id?: string
          week_starts_on?: number
        }
        Relationships: [
          {
            foreignKeyName: "preferences_selected_challenge_owner"
            columns: ["selected_challenge_id", "user_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      weekly_reviews: {
        Row: {
          created_at: string
          difficulties: string
          energy: number | null
          focus: number | null
          id: string
          lessons: string
          mood: number | null
          motivation: number | null
          next_week_changes: string
          revision: number
          stress: number | null
          timezone: string
          updated_at: string
          user_id: string
          week_start: string
          week_starts_on: number
          wins: string
        }
        Insert: {
          created_at?: string
          difficulties?: string
          energy?: number | null
          focus?: number | null
          id?: string
          lessons?: string
          mood?: number | null
          motivation?: number | null
          next_week_changes?: string
          revision?: number
          stress?: number | null
          timezone: string
          updated_at?: string
          user_id: string
          week_start: string
          week_starts_on: number
          wins?: string
        }
        Update: {
          created_at?: string
          difficulties?: string
          energy?: number | null
          focus?: number | null
          id?: string
          lessons?: string
          mood?: number | null
          motivation?: number | null
          next_week_changes?: string
          revision?: number
          stress?: number | null
          timezone?: string
          updated_at?: string
          user_id?: string
          week_start?: string
          week_starts_on?: number
          wins?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string
          position: number
          updated_at: string
          user_id: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string
          position: number
          updated_at?: string
          user_id: string
          workout_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string
          position?: number
          updated_at?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_user_id_fkey"
            columns: ["exercise_id", "user_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_user_id_fkey"
            columns: ["workout_id", "user_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      workout_operations: {
        Row: {
          created_at: string
          id: string
          operation_id: string
          result_workout_id: string
          source_workout_id: string
          target_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          operation_id: string
          result_workout_id: string
          source_workout_id: string
          target_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          operation_id?: string
          result_workout_id?: string
          source_workout_id?: string
          target_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_operations_result_workout_id_user_id_fkey"
            columns: ["result_workout_id", "user_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "workout_operations_source_workout_id_user_id_fkey"
            columns: ["source_workout_id", "user_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          created_at: string
          id: string
          reps: number
          rpe: number | null
          set_number: number
          updated_at: string
          user_id: string
          weight_kg: number
          workout_exercise_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reps: number
          rpe?: number | null
          set_number: number
          updated_at?: string
          user_id: string
          weight_kg: number
          workout_exercise_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reps?: number
          rpe?: number | null
          set_number?: number
          updated_at?: string
          user_id?: string
          weight_kg?: number
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_workout_exercise_id_user_id_fkey"
            columns: ["workout_exercise_id", "user_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      workouts: {
        Row: {
          business_date: string
          challenge_id: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          name: string
          notes: string
          revision: number
          status: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_date: string
          challenge_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          name: string
          notes?: string
          revision?: number
          status?: string
          timezone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_date?: string
          challenge_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          name?: string
          notes?: string
          revision?: number
          status?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_challenge_id_user_id_fkey"
            columns: ["challenge_id", "user_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_tracking_definition: {
        Args: { p_expected_at: string; p_id: string; p_kind: string }
        Returns: undefined
      }
      associate_tracking_challenge: { Args: { p_input: Json }; Returns: string }
      carry_planning_tasks: {
        Args: {
          p_mode: string
          p_operation_id: string
          p_source_date: string
          p_target_date: string
        }
        Returns: Json
      }
      complete_tracking_onboarding: {
        Args: { p_input: Json }
        Returns: undefined
      }
      control_focus_timer: {
        Args: { p_action: string; p_expected_revision: number; p_id: string }
        Returns: Json
      }
      copy_fitness_workout: {
        Args: { p_date: string; p_operation_id: string; p_source_id: string }
        Returns: string
      }
      delete_fitness_workout: {
        Args: { p_expected_revision: number; p_id: string }
        Returns: undefined
      }
      delete_tracking_definition: {
        Args: { p_expected_at: string; p_id: string; p_kind: string }
        Returns: undefined
      }
      delete_workspace_data: {
        Args: { p_confirmation: string }
        Returns: undefined
      }
      export_workspace_data: { Args: never; Returns: Json }
      increment_tracking_metric: { Args: { p_input: Json }; Returns: Json }
      move_planning_task: {
        Args: { p_direction: string; p_expected_revision: number; p_id: string }
        Returns: Json
      }
      save_fitness_exercise: { Args: { p_input: Json }; Returns: Json }
      save_fitness_sleep: { Args: { p_input: Json }; Returns: Json }
      save_fitness_workout: { Args: { p_input: Json }; Returns: Json }
      save_goal_milestone: { Args: { p_input: Json }; Returns: Json }
      save_monthly_reflection: { Args: { p_input: Json }; Returns: Json }
      save_planning_goal: { Args: { p_input: Json }; Returns: Json }
      save_planning_task: { Args: { p_input: Json }; Returns: Json }
      save_study_category: { Args: { p_input: Json }; Returns: Json }
      save_study_session: { Args: { p_input: Json }; Returns: Json }
      save_tracking_challenge: { Args: { p_input: Json }; Returns: string }
      save_tracking_frequency: { Args: { p_input: Json }; Returns: string }
      save_tracking_habit: { Args: { p_input: Json }; Returns: string }
      save_tracking_metric: { Args: { p_input: Json }; Returns: string }
      save_tracking_score_category: { Args: { p_input: Json }; Returns: string }
      save_tracking_score_policy: { Args: { p_input: Json }; Returns: string }
      save_weekly_review: { Args: { p_input: Json }; Returns: Json }
      set_planning_task_status: {
        Args: { p_expected_revision: number; p_id: string; p_status: string }
        Returns: Json
      }
      setup_career: { Args: { p_input: Json }; Returns: undefined }
      setup_fitness: { Args: { p_input: Json }; Returns: undefined }
      start_focus_timer: { Args: { p_input: Json }; Returns: Json }
      write_tracking_habit_log: { Args: { p_input: Json }; Returns: Json }
      write_tracking_metric_log: { Args: { p_input: Json }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
