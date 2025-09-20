import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDk3NzEyMDAiLCJleHAiOjE5NjUzNDcyMDB9.placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: "viewer" | "contributor"
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: "viewer" | "contributor"
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: "viewer" | "contributor"
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          location: string
          latitude: number
          longitude: number
          event_date: string
          event_type: "upcoming" | "ongoing" | "ended"
          publication_links: any
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          location: string
          latitude: number
          longitude: number
          event_date: string
          event_type: "upcoming" | "ongoing" | "ended"
          publication_links?: any
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          location?: string
          latitude?: number
          longitude?: number
          event_date?: string
          event_type?: "upcoming" | "ongoing" | "ended"
          publication_links?: any
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      link_previews: {
        Row: {
          id: string
          url: string
          title: string | null
          description: string | null
          image_url: string | null
          site_name: string | null
          published_time: string | null
          link_type: "article" | "twitter" | "medium" | "general"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          url: string
          title?: string | null
          description?: string | null
          image_url?: string | null
          site_name?: string | null
          published_time?: string | null
          link_type?: "article" | "twitter" | "medium" | "general"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          url?: string
          title?: string | null
          description?: string | null
          image_url?: string | null
          site_name?: string | null
          published_time?: string | null
          link_type?: "article" | "twitter" | "medium" | "general"
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
