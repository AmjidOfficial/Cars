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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      inventory: {
        Row: {
          brand: string
          created_at: string
          description: string | null
          fuel_type: string | null
          id: string
          images: string[]
          is_premium: boolean
          mileage_km: number | null
          model_year: number | null
          price_formatted: string | null
          price_pkr: number | null
          showroom_id: string
          status: Database["public"]["Enums"]["inventory_status"]
          title: string
          transmission: string | null
          updated_at: string
        }
        Insert: {
          brand: string
          created_at?: string
          description?: string | null
          fuel_type?: string | null
          id?: string
          images?: string[]
          is_premium?: boolean
          mileage_km?: number | null
          model_year?: number | null
          price_formatted?: string | null
          price_pkr?: number | null
          showroom_id: string
          status?: Database["public"]["Enums"]["inventory_status"]
          title: string
          transmission?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string
          created_at?: string
          description?: string | null
          fuel_type?: string | null
          id?: string
          images?: string[]
          is_premium?: boolean
          mileage_km?: number | null
          model_year?: number | null
          price_formatted?: string | null
          price_pkr?: number | null
          showroom_id?: string
          status?: Database["public"]["Enums"]["inventory_status"]
          title?: string
          transmission?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_showroom_id_fkey"
            columns: ["showroom_id"]
            isOneToOne: false
            referencedRelation: "showrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          id: string
          intent: Database["public"]["Enums"]["lead_intent"]
          notes: string | null
          target_inventory_id: string | null
          target_showroom_id: string | null
          user_agent: string | null
          visitor_mobile: string | null
          visitor_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          intent: Database["public"]["Enums"]["lead_intent"]
          notes?: string | null
          target_inventory_id?: string | null
          target_showroom_id?: string | null
          user_agent?: string | null
          visitor_mobile?: string | null
          visitor_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          intent?: Database["public"]["Enums"]["lead_intent"]
          notes?: string | null
          target_inventory_id?: string | null
          target_showroom_id?: string | null
          user_agent?: string | null
          visitor_mobile?: string | null
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_target_inventory_id_fkey"
            columns: ["target_inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_target_showroom_id_fkey"
            columns: ["target_showroom_id"]
            isOneToOne: false
            referencedRelation: "showrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      media_posts: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string
          showroom_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url: string
          showroom_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string
          showroom_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_posts_showroom_id_fkey"
            columns: ["showroom_id"]
            isOneToOne: false
            referencedRelation: "showrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          mobile_number: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          mobile_number: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          mobile_number?: string
        }
        Relationships: []
      }
      showrooms: {
        Row: {
          call_number: string | null
          city: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_flagship: boolean
          logo_url: string | null
          name: string
          owner_id: string
          slug: string
          tagline: string | null
          theme_config: Json
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          call_number?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_flagship?: boolean
          logo_url?: string | null
          name: string
          owner_id: string
          slug: string
          tagline?: string | null
          theme_config?: Json
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          call_number?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_flagship?: boolean
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string
          tagline?: string | null
          theme_config?: Json
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "showroom_admin" | "visitor"
      inventory_status: "available" | "reserved" | "sold"
      lead_intent:
        | "callback"
        | "whatsapp"
        | "view_details"
        | "concierge"
        | "inventory_view"
      media_type: "image" | "video"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "showroom_admin", "visitor"],
      inventory_status: ["available", "reserved", "sold"],
      lead_intent: [
        "callback",
        "whatsapp",
        "view_details",
        "concierge",
        "inventory_view",
      ],
      media_type: ["image", "video"],
    },
  },
} as const
