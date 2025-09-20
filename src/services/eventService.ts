import { supabase } from "../lib/supabase/client"
import { LinkPreviewService } from "../lib/linkPreview"
import type { User } from "@supabase/supabase-js"

export interface EventData {
  id?: string
  title: string
  description?: string
  location: string
  latitude: number
  longitude: number
  event_date: string
  event_type: "upcoming" | "ongoing" | "ended"
  publication_links?: Array<{ url: string; preview_id?: string }>
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface EventWithProfile extends EventData {
  profiles?: {
    display_name: string | null
    email: string
    role: "viewer" | "contributor"
  }
}

export class EventService {
  static async createEvent(eventData: Omit<EventData, "id" | "created_at" | "updated_at">, user: User) {
    try {
      // First, process any publication links and create link previews
      const processedLinks = await this.processPublicationLinks(eventData.publication_links || [])

      // Create the event in the database
      const { data, error } = await supabase
        .from("events")
        .insert({
          ...eventData,
          publication_links: processedLinks,
          created_by: user.id,
        })
        .select(`
          *,
          profiles:created_by (
            display_name,
            email,
            role
          )
        `)
        .single()

      if (error) {
        throw new Error(`Failed to create event: ${error.message}`)
      }

      return data as EventWithProfile
    } catch (error) {
      console.error("Error creating event:", error)
      throw error
    }
  }

  static async updateEvent(eventId: string, updates: Partial<EventData>, user: User) {
    try {
      // Check if user has permission to update this event
      const { data: existingEvent, error: fetchError } = await supabase
        .from("events")
        .select("created_by, profiles:created_by(role)")
        .eq("id", eventId)
        .single()

      if (fetchError) {
        throw new Error(`Failed to fetch event: ${fetchError.message}`)
      }

      // Only allow the creator or contributors to update
      const isCreator = existingEvent.created_by === user.id
      const isContributor = existingEvent.profiles?.role === "contributor"

      if (!isCreator && !isContributor) {
        throw new Error("You don't have permission to update this event")
      }

      // Process publication links if they're being updated
      if (updates.publication_links) {
        updates.publication_links = await this.processPublicationLinks(updates.publication_links)
      }

      const { data, error } = await supabase
        .from("events")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId)
        .select(`
          *,
          profiles:created_by (
            display_name,
            email,
            role
          )
        `)
        .single()

      if (error) {
        throw new Error(`Failed to update event: ${error.message}`)
      }

      return data as EventWithProfile
    } catch (error) {
      console.error("Error updating event:", error)
      throw error
    }
  }

  static async deleteEvent(eventId: string, user: User) {
    try {
      // Check if user has permission to delete this event
      const { data: existingEvent, error: fetchError } = await supabase
        .from("events")
        .select("created_by, profiles:created_by(role)")
        .eq("id", eventId)
        .single()

      if (fetchError) {
        throw new Error(`Failed to fetch event: ${fetchError.message}`)
      }

      // Only allow the creator to delete
      const isCreator = existingEvent.created_by === user.id

      if (!isCreator) {
        throw new Error("You can only delete events you created")
      }

      const { error } = await supabase.from("events").delete().eq("id", eventId)

      if (error) {
        throw new Error(`Failed to delete event: ${error.message}`)
      }

      return true
    } catch (error) {
      console.error("Error deleting event:", error)
      throw error
    }
  }

  static async getEvents(filters?: {
    status?: "upcoming" | "ongoing" | "ended"
    location?: string
    created_by?: string
    limit?: number
    offset?: number
  }) {
    try {
      let query = supabase
        .from("events")
        .select(`
          *,
          profiles:created_by (
            display_name,
            email,
            role
          )
        `)
        .order("created_at", { ascending: false })

      // Apply filters
      if (filters?.status) {
        query = query.eq("event_type", filters.status)
      }

      if (filters?.location) {
        query = query.ilike("location", `%${filters.location}%`)
      }

      if (filters?.created_by) {
        query = query.eq("created_by", filters.created_by)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to fetch events: ${error.message}`)
      }

      return data as EventWithProfile[]
    } catch (error) {
      console.error("Error fetching events:", error)
      throw error
    }
  }

  static async getEventById(eventId: string) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles:created_by (
            display_name,
            email,
            role
          )
        `)
        .eq("id", eventId)
        .single()

      if (error) {
        throw new Error(`Failed to fetch event: ${error.message}`)
      }

      return data as EventWithProfile
    } catch (error) {
      console.error("Error fetching event:", error)
      throw error
    }
  }

  static async getEventsByUser(userId: string) {
    return this.getEvents({ created_by: userId })
  }

  static async searchEvents(searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles:created_by (
            display_name,
            email,
            role
          )
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to search events: ${error.message}`)
      }

      return data as EventWithProfile[]
    } catch (error) {
      console.error("Error searching events:", error)
      throw error
    }
  }

  private static async processPublicationLinks(links: Array<{ url: string; preview_id?: string }>) {
    const processedLinks = []

    for (const link of links) {
      try {
        // Fetch link preview and cache it
        const preview = await LinkPreviewService.fetchLinkPreview(link.url)

        if (preview) {
          processedLinks.push({
            url: link.url,
            preview_id: preview.url, // Use URL as ID for now
            title: preview.title,
            description: preview.description,
            image_url: preview.image_url,
            site_name: preview.site_name,
            link_type: preview.link_type,
          })
        } else {
          // Fallback if preview fails
          processedLinks.push({
            url: link.url,
            title: "Link Preview",
            description: "Click to view content",
          })
        }
      } catch (error) {
        console.error(`Error processing link ${link.url}:`, error)
        // Add the link without preview data
        processedLinks.push({
          url: link.url,
          title: "Link Preview",
          description: "Click to view content",
        })
      }
    }

    return processedLinks
  }

  // Analytics and statistics
  static async getEventStats(userId?: string) {
    try {
      let query = supabase.from("events").select("event_type, created_at")

      if (userId) {
        query = query.eq("created_by", userId)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to fetch event stats: ${error.message}`)
      }

      const stats = {
        total: data.length,
        upcoming: data.filter((e) => e.event_type === "upcoming").length,
        ongoing: data.filter((e) => e.event_type === "ongoing").length,
        ended: data.filter((e) => e.event_type === "ended").length,
        thisMonth: data.filter((e) => {
          const eventDate = new Date(e.created_at)
          const now = new Date()
          return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
        }).length,
      }

      return stats
    } catch (error) {
      console.error("Error fetching event stats:", error)
      throw error
    }
  }

  // Batch operations
  static async updateEventStatus(eventId: string, status: "upcoming" | "ongoing" | "ended", user: User) {
    return this.updateEvent(eventId, { event_type: status }, user)
  }

  static async bulkUpdateEventStatus(eventIds: string[], status: "upcoming" | "ongoing" | "ended", user: User) {
    const results = []

    for (const eventId of eventIds) {
      try {
        const result = await this.updateEventStatus(eventId, status, user)
        results.push({ eventId, success: true, data: result })
      } catch (error) {
        results.push({ eventId, success: false, error: error.message })
      }
    }

    return results
  }
}
