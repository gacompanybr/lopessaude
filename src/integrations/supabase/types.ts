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
      company_settings: {
        Row: {
          address: string | null
          cnpj: string | null
          company_name: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      lead_origem_history: {
        Row: {
          automatic: boolean
          changed_at: string
          changed_by: string | null
          id: string
          lead_id: string
          new_tag: string
          old_tag: string | null
        }
        Insert: {
          automatic?: boolean
          changed_at?: string
          changed_by?: string | null
          id?: string
          lead_id: string
          new_tag: string
          old_tag?: string | null
        }
        Update: {
          automatic?: boolean
          changed_at?: string
          changed_by?: string | null
          id?: string
          lead_id?: string
          new_tag?: string
          old_tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_origem_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          lead_id: string
          new_status: string
          old_status: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          lead_id: string
          new_status: string
          old_status?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          lead_id?: string
          new_status?: string
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_status_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          city: string
          created_at: string
          email: string | null
          gclid: string | null
          id: string
          landing_page: string | null
          message: string | null
          meta_ad_id: string | null
          meta_ad_name: string | null
          meta_adset_id: string | null
          meta_adset_name: string | null
          meta_campaign_id: string | null
          meta_campaign_name: string | null
          meta_ctwa_clid: string | null
          meta_fbc: string | null
          meta_fbp: string | null
          meta_form_id: string | null
          meta_form_name: string | null
          meta_lead_id: string | null
          meta_page_id: string | null
          name: string | null
          notes: string | null
          origem: Database["public"]["Enums"]["lead_origem"]
          plataforma_origem: string | null
          referrer: string | null
          sincronizado_meta: boolean
          state: string | null
          status: Database["public"]["Enums"]["lead_status"]
          tag_origem: Database["public"]["Enums"]["lead_tag_origem"]
          tag_origem_alterada_em: string | null
          tag_origem_alterada_por: string | null
          tag_origem_manual: boolean
          ultimo_envio_meta_em: string | null
          ultimo_erro_meta: string | null
          ultimo_retorno_meta: Json | null
          ultimo_status_enviado_meta: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          whatsapp: string
        }
        Insert: {
          city: string
          created_at?: string
          email?: string | null
          gclid?: string | null
          id?: string
          landing_page?: string | null
          message?: string | null
          meta_ad_id?: string | null
          meta_ad_name?: string | null
          meta_adset_id?: string | null
          meta_adset_name?: string | null
          meta_campaign_id?: string | null
          meta_campaign_name?: string | null
          meta_ctwa_clid?: string | null
          meta_fbc?: string | null
          meta_fbp?: string | null
          meta_form_id?: string | null
          meta_form_name?: string | null
          meta_lead_id?: string | null
          meta_page_id?: string | null
          name?: string | null
          notes?: string | null
          origem?: Database["public"]["Enums"]["lead_origem"]
          plataforma_origem?: string | null
          referrer?: string | null
          sincronizado_meta?: boolean
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tag_origem?: Database["public"]["Enums"]["lead_tag_origem"]
          tag_origem_alterada_em?: string | null
          tag_origem_alterada_por?: string | null
          tag_origem_manual?: boolean
          ultimo_envio_meta_em?: string | null
          ultimo_erro_meta?: string | null
          ultimo_retorno_meta?: Json | null
          ultimo_status_enviado_meta?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp: string
        }
        Update: {
          city?: string
          created_at?: string
          email?: string | null
          gclid?: string | null
          id?: string
          landing_page?: string | null
          message?: string | null
          meta_ad_id?: string | null
          meta_ad_name?: string | null
          meta_adset_id?: string | null
          meta_adset_name?: string | null
          meta_campaign_id?: string | null
          meta_campaign_name?: string | null
          meta_ctwa_clid?: string | null
          meta_fbc?: string | null
          meta_fbp?: string | null
          meta_form_id?: string | null
          meta_form_name?: string | null
          meta_lead_id?: string | null
          meta_page_id?: string | null
          name?: string | null
          notes?: string | null
          origem?: Database["public"]["Enums"]["lead_origem"]
          plataforma_origem?: string | null
          referrer?: string | null
          sincronizado_meta?: boolean
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tag_origem?: Database["public"]["Enums"]["lead_tag_origem"]
          tag_origem_alterada_em?: string | null
          tag_origem_alterada_por?: string | null
          tag_origem_manual?: boolean
          ultimo_envio_meta_em?: string | null
          ultimo_erro_meta?: string | null
          ultimo_retorno_meta?: Json | null
          ultimo_status_enviado_meta?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      meta_integration_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_name: string
          http_status: number | null
          id: string
          lead_id: string | null
          request_payload: Json | null
          response_payload: Json | null
          success: boolean
          test_event_code: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_name: string
          http_status?: number | null
          id?: string
          lead_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          success?: boolean
          test_event_code?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_name?: string
          http_status?: number | null
          id?: string
          lead_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          success?: boolean
          test_event_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meta_integration_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_webhook_subscriptions: {
        Row: {
          active: boolean
          created_at: string
          id: string
          page_access_token: string
          page_id: string
          page_name: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          page_access_token: string
          page_id: string
          page_name?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          page_access_token?: string
          page_id?: string
          page_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profile_types: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          type: Database["public"]["Enums"]["profile_category"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          type?: Database["public"]["Enums"]["profile_category"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["profile_category"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profile_assignments: {
        Row: {
          created_at: string
          id: string
          profile_type_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_type_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_type_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_assignments_profile_type_id_fkey"
            columns: ["profile_type_id"]
            isOneToOne: false
            referencedRelation: "profile_types"
            referencedColumns: ["id"]
          },
        ]
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
      create_public_lead:
        | {
            Args: {
              _city?: string
              _email?: string
              _landing_page?: string
              _message?: string
              _meta_ctwa_clid?: string
              _meta_fbc?: string
              _meta_fbp?: string
              _name?: string
              _notes?: string
              _origem?: Database["public"]["Enums"]["lead_origem"]
              _referrer?: string
              _state?: string
              _status?: Database["public"]["Enums"]["lead_status"]
              _utm_campaign?: string
              _utm_content?: string
              _utm_medium?: string
              _utm_source?: string
              _utm_term?: string
              _whatsapp?: string
            }
            Returns: string
          }
        | {
            Args: {
              _city?: string
              _email?: string
              _gclid?: string
              _landing_page?: string
              _message?: string
              _meta_ctwa_clid?: string
              _meta_fbc?: string
              _meta_fbp?: string
              _name?: string
              _notes?: string
              _origem?: Database["public"]["Enums"]["lead_origem"]
              _referrer?: string
              _state?: string
              _status?: Database["public"]["Enums"]["lead_status"]
              _utm_campaign?: string
              _utm_content?: string
              _utm_medium?: string
              _utm_source?: string
              _utm_term?: string
              _whatsapp?: string
            }
            Returns: string
          }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "atendente"
      lead_origem:
        | "site"
        | "manual"
        | "whatsapp"
        | "indicacao"
        | "outro"
        | "redes_sociais"
      lead_status: "novo" | "em_contato" | "agendado" | "convertido" | "perdido"
      lead_tag_origem: "novo" | "site" | "google_ads" | "meta_ads" | "organico"
      profile_category:
        | "administrador"
        | "atendente"
        | "comercial"
        | "gerente"
        | "outro"
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
      app_role: ["admin", "atendente"],
      lead_origem: [
        "site",
        "manual",
        "whatsapp",
        "indicacao",
        "outro",
        "redes_sociais",
      ],
      lead_status: ["novo", "em_contato", "agendado", "convertido", "perdido"],
      lead_tag_origem: ["novo", "site", "google_ads", "meta_ads", "organico"],
      profile_category: [
        "administrador",
        "atendente",
        "comercial",
        "gerente",
        "outro",
      ],
    },
  },
} as const
