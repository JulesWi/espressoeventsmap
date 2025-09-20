"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { useEvents, useEventStats } from "../hooks/useEvents"
import { useAuth } from "../hooks/useAuth"
import { Calendar, MapPin, Users, MoreVertical, Trash2, BarChart3 } from "lucide-react"
import { LinkPreview } from "./LinkPreview"
import { useLinkPreview } from "../hooks/useLinkPreview"

export function EventManagement() {
  const { user, isContributor } = useAuth()
  const { events, loading, error, deleteEvent, updateEvent } = useEvents()
  const { stats } = useEventStats(user?.id)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(eventId)
      } catch (error) {
        console.error("Failed to delete event:", error)
      }
    }
  }

  const handleStatusUpdate = async (eventId: string, status: "upcoming" | "ongoing" | "ended") => {
    try {
      await updateEvent(eventId, { event_type: status })
    } catch (error) {
      console.error("Failed to update event status:", error)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Please sign in to manage events.</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Loading events...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  const userEvents = events.filter((event) => event.created_by === user.id)

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Your Event Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-500">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
                <div className="text-sm text-gray-500">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.ongoing}</div>
                <div className="text-sm text-gray-500">Ongoing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.ended}</div>
                <div className="text-sm text-gray-500">Ended</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.thisMonth}</div>
                <div className="text-sm text-gray-500">This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Events ({userEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {userEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">You haven't created any events yet.</p>
          ) : (
            <div className="space-y-4">
              {userEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onDelete={handleDeleteEvent}
                  onStatusUpdate={handleStatusUpdate}
                  canEdit={isContributor}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EventCard({
  event,
  onDelete,
  onStatusUpdate,
  canEdit,
}: {
  event: any
  onDelete: (id: string) => void
  onStatusUpdate: (id: string, status: "upcoming" | "ongoing" | "ended") => void
  canEdit: boolean
}) {
  const { preview: linkPreview } = useLinkPreview(event.publication_links?.[0]?.url || null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-100 text-green-800"
      case "ongoing":
        return "bg-yellow-100 text-yellow-800"
      case "ended":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <Badge className={getStatusColor(event.event_type)}>{event.event_type}</Badge>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.event_date).toLocaleDateString()}</span>
              </div>
              {event.description && (
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 mt-0.5" />
                  <span>{event.description}</span>
                </div>
              )}
            </div>

            {/* Publication Link Preview */}
            {event.publication_links?.[0]?.url && linkPreview && (
              <div className="mt-3">
                <LinkPreview preview={linkPreview} showFullPreview={false} />
              </div>
            )}
          </div>

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onStatusUpdate(event.id, "upcoming")}>
                  Set as Upcoming
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusUpdate(event.id, "ongoing")}>Set as Ongoing</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusUpdate(event.id, "ended")}>Set as Ended</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(event.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
