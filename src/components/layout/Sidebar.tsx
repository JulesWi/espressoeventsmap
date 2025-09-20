import type React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

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
    <div className="w-full h-full bg-[#4a2c2a] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[#e8ddd4]">
        <h2 className="text-lg font-bold text-[#f5f5f0] mb-2">Espresso Hub</h2>
        <p className="text-sm text-[#e8ddd4]">Coffee community insights</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="photos" className="h-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#8b4513] mx-4 mt-4">
            <TabsTrigger
              value="photos"
              className="text-[#f5f5f0] data-[state=active]:bg-[#f5f5f0] data-[state=active]:text-[#4a2c2a] text-xs"
            >
              📸 Photos
            </TabsTrigger>
            <TabsTrigger
              value="topics"
              className="text-[#f5f5f0] data-[state=active]:bg-[#f5f5f0] data-[state=active]:text-[#4a2c2a] text-xs"
            >
              💬 Topics
            </TabsTrigger>
            <TabsTrigger
              value="publications"
              className="text-[#f5f5f0] data-[state=active]:bg-[#f5f5f0] data-[state=active]:text-[#4a2c2a] text-xs"
            >
              📰 Links
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="p-4 h-full">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#f5f5f0] mb-3">Venue Photos</h3>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-[#e8ddd4] rounded-lg border border-[#8b4513] flex items-center justify-center"
                  >
                    <span className="text-[#4a2c2a] text-xs">Venue {i}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-[#8b4513] rounded-lg">
                <p className="text-xs text-[#f5f5f0]">
                  Photo placeholders for coffee venues and event locations. Upload feature coming soon.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="topics" className="p-4 h-full">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#f5f5f0] mb-3">Discussion Topics</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTopics.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-[#e8ddd4]">
                      {selectedEvent ? `No topics for "${selectedEvent.title}".` : "No discussion topics yet."}
                    </p>
                  </div>
                ) : (
                  filteredTopics.map((topic) => (
                    <div key={topic.id} className="p-3 bg-[#8b4513] rounded-lg border border-[#e8ddd4]">
                      <h4 className="font-medium text-[#f5f5f0] text-sm mb-1">{topic.theme}</h4>
                      <p className="text-xs text-[#e8ddd4]">{topic.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="publications" className="p-4 h-full">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#f5f5f0] mb-3">Related Publications</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPublications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-[#e8ddd4]">
                      {selectedEvent ? `No publications for "${selectedEvent.title}".` : "No publications yet."}
                    </p>
                  </div>
                ) : (
                  filteredPublications.map((pub) => (
                    <div
                      key={pub.id}
                      className="p-3 bg-[#8b4513] rounded-lg border border-[#e8ddd4] hover:bg-[#8b4513]/80 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-[#f5f5f0] text-sm mb-1">{pub.title}</h4>
                          <p className="text-xs text-[#e8ddd4] mb-2">Type: {pub.type}</p>
                        </div>
                      </div>
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-xs text-[#f5f5f0] bg-[#4a2c2a] px-2 py-1 rounded hover:bg-[#4a2c2a]/80 transition-colors"
                      >
                        View →
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
