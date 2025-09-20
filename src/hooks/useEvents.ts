"use client"

import { useState, useEffect, useCallback } from "react"
import { EventService, type EventWithProfile } from "../services/eventService"
import { useAuth } from "./useAuth"

export function useEvents(filters?: {
  status?: "upcoming" | "ongoing" | "ended"
  location?: string
  limit?: number
}) {
  const [events, setEvents] = useState<EventWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await EventService.getEvents(filters)
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const createEvent = useCallback(
    async (eventData: Parameters<typeof EventService.createEvent>[0]) => {
      if (!user) throw new Error("User must be authenticated")

      try {
        const newEvent = await EventService.createEvent(eventData, user)
        setEvents((prev) => [newEvent, ...prev])
        return newEvent
      } catch (error) {
        throw error
      }
    },
    [user],
  )

  const updateEvent = useCallback(
    async (eventId: string, updates: Parameters<typeof EventService.updateEvent>[1]) => {
      if (!user) throw new Error("User must be authenticated")

      try {
        const updatedEvent = await EventService.updateEvent(eventId, updates, user)
        setEvents((prev) => prev.map((event) => (event.id === eventId ? updatedEvent : event)))
        return updatedEvent
      } catch (error) {
        throw error
      }
    },
    [user],
  )

  const deleteEvent = useCallback(
    async (eventId: string) => {
      if (!user) throw new Error("User must be authenticated")

      try {
        await EventService.deleteEvent(eventId, user)
        setEvents((prev) => prev.filter((event) => event.id !== eventId))
        return true
      } catch (error) {
        throw error
      }
    },
    [user],
  )

  const refreshEvents = useCallback(() => {
    loadEvents()
  }, [loadEvents])

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
  }
}

export function useEventStats(userId?: string) {
  const [stats, setStats] = useState<{
    total: number
    upcoming: number
    ongoing: number
    ended: number
    thisMonth: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await EventService.getEventStats(userId)
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats")
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [userId])

  return { stats, loading, error }
}

export function useEventSearch() {
  const [results, setResults] = useState<EventWithProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await EventService.searchEvents(searchTerm)
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  }
}
