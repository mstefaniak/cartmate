export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at?: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          created_at?: string;
        };
      };
      shopping_lists: {
        Row: {
          id: string;
          title: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          is_active: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          name: string;
          category: string;
          added_by: string;
          added_at: string;
          is_purchased: boolean;
          list_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          added_by: string;
          added_at?: string;
          is_purchased?: boolean;
          list_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          added_by?: string;
          added_at?: string;
          is_purchased?: boolean;
          list_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 