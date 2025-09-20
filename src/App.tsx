"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle,
  AlertCircle,
  X,
  Calendar,
  MapPin,
  MapIcon,
  Users,
} from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Textarea } from "./components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./components/ui/dropdown-menu"
import { useForm } from "react-hook-form"
import { useAuth } from "./hooks/useAuth"
import UserMenu from "./components/auth/UserMenu"
import { supabase } from "./lib/supabase/client"
import { LinkPreview, LinkPreviewSkeleton } from "./components/LinkPreview"
import { useLinkPreview } from "./hooks/useLinkPreview"
import { MainLayout } from "./components/layout/MainLayout"
import "./App.css"

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EspressoEvent {
  id: string
  title: string
  location: string
  city: string
  coordinates: [number, number]
  theme: string
  status: "upcoming" | "ongoing" | "ended"
  schedule: string
  date?: string
  guests: string[]
  host: string
  description: string
  organizer?: string
  participants?: string
  publicationLink?: string
}

interface AddEventFormData {
  theme: string
  location: string
  organizer: string
  latitude: string
  longitude: string
  date: string
  guests: string
  status: "upcoming" | "ongoing" | "ended"
  topic: string
  publicationLink: string
}

interface GeocodingResult {
  display_name: string
  lat: string
  lon: string
}

interface Publication {
  id: string
  type: "tweet" | "article" | "medium"
  title: string
  url: string
  preview: string
  eventId?: string
}

interface Topic {
  id: string
  theme: string
  description: string
  eventId: string
}

const createCoffeeIcon = (status: string) => {
  const icons = {
    upcoming: '/2139cfd7-8158-41a1-9e56-24e91f29b6d6/Upcoming+Event.png',
    ongoing: '/437403cf-b427-4070-bac2-ea1f4820271f/Ongoing+Event.png',
    ended: '/32c0c727-08b6-44f6-90b9-d800f97eb302/Ended+Event.png',
  };
  return new L.Icon({
    iconUrl: icons[status as keyof typeof icons] || icons.ended,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

const geocodeLocation = async (query: string): Promise<GeocodingResult[]> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
    )
    return await response.json()
  } catch (error) {
    console.error("Geocoding error:", error)
    return []
  }
}

