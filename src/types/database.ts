// Generated from migrations by npm run db:types. Do not edit by hand.
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          user_id: string;
          life_area_id: string | null;
          name: string;
          position: number;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          life_area_id?: string | null;
          name: string;
          position?: number;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          life_area_id?: string | null;
          name?: string;
          position?: number;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "categories_life_area_id_user_id_fkey"; columns: ["life_area_id","user_id"]; isOneToOne: false; referencedRelation: "life_areas"; referencedColumns: ["id","user_id"] },
        ];
      };
      life_areas: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string | null;
          color: string | null;
          position: number;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string | null;
          color?: string | null;
          position?: number;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string | null;
          color?: string | null;
          position?: number;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      profiles: {
        Row: {
          user_id: string;
          display_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          display_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      user_preferences: {
        Row: {
          user_id: string;
          timezone: string;
          week_starts_on: number;
          theme: string;
          privacy_mode: boolean;
          hide_private_today: boolean;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          timezone?: string;
          week_starts_on?: number;
          theme?: string;
          privacy_mode?: boolean;
          hide_private_today?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          timezone?: string;
          week_starts_on?: number;
          theme?: string;
          privacy_mode?: boolean;
          hide_private_today?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
