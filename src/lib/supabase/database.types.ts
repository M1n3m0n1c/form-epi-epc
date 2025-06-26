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
      formularios: {
        Row: {
          created_at: string | null
          ufsigla: string | null
          data_criacao: string | null
          // data_expiracao: string | null // Removido
          data_resposta: string | null
          empresa: string
          id: string
          regional: string
          status: string | null
          token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ufsigla?: string | null
          data_criacao?: string | null
          // data_expiracao?: string | null // Removido
          data_resposta?: string | null
          empresa: string
          id?: string
          regional: string
          status?: string | null
          token: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ufsigla?: string | null
          data_criacao?: string | null
          // data_expiracao?: string | null // Removido
          data_resposta?: string | null
          empresa?: string
          id?: string
          regional?: string
          status?: string | null
          token?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fotos: {
        Row: {
          created_at: string | null
          formulario_id: string | null
          id: string
          metadata: Json | null
          nome_arquivo: string
          resposta_id: string | null
          secao: string
          tamanho_bytes: number | null
          tipo_mime: string | null
          url_storage: string
        }
        Insert: {
          created_at?: string | null
          formulario_id?: string | null
          id?: string
          metadata?: Json | null
          nome_arquivo: string
          resposta_id?: string | null
          secao: string
          tamanho_bytes?: number | null
          tipo_mime?: string | null
          url_storage: string
        }
        Update: {
          created_at?: string | null
          formulario_id?: string | null
          id?: string
          metadata?: Json | null
          nome_arquivo?: string
          resposta_id?: string | null
          secao?: string
          tamanho_bytes?: number | null
          tipo_mime?: string | null
          url_storage?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_formulario_id_fkey"
            columns: ["formulario_id"]
            isOneToOne: false
            referencedRelation: "formularios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotos_resposta_id_fkey"
            columns: ["resposta_id"]
            isOneToOne: false
            referencedRelation: "respostas"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas: {
        Row: {
          certificados_validos: boolean
          corda_icamento: boolean | null
          created_at: string | null
          declaracao_responsabilidade: boolean | null
          empresa: string
          epi_calcado: boolean
          epi_calcado_isolante: boolean | null
          epi_capacete: boolean
          epi_capacete_classe_b: boolean | null
          epi_capacete_jugular: boolean | null
          epi_cinto_seguranca: boolean | null
          epi_luvas: boolean
          epi_luvas_isolantes: boolean | null
          epi_oculos: boolean
          epi_protetor_auricular: boolean
          epi_talabarte: boolean | null
          epi_trava_quedas: boolean | null
          epi_vestimenta: boolean | null
          epi_vestimenta_antiarco: boolean | null
          equipamentos_integros: boolean | null
          ferramental: boolean | null
          formulario_id: string | null
          id: string
          inspecionado_cpf: string
          inspecionado_funcao: string
          inspecionado_nome: string
          observacoes_epi_altura: string | null
          observacoes_epi_basico: string | null
          observacoes_epi_eletrico: string | null
          observacoes_gerais: string | null
          observacoes_inspecao: string | null
          regional: string
          reforco_regras_ouro: boolean | null
          responsavel_cpf: string
          responsavel_funcao: string
          responsavel_nome: string
          responsavel_regional: string
          trabalho_altura: boolean | null
          trabalho_eletrico: boolean | null
          treinamento_adequado: boolean | null
          updated_at: string | null
        }
        Insert: {
          certificados_validos: boolean
          corda_icamento?: boolean | null
          created_at?: string | null
          declaracao_responsabilidade?: boolean | null
          empresa: string
          epi_calcado: boolean
          epi_calcado_isolante?: boolean | null
          epi_capacete: boolean
          epi_capacete_classe_b?: boolean | null
          epi_capacete_jugular?: boolean | null
          epi_cinto_seguranca?: boolean | null
          epi_luvas: boolean
          epi_luvas_isolantes?: boolean | null
          epi_oculos: boolean
          epi_protetor_auricular: boolean
          epi_talabarte?: boolean | null
          epi_trava_quedas?: boolean | null
          epi_vestimenta: boolean
          epi_vestimenta_antiarco?: boolean | null
          equipamentos_integros: boolean
          ferramental?: boolean | null
          formulario_id?: string | null
          id?: string
          inspecionado_cpf: string
          inspecionado_funcao: string
          inspecionado_nome: string
          observacoes_epi_altura?: string | null
          observacoes_epi_basico?: string | null
          observacoes_epi_eletrico?: string | null
          observacoes_gerais?: string | null
          observacoes_inspecao?: string | null
          regional: string
          reforco_regras_ouro?: boolean | null
          responsavel_cpf: string
          responsavel_funcao: string
          responsavel_nome: string
          responsavel_regional: string
          trabalho_altura?: boolean | null
          trabalho_eletrico?: boolean | null
          treinamento_adequado: boolean
          updated_at?: string | null
        }
        Update: {
          certificados_validos?: boolean
          corda_icamento?: boolean | null
          created_at?: string | null
          declaracao_responsabilidade?: boolean | null
          empresa?: string
          epi_calcado?: boolean
          epi_calcado_isolante?: boolean | null
          epi_capacete?: boolean
          epi_capacete_classe_b?: boolean | null
          epi_capacete_jugular?: boolean | null
          epi_cinto_seguranca?: boolean | null
          epi_luvas?: boolean
          epi_luvas_isolantes?: boolean | null
          epi_oculos?: boolean
          epi_protetor_auricular?: boolean
          epi_talabarte?: boolean | null
          epi_trava_quedas?: boolean | null
          epi_vestimenta?: boolean
          epi_vestimenta_antiarco?: boolean | null
          equipamentos_integros?: boolean | null
          ferramental?: boolean | null
          formulario_id?: string | null
          id?: string
          inspecionado_cpf?: string
          inspecionado_funcao?: string
          inspecionado_nome?: string
          observacoes_epi_altura?: string | null
          observacoes_epi_basico?: string | null
          observacoes_epi_eletrico?: string | null
          observacoes_gerais?: string | null
          observacoes_inspecao?: string | null
          regional?: string
          reforco_regras_ouro?: boolean | null
          responsavel_cpf?: string
          responsavel_funcao?: string
          responsavel_nome?: string
          responsavel_regional?: string
          trabalho_altura?: boolean | null
          trabalho_eletrico?: boolean | null
          treinamento_adequado?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "respostas_formulario_id_fkey"
            columns: ["formulario_id"]
            isOneToOne: false
            referencedRelation: "formularios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      updateformulariostatus: {
        Args: {
          formulario_id: string
          novo_status?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
