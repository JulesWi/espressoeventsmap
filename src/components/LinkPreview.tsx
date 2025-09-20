import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { ExternalLink, Globe, Twitter, FileText, Clock } from "lucide-react"
import type { LinkPreviewData } from "../lib/linkPreview"

interface LinkPreviewProps {
  preview: LinkPreviewData
  className?: string
  showFullPreview?: boolean
}

export function LinkPreview({ preview, className = "", showFullPreview = true }: LinkPreviewProps) {
  const getIcon = () => {
    switch (preview.link_type) {
      case "twitter":
        return <Twitter className="w-4 h-4 text-blue-400" />
      case "medium":
        return <FileText className="w-4 h-4 text-green-600" />
      case "article":
        return <FileText className="w-4 h-4 text-blue-600" />
      default:
        return <Globe className="w-4 h-4 text-gray-400" />
    }
  }

  const getBadgeColor = () => {
    switch (preview.link_type) {
      case "twitter":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "medium":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "article":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  if (!showFullPreview) {
    return (
      <div className={`flex items-center gap-2 p-2 bg-[#4a2c2a]/50 border border-[#f5f1eb]/20 rounded ${className}`}>
        {getIcon()}
        <span className="text-xs text-[#f5f1eb] truncate flex-1">
          {preview.title || preview.site_name || "Link Preview"}
        </span>
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild>
          <a href={preview.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      </div>
    )
  }

  return (
    <Card className={`bg-[#4a2c2a] border-[#f5f1eb]/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Image */}
          {preview.image_url && (
            <div className="flex-shrink-0">
              <img
                src={preview.image_url || "/placeholder.svg"}
                alt=""
                className="w-16 h-16 object-cover rounded border border-[#f5f1eb]/20"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                {getIcon()}
                <span className={`text-xs px-2 py-1 rounded border ${getBadgeColor()}`}>
                  {preview.link_type.toUpperCase()}
                </span>
              </div>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 flex-shrink-0" asChild>
                <a href={preview.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>

            {/* Title */}
            {preview.title && <h4 className="font-medium text-[#f5f1eb] text-sm mb-1 line-clamp-2">{preview.title}</h4>}

            {/* Description */}
            {preview.description && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{preview.description}</p>}

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {preview.site_name && (
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>{preview.site_name}</span>
                </div>
              )}

              {preview.published_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(preview.published_time).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function LinkPreviewSkeleton({ className = "" }: { className?: string }) {
  return (
    <Card className={`bg-[#4a2c2a] border-[#f5f1eb]/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="w-16 h-16 bg-gray-600 rounded animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-600 rounded animate-pulse" />
              <div className="w-16 h-4 bg-gray-600 rounded animate-pulse" />
            </div>
            <div className="w-3/4 h-4 bg-gray-600 rounded animate-pulse" />
            <div className="w-full h-3 bg-gray-600 rounded animate-pulse" />
            <div className="w-1/2 h-3 bg-gray-600 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
