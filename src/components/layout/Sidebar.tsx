import React from "react"
import { MessageCircle, ExternalLink, ScrollText } from "lucide-react"

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
    <div className="w-full h-80  bg-[#421f17] z-2000 flex flex-col">
      <div className="p-4">
        <h2 className="text-lg font-bold text-[#f5f5f0] mb-2 flex items-center gap-2"><ScrollText className="w-5 h-5" />"DETAILS OF EVENTS"</h2>
        <p className="text-sm text-[#e8ddd4]">{selectedEvent ? `Happy to see you at ${selectedEvent.location}` : "Coffee community insights"}</p>
      </div>

      <div className="flex-1 p-4 ">
        <div className="space-y-4">
          {/* Topics Section */}
          <div className="bg-[#fbeee4] rounded-lg p-3">
            <h3 className="font-medium text-[#421f17] mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Topics to Discuss
            </h3>
            <div className="space-y-2">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <div key={topic.id} className="bg-white/50 rounded p-2 hover:bg-[#30150d] transition-colors">
                    <p className="text-sm font-medium text-[#421f17]">{topic.theme}</p>
                    <p className="text-xs text-[#8b7355] mt-1">{topic.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#8b7355]">No topics available yet.</p>
              )}
            </div>
          </div>

          {/* Publications Section */}
          <div className="bg-[#fbeee4] rounded-lg p-3">
            <h3 className="font-medium text-[#421f17] mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Related Publications
            </h3>
            <div className="space-y-2">
              {filteredPublications.length > 0 ? (
                filteredPublications.map((pub) => (
                  <a
                    key={pub.id}
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white/50 rounded p-2 hover:bg-[#30150d] transition-colors"
                  >
                    <p className="text-sm font-medium text-[#421f17]">{pub.title}</p>
                    <p className="text-xs text-[#8b7355]">{pub.type}</p>
                  </a>
                ))
              ) : (
                <p className="text-sm text-[#8b7355]">No publications available yet.</p>
              )}
            </div>
          </div>


          <div className="w-full bg-[#fbeee4] rounded-lg p-3">
            <h3 className="font-medium text-[#421f17] mb-2">Event Photos</h3>
            {selectedEvent?.imageUrl ? (
              <img
                src={selectedEvent.imageUrl}
                alt="Event Photo"
                className="w-full h-32 object-cover rounded"
              />
            ) : (
              <div className="h-32 border-2 border-dashed border-[#eacaae] rounded-lg flex flex-col items-center justify-center">
                <p className="text-sm text-[#8b7355]">Photos will be displayed here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
