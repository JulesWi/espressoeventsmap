import { supabase } from "./supabase/client"

export interface LinkPreviewData {
  url: string
  title?: string
  description?: string
  image_url?: string
  site_name?: string
  published_time?: string
  link_type: "article" | "twitter" | "medium" | "general"
}

// CORS proxy for fetching external content
const CORS_PROXY = "https://api.allorigins.win/get?url="

export class LinkPreviewService {
  static async fetchLinkPreview(url: string): Promise<LinkPreviewData | null> {
    try {
      // First check if we have cached data
      const cached = await this.getCachedPreview(url)
      if (cached) {
        return cached
      }

      // Determine link type
      const linkType = this.determineLinkType(url)

      // Fetch and parse the content
      const previewData = await this.parseUrl(url, linkType)

      // Cache the result
      if (previewData) {
        await this.cachePreview(previewData)
      }

      return previewData
    } catch (error) {
      console.error("Error fetching link preview:", error)
      return null
    }
  }

  private static async getCachedPreview(url: string): Promise<LinkPreviewData | null> {
    try {
      const { data, error } = await supabase.from("link_previews").select("*").eq("url", url).single()

      if (error || !data) {
        return null
      }

      return {
        url: data.url,
        title: data.title || undefined,
        description: data.description || undefined,
        image_url: data.image_url || undefined,
        site_name: data.site_name || undefined,
        published_time: data.published_time || undefined,
        link_type: data.link_type,
      }
    } catch (error) {
      console.error("Error getting cached preview:", error)
      return null
    }
  }

  private static async cachePreview(previewData: LinkPreviewData): Promise<void> {
    try {
      const { error } = await supabase.from("link_previews").upsert({
        url: previewData.url,
        title: previewData.title,
        description: previewData.description,
        image_url: previewData.image_url,
        site_name: previewData.site_name,
        published_time: previewData.published_time,
        link_type: previewData.link_type,
      })

      if (error) {
        console.error("Error caching preview:", error)
      }
    } catch (error) {
      console.error("Error caching preview:", error)
    }
  }

  private static determineLinkType(url: string): "article" | "twitter" | "medium" | "general" {
    if (url.includes("twitter.com") || url.includes("x.com")) {
      return "twitter"
    }
    if (url.includes("medium.com")) {
      return "medium"
    }
    if (url.includes("blog") || url.includes("article") || url.includes("news")) {
      return "article"
    }
    return "general"
  }

  private static async parseUrl(url: string, linkType: string): Promise<LinkPreviewData | null> {
    try {
      // Use CORS proxy to fetch the content
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const html = data.contents

      if (!html) {
        throw new Error("No HTML content received")
      }

      // Parse HTML using DOMParser
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")

      // Extract Open Graph and meta tags
      const previewData: LinkPreviewData = {
        url,
        link_type: linkType as any,
      }

      // Title extraction
      previewData.title =
        this.getMetaContent(doc, "property", "og:title") ||
        this.getMetaContent(doc, "name", "twitter:title") ||
        doc.querySelector("title")?.textContent ||
        undefined

      // Description extraction
      previewData.description =
        this.getMetaContent(doc, "property", "og:description") ||
        this.getMetaContent(doc, "name", "twitter:description") ||
        this.getMetaContent(doc, "name", "description") ||
        undefined

      // Image extraction
      previewData.image_url =
        this.getMetaContent(doc, "property", "og:image") ||
        this.getMetaContent(doc, "name", "twitter:image") ||
        undefined

      // Site name extraction
      previewData.site_name =
        this.getMetaContent(doc, "property", "og:site_name") ||
        this.getMetaContent(doc, "name", "twitter:site") ||
        new URL(url).hostname ||
        undefined

      // Published time extraction
      previewData.published_time =
        this.getMetaContent(doc, "property", "article:published_time") ||
        this.getMetaContent(doc, "name", "pubdate") ||
        undefined

      // Clean up the data
      if (previewData.title) {
        previewData.title = previewData.title.trim().substring(0, 200)
      }
      if (previewData.description) {
        previewData.description = previewData.description.trim().substring(0, 500)
      }

      return previewData
    } catch (error) {
      console.error("Error parsing URL:", error)

      // Return basic fallback data
      return {
        url,
        title: this.extractTitleFromUrl(url),
        description: `Link to ${new URL(url).hostname}`,
        site_name: new URL(url).hostname,
        link_type: linkType as any,
      }
    }
  }

  private static getMetaContent(doc: Document, attribute: string, value: string): string | null {
    const element = doc.querySelector(`meta[${attribute}="${value}"]`)
    return element?.getAttribute("content") || null
  }

  private static extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname

      // Extract meaningful part from pathname
      const parts = pathname.split("/").filter((part) => part.length > 0)
      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1]
        // Convert hyphens and underscores to spaces and capitalize
        return lastPart.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      }

      return urlObj.hostname
    } catch {
      return "Link Preview"
    }
  }

  // Special handling for Twitter/X links
  static async fetchTwitterPreview(url: string): Promise<LinkPreviewData | null> {
    try {
      // Extract tweet ID from URL
      const tweetIdMatch = url.match(/status\/(\d+)/)
      if (!tweetIdMatch) {
        return null
      }

      // For Twitter, we'll create a basic preview since the API requires authentication
      return {
        url,
        title: "Twitter Post",
        description: "View this post on Twitter/X",
        site_name: "Twitter",
        image_url: "https://abs.twimg.com/icons/apple-touch-icon-192x192.png",
        link_type: "twitter",
      }
    } catch (error) {
      console.error("Error fetching Twitter preview:", error)
      return null
    }
  }

  // Special handling for Medium links
  static async fetchMediumPreview(url: string): Promise<LinkPreviewData | null> {
    try {
      // Medium has good Open Graph support, so use the general parser
      return await this.parseUrl(url, "medium")
    } catch (error) {
      console.error("Error fetching Medium preview:", error)
      return {
        url,
        title: "Medium Article",
        description: "Read this article on Medium",
        site_name: "Medium",
        image_url: "https://miro.medium.com/v2/resize:fill:152:152/1*sHhtYhaCe2Uc3IU0IgKwIQ.png",
        link_type: "medium",
      }
    }
  }
}
