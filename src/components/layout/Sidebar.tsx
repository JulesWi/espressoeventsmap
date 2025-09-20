import React from "react"

interface Topic {
  id: string
  theme: string
  description: string
  eventId: string
}

interface Publication {
  id: string
  title: string
  type: string
  url: string
  eventId: string
}

interface SidebarProps {
  topics: Topic[]
  publications: Publication[]
  selectedEvent: any
}

export const Sidebar: React.FC<SidebarProps> = ({ topics, publications, selectedEvent }) => {
  const filteredTopics = selectedEvent ? topics.filter((topic) => topic.eventId === selectedEvent.id) : topics

  const filteredPublications = selectedEvent
    ? publications.filter((pub) => pub.eventId === selectedEvent.id)
    : publications

  return (
    <div className="w-full h-full bg-[#4a2c2a] flex flex-col">
      <div className="p-4 border-b border-[#e8ddd4]">
        <h2 className="text-lg font-bold text-[#f5f5f0] mb-2">Espresso Hub</h2>
        <p className="text-sm text-[#e8ddd4]">Coffee community insights</p>
      </div>

      <div className="flex-1 p-4">
        <div className="space-y-4">
          <div className="w-full h-64 bg-[#fbeee4] border-2 border-dashed border-[#eacaae] rounded-lg flex flex-col items-center justify-center relative">
            <div className="text-6xl mb-4"></div>
            <p className="text-lg font-medium text-[#421f17]">Event Photos</p>
            <p className="text-sm text-[#8b7355] mt-2">Photos will be displayed here</p>
            
            {selectedEvent && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 rounded-b-lg">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-sm">{selectedEvent.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#8b4513]">
                    {selectedEvent.status || "Upcoming"}
                  </span>
                </div>
                <div className="text-xs text-gray-300 space-y-1">
                  <p>Theme: {selectedEvent.theme}</p>
                  <p>Location: {selectedEvent.city || selectedEvent.location}</p>
                  <p>Date: {selectedEvent.schedule || selectedEvent.date || "TBD"}</p>
                </div>
                
                {filteredTopics.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium mb-1">Topics:</p>
                    <div className="flex flex-wrap gap-1">
                      {filteredTopics.slice(0, 2).map((topic) => (
                        <span key={topic.id} className="text-xs bg-[#8b4513]/50 px-2 py-1 rounded">
                          {topic.theme}
                        </span>
                      ))}
                      {filteredTopics.length > 2 && (
                        <span className="text-xs text-gray-400">+{filteredTopics.length - 2} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
