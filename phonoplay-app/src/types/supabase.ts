export type Json = 
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      phonemes: {
        Row: {
          example: string | null;
          group: string;
          id: number;
          phoneme: string;
          sound: string | null;
        };
        Insert: {
          example?: string | null;
          group: string;
          id?: number;
          phoneme: string;
          sound?: string | null;
        };
        Update: {
          example?: string | null;
          group?: string;
          id?: number;
          phoneme?: string;
          sound?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          credits: number;
          email: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          credits?: number;
          email: string;
          id: string;
        };
        Update: {
          created_at?: string;
          credits?: number;
          email?: string;
          id?: string;
        };
        Relationships: [];
      };
      words: {
        Row: {
          id: number;
          image_path: string | null;
          phonemes: string[];
          word: string;
        };
        Insert: {
          id?: number;
          image_path?: string | null;
          phonemes: string[];
          word: string;
        };
        Update: {
          id?: number;
          image_path?: string | null;
          phonemes?: string[];
          word?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_bucket_with_policies: {
        Args: {
          bucket_id: string;
          is_public?: boolean;
          file_size_limit?: number;
          allowed_mime_types?: string[];
        };
        Returns: undefined;
      };
      create_storage_policies: {
        Args: {
          bucket_name: string;
          is_public?: boolean;
          file_size_limit?: number;
          allowed_mime_types?: string[];
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type Views<T extends keyof PublicSchema["Views"]> = PublicSchema["Views"][T]["Row"];
export type Functions<T extends keyof PublicSchema["Functions"]> = PublicSchema["Functions"][T];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
export type CompositeTypes<T extends keyof PublicSchema["CompositeTypes"]> = PublicSchema["CompositeTypes"][T];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U; error: null }> ? U : never;
export type DbResultErr = unknown;

export type TypedSupabaseClient = import('@supabase/supabase-js').SupabaseClient<Database>;

// The following types are copied from the supabase-js library to avoid a direct dependency
// This is to keep the bundle size small when these types are used in client-side code
// See: https://github.com/supabase/supabase-js/blob/master/src/lib/types.ts

export type PostgrestError = {
  message: string;
  details: string;
  hint: string;
  code: string;
};

export interface PostgrestResponseBase {
  status: number;
  statusText: string;
  error: PostgrestError | null;
  count: number | null;
}

export interface PostgrestSingleResponse<T> extends PostgrestResponseBase {
  data: T | null;
}

export type PostgrestMaybeSingleResponse<T> = PostgrestSingleResponse<T>;

export interface PostgrestMultipleResponse<T> extends PostgrestResponseBase {
  data: T[];
}

export type SchemaOf<T extends keyof Database> = Database[T];
export type TablesOf<S extends keyof Database, T extends keyof Database[S]["Tables"]> = Database[S]["Tables"][T] extends { Row: infer R } ? R : never;
export type EnumsOf<S extends keyof Database, E extends keyof Database[S]["Enums"]> = Database[S]["Enums"][E];

export type GetResult<
  SchemaName extends keyof Database,
  TableNameOrViewName extends keyof Database[SchemaName]["Tables"] | keyof Database[SchemaName]["Views"],
  Operation extends "Insert" | "Update" | "Row" = "Row",
> = TableNameOrViewName extends keyof Database[SchemaName]["Tables"]
  ? Database[SchemaName]["Tables"][TableNameOrViewName] extends { [K in Operation]: infer O }
    ? O
    : never
  : TableNameOrViewName extends keyof Database[SchemaName]["Views"]
    ? Database[SchemaName]["Views"][TableNameOrViewName] extends { [K in Operation]: infer O }
      ? O
      : never
    : never;

export type GetInsertType<
  SchemaName extends keyof Database,
  TableName extends keyof Database[SchemaName]["Tables"],
> = Database[SchemaName]["Tables"][TableName] extends { Insert: infer I } ? I : never;

export type GetUpdateType<
  SchemaName extends keyof Database,
  TableName extends keyof Database[SchemaName]["Tables"],
> = Database[SchemaName]["Tables"][TableName] extends { Update: infer U } ? U : never;

export type GetRowType<
  SchemaName extends keyof Database,
  TableNameOrViewName extends keyof Database[SchemaName]["Tables"] | keyof Database[SchemaName]["Views"],
> = TableNameOrViewName extends keyof Database[SchemaName]["Tables"]
  ? (Database[SchemaName]["Tables"][TableNameOrViewName] extends { Row: infer R } ? R : never)
  : TableNameOrViewName extends keyof Database[SchemaName]["Views"]
    ? (Database[SchemaName]["Views"][TableNameOrViewName] extends { Row: infer R } ? R : never)
    : never;

// The following type is a workaround for a bug in the Supabase CLI
// It should be removed once the bug is fixed
// See: https://github.com/supabase/cli/issues/1313
export type JsonObject = { [key: string]: Json | undefined };

// Default schema is public
export type DefaultSchema = Database["public"];

// It's generally recommended to use the more specific types above like Tables<'your_table_name'>, TablesInsert<'table'>, etc.
// The generic types below are very broad and might be harder to work with.

export const Constants = {
  public: {
    Enums: {},
  },
} as const;