"use client"

import React from "react"
import { Calendar, MapPin, Edit, Trash2 } from "lucide-react"

interface Event {
  id: string
  title: string
  location: string
  city?: string
  theme: string
  status: string
  coordinates: [number, number]
  schedule?: string
  date?: string
  host?: string
  organizer?: string
  guests?: string | string[]
}

interface BottomPanelProps {
  events: Event[]
  onEventSelect: (event: Event) => void
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
  isContributor: boolean
  onEditEvent: (event: Event) => void
  onDeleteEvent: (event: Event) => void
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ events, onEventSelect, getStatusColor, getStatusIcon, isContributor, onEditEvent, onDeleteEvent }) => {
  const chunkedEvents = []
  for (let i = 0; i < events.length; i += 3) {
    chunkedEvents.push(events.slice(i, i + 3))
  }

  return (
    <div className="h-full bg-[#3a1c1a] flex flex-col">
      <div className="p-4 border-b border-[#e8ddd4]">
        <h2 className="text-lg font-bold text-[#f5f5f0] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#f5f5f0]" />
          Events ({events.length})
        </h2>
      </div>

      <div className="p-4 h-full overflow-y-auto">
        <div className="space-y-4">
          {chunkedEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#f5f1eb]">No events available yet.</p>
            </div>
          ) : (
            chunkedEvents.map((eventRow, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-3 gap-4">
                {eventRow.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventSelect(event)}
                    className="bg-[#452b1f] rounded-lg p-3 cursor-pointer hover:bg-[#4a2c2a]/80 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#f5f1eb]" />
                        <span className="text-sm font-bold text-[#f5f1eb]">{event.city || event.location}</span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(event.status)}`}
                      >
                        {isContributor ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditEvent(event)
                              }}
                              className="w-3 h-3 text-[#421f17] hover:text-[#d4a88a] transition-colors"
                              title="Edit Event"
                            >
                              <Edit className="w-full h-full" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteEvent(event)
                              }}
                              className="w-3 h-3 text-[#421f17] hover:text-red-600 transition-colors"
                              title="Delete Event"
                            >
                              <Trash2 className="w-full h-full" />
                            </button>
                          </>
                        ) : (
                          <>
                            {getStatusIcon(event.status)}
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </>
                        )}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-[#f5f1eb] font-bold line-clamp-1">{event.title}</p>
                      <p className="text-xs text-[#f5f1eb] italic">Theme: {event.theme}</p>
                      <p className="text-xs text-[#f5f1eb] italic">Date: {event.schedule || event.date || "TBD"}</p>
                    </div>
                  </div>
                ))}

                {eventRow.length < 3 &&
                  Array.from({ length: 3 - eventRow.length }).map((_, emptyIndex) => (
                    <div
                      key={`empty-${rowIndex}-${emptyIndex}`}
                      className="bg-[#8b4513]/20 border border-[#e8ddd4] rounded-lg p-3 opacity-50"
                    >
                      <div className="text-center text-[#f5f1eb] text-sm">
                        <Calendar className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <p>Event slot</p>
                      </div>
                    </div>
                  ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