const AddEventForm = ({
  onSubmit,
  mapCoordinates,
}: {
  onSubmit: (data: AddEventFormData) => void
  mapCoordinates?: { lat: number; lng: number }
}) => {
  const form = useForm<AddEventFormData>({
    defaultValues: {
      theme: "",
      location: "",
      organizer: "",
      latitude: "",
      longitude: "",
      date: "",
      guests: "",
      status: "upcoming",
      topic: "",
      publicationLink: "",
    },
  })


  const publicationLink = form.watch("publicationLink")
  const { preview: linkPreview, loading: linkLoading } = useLinkPreview(publicationLink || null)

  // Update coordinates when map is clicked
  useEffect(() => {
    if (mapCoordinates) {
      form.setValue("latitude", mapCoordinates.lat.toFixed(6))
      form.setValue("longitude", mapCoordinates.lng.toFixed(6))
    }
  }, [mapCoordinates, form])

  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleLocationSearch = async (query: string) => {
    if (query.length > 2) {
      const results = await geocodeLocation(query)
      setSearchResults(results)
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }

  const selectLocation = (result: GeocodingResult) => {
    form.setValue("location", result.display_name)
    form.setValue("latitude", result.lat)
    form.setValue("longitude", result.lon)
    setShowResults(false)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2 max-h-[60vh] overflow-y-auto px-1"
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#421f17]">Theme/Event Type *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Coffee Tasting, Workshop, Competition"
                  className="bg-[#fbeee4] border-[#eacaae] focus:ring-[#eacaae] text-[#421f17] text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#421f17]">Location *</FormLabel>
              <FormControl>
                <div>
                  <Input
                    placeholder="Search for a location or click on map"
                    className="bg-[#fbeee4] border-[#eacaae] focus:ring-[#eacaae] text-[#421f17] text-sm"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      handleLocationSearch(e.target.value)
                    }}
                  />
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute z-[2100] bg-[#fbeee4] border border-gray-200 rounded shadow w-full mt-1 max-h-40 overflow-auto">
                      {searchResults.map((result, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 hover:bg-[#f5f1eb]/20 cursor-pointer text-sm"
                          onClick={() => selectLocation(result)}
                        >
                          {result.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-[#421f17]">Latitude</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Click on map"
                    className="bg-[#fbeee4] border-[#eacaae] text-[#421f17] text-xs"
                    readOnly
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-[#421f17]">Longitude</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Click on map"
                    className="bg-[#fbeee4] border-[#eacaae] text-[#421f17] text-xs"
                    readOnly
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="organizer"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#421f17]">Organizer/Host *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Espresso Foundation, Coffee Guild"
                  className="bg-[#fbeee4] border-[#eacaae] focus:ring-[#eacaae] text-[#421f17] text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#421f17]">Event Date *</FormLabel>
              <FormControl>
                <Input type="date" className="bg-[#fbeee4] border-[#eacaae] focus:ring-[#f5f1eb] text-sm" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="guests"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#421f17]">Guests/Audience</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., John Doe, Jane Smith or Open to Public"
                  className="bg-[#fbeee4] border-[#eacaae] focus:ring-[#eacaae] text-[#421f17] text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#421f17]">Event Status *</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-[#fbeee4] border-[#eacaae] focus:ring-[#eacaae] text-[#421f17] text-sm">
                    <SelectValue placeholder="Select event status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#fbeee4] border-[#eacaae]">
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#421f17]">Topic/Discussion Points</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What will be discussed or covered in this event?"
                  className="bg-[#fbeee4] border-[#eacaae] focus:ring-[#eacaae] text-[#421f17] text-sm h-20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="publicationLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#421f17]">Publication Link (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://twitter.com/... or https://medium.com/..."
                  className="bg-[#fbeee4] border-[#eacaae] focus:ring-[#eacaae] text-[#421f17] text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {publicationLink && (
                <div className="mt-2">
                  {linkLoading ? (
                    <LinkPreviewSkeleton />
                  ) : linkPreview ? (
                    <LinkPreview preview={linkPreview} showFullPreview={false} />
                  ) : null}
                </div>
              )}
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-[#fbeee4] text-[#421f17] hover:bg-[#f5f5f0] border border-[#eacaae] mt-2" onClick={() => console.log('Add Event button clicked')}>
          Add Event
        </Button>
      </form>
    </Form>
  )
}

// Map Click Handler Component - fixes lint ID: 757ac6eb-85cc-4647-8718-2c2a2e041c71
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

const MapUpdater = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

// Notification Component
const Notification = ({
  message,
  type,
  onClose,
}: {
  message: string
  type: "success" | "error" | "info"
  onClose: () => void
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
  const Icon = type === "success" ? CheckCircle : AlertCircle

  return (
    <div
      className={`fixed top-4 right-4 z-[3000] flex items-center gap-2 px-4 py-3 rounded-lg text-white shadow-lg ${bgColor} animate-slide-in`}
    >
      <Icon className="w-5 h-5" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}


function App() {
  const { user, profile, isContributor, loading: authLoading } = useAuth()

  const [selectedEvent, setSelectedEvent] = useState<EspressoEvent | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795])
  const [mapZoom, setMapZoom] = useState(4)
  const [basemap, setBasemap] = useState("openstreetmap")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchSuggestions, setSearchSuggestions] = useState<GeocodingResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [eventSearchResults, setEventSearchResults] = useState<EspressoEvent[]>([])
  const [events, setEvents] = useState<EspressoEvent[]>([])
  const [publications, setPublications] = useState<Publication[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [mapClickCoordinates, setMapClickCoordinates] = useState<{ lat: number; lng: number } | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)


  // Handle default event selection
  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      // Default to first event if no event is selected
      const defaultEvent = events[0]
      setSelectedEvent(defaultEvent)
    }
  }, [events, selectedEvent])

  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type })
  }

  useEffect(() => {
    if (!authLoading) {
      loadEvents()
    }
  }, [authLoading])

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles:created_by (
            display_name,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading events:", error)
        return
      }

      const supabaseEvents: EspressoEvent[] = data.map((event) => ({
        id: event.id,
        title: event.title,
        location: event.location,
        city: event.location.split(",")[0] || event.location,
        coordinates: [event.latitude, event.longitude] as [number, number],
        theme: event.title,
        status: event.event_type,
        schedule: new Date(event.event_date).toLocaleDateString(),
        date: event.event_date,
        guests: [],
        host: event.profiles?.display_name || event.profiles?.email || "Unknown",
        description: event.description || "",
        organizer: event.profiles?.display_name || event.profiles?.email || "Unknown",
        publicationLink: event.publication_links?.[0]?.url || "",
      }))

      setEvents(supabaseEvents)
    } catch (error) {
      console.error("Error loading events:", error)
    }
  }

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setMapCenter([latitude, longitude])
          setMapZoom(12)
          showNotification("Location found successfully!", "success")
        },
        (error) => {
          console.error("Error getting location:", error)
          showNotification("Unable to get your location. Please check your browser permissions.", "error")
        },
      )
    } else {
      showNotification("Geolocation is not supported by this browser.", "error")
    }
  }

  const handleCombinedSearch = async () => {
    if (searchQuery.length > 2) {
      try {
        // Search for locations
        const locationResults = await geocodeLocation(searchQuery)
        if (locationResults.length > 0) {
          const result = locationResults[0]
          setMapCenter([Number.parseFloat(result.lat), Number.parseFloat(result.lon)])
          setMapZoom(13)
        }
        
        // Search for events
        const eventResults = events.filter(event => 
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.theme.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setEventSearchResults(eventResults)
        
        // Close search and show results
        setIsSearchExpanded(false)
        setShowSuggestions(false)
        setSearchSuggestions([])
        
        if (eventResults.length > 0) {
          showNotification(`Found ${eventResults.length} event(s) matching "${searchQuery}"`, "info")
        }
      } catch (error) {
        console.error("Combined search error:", error)
      }
    }
  }

  const handleSearchInputChange = async (value: string) => {
    setSearchQuery(value)
    
    if (value.length > 2) {
      try {
        // Get location suggestions
        const locationResults = await geocodeLocation(value)
        setSearchSuggestions(locationResults)
        setShowSuggestions(locationResults.length > 0)
        
        // Filter events in real-time
        const eventResults = events.filter(event => 
          event.title.toLowerCase().includes(value.toLowerCase()) ||
          event.location.toLowerCase().includes(value.toLowerCase()) ||
          event.theme.toLowerCase().includes(value.toLowerCase())
        )
        setEventSearchResults(eventResults)
      } catch (error) {
        console.error("Search suggestions error:", error)
        setSearchSuggestions([])
        setShowSuggestions(false)
      }
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
      setEventSearchResults([])
    }
  }


  const basemaps = {
    openstreetmap: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  }

  const handleEventSelect = (event: EspressoEvent) => {
    setSelectedEvent(event)
    setMapCenter(event.coordinates)
    setMapZoom(12)
  }

  const handleMapClick = (lat: number, lng: number) => {
    setMapClickCoordinates({ lat, lng })
    // showNotification(`Coordinates selected: ${lat.toFixed(6)}, ${lng.toFixed(6)}`, "info")
  }

  const handleAddEvent = async (data: AddEventFormData) => {
    console.log('handleAddEvent called with data:', data)
    if (!isContributor) {
      showNotification("Only contributors can add events. Please sign up as a contributor.", "error")
      return
    }

    if (!user) {
      showNotification("Please sign in to add events.", "error")
      return
    }

    try {
      console.log('Inserting event data:', {
        title: data.theme,
        description: data.topic,
        location: data.location,
        latitude: Number.parseFloat(data.latitude),
        longitude: Number.parseFloat(data.longitude),
        event_date: data.date,
        event_type: data.status,
        publication_links: data.publicationLink ? [{ url: data.publicationLink }] : [],
        created_by: user.id,
      })

      console.log('About to call supabase.insert...')
      
      // Test de connexion Supabase
      console.log('Testing Supabase connection...')
      const { data: testData, error: testError } = await supabase.from('events').select('id').limit(1)
      console.log('Supabase connection test:', { testData, testError })
      
      const { data: eventData, error } = await supabase
        .from("events")
        .insert({
          title: data.theme,
          description: data.topic,
          location: data.location,
          latitude: Number.parseFloat(data.latitude),
          longitude: Number.parseFloat(data.longitude),
          event_date: data.date,
          event_type: data.status,
          publication_links: data.publicationLink ? [{ url: data.publicationLink }] : [],
          created_by: user.id,
        })
        .select()
        .single()

      console.log('Supabase call completed')
      console.log('Supabase insert result:', { eventData, error })

      if (error) {
        console.error("Error saving event:", error)
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        showNotification("Failed to save event. Please try again.", "error")
        return
      }

      console.log('Event saved successfully:', eventData)

      console.log('Event saved successfully:', eventData)

      console.log('Event saved successfully:', eventData)

      const newEvent: EspressoEvent = {
        id: eventData.id,
        title: data.theme,
        theme: data.theme,
        location: data.location,
        city: data.location.split(",")[0] || data.location,
        coordinates: [Number.parseFloat(data.latitude), Number.parseFloat(data.longitude)],
        status: data.status,
        schedule: data.date,
        guests: data.guests.split(",").map((g) => g.trim()),
        host: profile?.display_name || user.email || "Unknown",
        description: data.topic,
        organizer: profile?.display_name || user.email || "Unknown",
        publicationLink: data.publicationLink,
      }

      setEvents((prevEvents) => [...prevEvents, newEvent])

      if (data.topic) {
        const newTopic: Topic = {
          id: `topic-${Date.now()}`,
          theme: data.theme,
          description: data.topic,
          eventId: newEvent.id,
        }
        setTopics([...topics, newTopic])
      }

      if (data.publicationLink) {
        const pubType = data.publicationLink.includes("twitter.com")
          ? "tweet"
          : data.publicationLink.includes("medium.com")
            ? "medium"
            : "article"
        const newPublication: Publication = {
          id: `pub-${Date.now()}`,
          type: pubType,
          title: data.theme,
          url: data.publicationLink,
          preview: `Event: ${data.theme}`,
          eventId: newEvent.id,
        }
        setPublications([...publications, newPublication])
      }

      showNotification("Event added successfully!", "success")
      setDialogOpen(false)
      setMapCenter(newEvent.coordinates)
      setMapZoom(12)
    } catch (error) {
      console.error("Error adding event:", error)
      showNotification("Failed to add event. Please try again.", "error")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "status-upcoming"
      case "ongoing":
        return "status-ongoing"
      case "ended":
        return "status-ended"
      default:
        return "status-ended"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <img src="/2139cfd7-8158-41a1-9e56-24e91f29b6d6/Upcoming+Event.png" alt="Upcoming" className="w-4 h-4" />
      case "ongoing":
        return <img src="/437403cf-b427-4070-bac2-ea1f4820271f/Ongoing+Event.png" alt="Ongoing" className="w-4 h-4" />
      case "ended":
        return <img src="/32c0c727-08b6-44f6-90b9-d800f97eb302/Ended+Event.png" alt="Ended" className="w-4 h-4" />
      default:
        return <img src="/437403cf-b427-4070-bac2-ea1f4820271f/Ongoing+Event.png" alt="Ongoing" className="w-4 h-4" />
    }
  }

  return (
    <MainLayout
      topics={topics}
      publications={publications}
      events={events}
      selectedEvent={selectedEvent}
      onEventSelect={handleEventSelect}
      getStatusColor={getStatusColor}
      getStatusIcon={getStatusIcon}
    >
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div className="map-overlay" style={{ top: "16px", right: "16px", zIndex: 1150 }}>
        <div className="flex gap-2">
          <UserMenu />

          {/* Collapsible Search Bar */}
          <div className="relative ml-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="bg-[#fbeee4] border-[#eacaae] text-[#421f17] hover:bg-[#f5f5f0]"
              aria-label="Toggle Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Button>
            
            {isSearchExpanded && (
              <div className="absolute top-full right-0 mt-2 z-[1300] w-80">
                <div className="bg-white border border-[#eacaae] rounded-lg shadow-lg p-4 bg-[#fbeee4]/50">
                  <div className="space-y-3">
                    <Input
                      placeholder="Search for places or events..."
                      value={searchQuery}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleCombinedSearch()}
                      className="w-full"
                    />
                    
                    {/* Location Suggestions */}
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border border-[#eacaae] rounded-md bg-[#f5f5f0]">
                        <div className="px-3 py-2 text-xs font-medium text-[#421f17] bg-[#fbeee4]">🏠 Places</div>
                        {searchSuggestions.slice(0, 3).map((suggestion, index) => (
                          <div
                            key={`location-${index}`}
                            className="px-3 py-2 cursor-pointer hover:bg-[#fbeee4] border-b last:border-b-0 text-sm"
                            onClick={() => {
                              setMapCenter([Number.parseFloat(suggestion.lat), Number.parseFloat(suggestion.lon)])
                              setMapZoom(13)
                              setIsSearchExpanded(false)
                              setShowSuggestions(false)
                            }}
                          >
                            <div className="font-medium text-[#421f17]">{suggestion.display_name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Event Results */}
                    {eventSearchResults.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border border-[#eacaae] rounded-md bg-[#f5f5f0]">
                        <div className="px-3 py-2 text-xs font-medium text-[#421f17] bg-[#fbeee4]">🎯 Events ({eventSearchResults.length})</div>
                        {eventSearchResults.slice(0, 3).map((event) => (
                          <div
                            key={`event-${event.id}`}
                            className="px-3 py-2 cursor-pointer hover:bg-[#fbeee4] border-b last:border-b-0 text-sm"
                            onClick={() => {
                              handleEventSelect(event)
                              setIsSearchExpanded(false)
                            }}
                          >
                            <div className="font-medium text-[#421f17]">{event.title}</div>
                            <div className="text-[#421f17]">{event.location}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2 border-t border-[#eacaae]">
                      <Button 
                        size="sm" 
                        onClick={handleCombinedSearch}
                        className="flex-1 bg-[#4a2c2a] hover:bg-[#4a2c2a]/80 text-[#f5f1eb]"
                      >
                        Search
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setIsSearchExpanded(false)}
                        className="flex-1 bg-[#4a2c2a] hover:bg-[#4a2c2a]/80 text-[#f5f1eb] border border-[#eacaae] hover:border-[#d4a88a] transition-colors"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isContributor && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-[#fbeee4] border-[#eacaae] text-[#421f17] hover:bg-[#f5f5f0]"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full dialog-overlay max-h-[85vh] bg-[#fbeee4]" style={{ zIndex: 2000 }}>
                <DialogHeader>
                  <DialogTitle className="text-[#421f17]">Add Espresso Event</DialogTitle>
                </DialogHeader>
                <AddEventForm onSubmit={handleAddEvent} mapCoordinates={mapClickCoordinates} />
              </DialogContent>
            </Dialog>
          )}

          <Button
            size="sm"
            variant="outline"
            className="text-[#f5f1eb] border-[#eacaae] hover:bg-[#f5f1eb]/20 bg-[#4a2c2a]"
            onClick={handleLocate}
          >
            <MapPin className="w-4 h-4 mr-1" />
            Locate
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-[#f5f1eb] border-[#eacaae] hover:bg-[#f5f1eb]/20 bg-[#4a2c2a] flex items-center"
              >
                <MapIcon className="w-4 h-4 mr-1" />
                Switch Map
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[1200] bg-[#fbeee4] border-[#eacaae]">
              {Object.keys(basemaps).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setBasemap(key)}
                  className={basemap === key ? "font-bold text-[#421f17] bg-[#eacaae]" : "text-[#421f17] hover:bg-[#f5f5f0]"}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="map-overlay legend-panel">
        <h3 className="text-sm font-semibold text-[#421f17] mb-3">Event Status</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3">
            <img src="/2139cfd7-8158-41a1-9e56-24e91f29b6d6/Upcoming+Event.png" alt="Upcoming" className="w-7 h-7" />
            <span className="text-[#421f17] font-medium">Upcoming</span>
          </div>
          <div className="flex items-center gap-3">
            <img src="/437403cf-b427-4070-bac2-ea1f4820271f/Ongoing+Event.png" alt="Ongoing" className="w-7 h-7" />
            <span className="text-[#421f17] font-medium">Ongoing</span>
          </div>
          <div className="flex items-center gap-3">
            <img src="/32c0c727-08b6-44f6-90b9-d800f97eb302/Ended+Event.png" alt="Ended" className="w-7 h-7" />
            <span className="text-[#421f17] font-medium">Ended</span>
          </div>
        </div>
      </div>
      
      <div className="map-container relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="h-full w-full"
          style={{ zIndex: 1 }}
        >
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          {isContributor && <MapClickHandler onMapClick={handleMapClick} />}
          <TileLayer
            url={basemaps[basemap as keyof typeof basemaps]}
            attribution="&copy; OpenStreetMap contributors"
          />
          {events.map((event) => (
            <Marker key={event.id} position={event.coordinates} icon={createCoffeeIcon(event.status)}>
              <Popup className="custom-popup">
                <div className="p-2 min-w-[220px] max-w-[280px]">
                  <h3 className="font-bold text-[#421f17] mb-2 text-center">Details of the event</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#421f17] mt-0.5 flex-shrink-0" />
                      <span className="text-[#421f17] text-xs">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#421f17] flex-shrink-0" />
                      <span className="text-[#421f17] text-xs">Organizer: {event.host || event.organizer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#421f17] flex-shrink-0" />
                      <span className="text-[#421f17] text-xs">Date: {event.schedule || event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#421f17] flex-shrink-0" />
                      <span>
                        Guests:{" "}
                        {Array.isArray(event.guests) ? event.guests.join(", ") : event.guests || "Open to Public"}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        {/* Bande ombrée transparente en bas de la carte */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-[5]"></div>
        {/* Logo Espresso dans le coin inférieur gauche */}
        <div className="absolute bottom-4 left-4 z-[10]">
          <img 
            src="/177dfa6e-81d8-462a-93e1-59040f268c80/Logo+Espresso.png" 
            alt="Espresso Logo" 
            className="w-36 h-20 opacity-80 hover:opacity-100 transition-opacity duration-300"
          />
        </div>
      </div>
    </MainLayout>
  )
}

export default App
