"use client"

import { useState, useEffect } from "react"
import { LinkPreviewService, type LinkPreviewData } from "../lib/linkPreview"

export function useLinkPreview(url: string | null) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url || !isValidUrl(url)) {
      setPreview(null)
      setError(null)
      return
    }

    const fetchPreview = async () => {
      setLoading(true)
      setError(null)

      try {
        let previewData: LinkPreviewData | null = null

        // Handle different link types
        if (url.includes("twitter.com") || url.includes("x.com")) {
          previewData = await LinkPreviewService.fetchTwitterPreview(url)
        } else if (url.includes("medium.com")) {
          previewData = await LinkPreviewService.fetchMediumPreview(url)
        } else {
          previewData = await LinkPreviewService.fetchLinkPreview(url)
        }

        setPreview(previewData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch preview")
        setPreview(null)
      } finally {
        setLoading(false)
      }
    }

    // Debounce the API call
    const timeoutId = setTimeout(fetchPreview, 1000)

    return () => clearTimeout(timeoutId)
  }, [url])

  return { preview, loading, error }
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
