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
    <div className="w-full h-full bg-[#4a2c2a] flex flex-col">
      <div className="p-4 border-b border-[#e8ddd4]">
        <h2 className="text-lg font-bold text-[#f5f5f0] mb-2">Espresso Hub</h2>
        <p className="text-sm text-[#e8ddd4]">Coffee community insights</p>
      </div>

      <div className="flex-1">
        <Tabs defaultValue="photos" className="h-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#8b4513] mt-4">
            <TabsTrigger
              value="photos"
              className="text-[#f5f5f0] data-[state=active]:bg-[#f5f5f0] data-[state=active]:text-[#4a2c2a] text-xs"
            >
               Photos
            </TabsTrigger>
            <TabsTrigger
              value="topics"
              className="text-[#f5f5f0] data-[state=active]:bg-[#f5f5f0] data-[state=active]:text-[#4a2c2a] text-xs"
            >
               Topics
            </TabsTrigger>
            <TabsTrigger
              value="publications"
              className="text-[#f5f5f0] data-[state=active]:bg-[#f5f5f0] data-[state=active]:text-[#4a2c2a] text-xs"
            >
               Publications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="m-0 p-4 h-full">
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="w-full h-64 bg-[#fbeee4] border-2 border-dashed border-[#eacaae] rounded-lg flex flex-col items-center justify-center">
                  <div className="text-6xl mb-4"></div>
                  <p className="text-lg font-medium text-[#421f17]">Event Photos</p>
                  <p className="text-sm text-[#8b7355] mt-2">Photos will be displayed here</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="topics" className="m-0 p-4 h-full">
            <div className="space-y-3">
              {filteredTopics.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#e8ddd4]">No topics available yet.</p>
                </div>
              ) : (
                filteredTopics.map((topic) => (
                  <div key={topic.id} className="bg-[#8b4513] p-3 rounded-lg">
                    <h3 className="font-medium text-[#f5f5f0] mb-1">{topic.theme}</h3>
                    <p className="text-sm text-[#e8ddd4]">{topic.description}</p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="publications" className="m-0 p-4 h-full">
            <div className="space-y-3">
              {filteredPublications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#e8ddd4]">No publications available yet.</p>
                </div>
              ) : (
                filteredPublications.map((pub) => (
                  <div key={pub.id} className="bg-[#8b4513] p-3 rounded-lg">
                    <h3 className="font-medium text-[#f5f5f0] mb-1">{pub.title}</h3>
                    <p className="text-sm text-[#e8ddd4] mb-2">{pub.type}</p>
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#fbeee4] hover:underline text-sm"
                    >
                      View Publication 
                    </a>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

