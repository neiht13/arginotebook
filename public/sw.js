// Service Worker for offline functionality
const CACHE_NAME = "nkct-cache-v3"
const DYNAMIC_CACHE = "nkct-dynamic-cache-v3"
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/favicon.ico",
  "/images/icons/icon-192x192.png",
  "/images/icons/icon-512x512.png",
]

// API endpoints to cache for offline use
const REFERENCE_DATA_ENDPOINTS = ["/api/muavu", "/api/giaidoan", "/api/congviec"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing new service worker...")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching static assets")
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  // Activate the service worker immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating new service worker...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE
          })
          .map((cacheName) => {
            console.log("[Service Worker] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }),
      )
    }),
  )
  // Claim clients immediately
  return self.clients.claim()
})

// Helper function to determine if a request is an API request
const isApiRequest = (url) => {
  return url.pathname.startsWith("/api/")
}

// Helper function to determine if a request is for reference data
const isReferenceDataRequest = (url) => {
  return REFERENCE_DATA_ENDPOINTS.some((endpoint) => url.pathname === endpoint)
}

// Helper function to determine if a request is a navigation request
const isNavigationRequest = (request) => {
  return request.mode === "navigate"
}

// Helper function to determine if a request is for a static asset
const isStaticAsset = (url) => {
  return (
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".json")
  )
}

// Fetch event - handle requests
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET requests and browser extensions
  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/chrome-extension")
  ) {
    return
  }

  // Strategy for reference data API requests - Cache then network with fallback
  if (isReferenceDataRequest(url)) {
    console.log("[Service Worker] Handling reference data request:", url.pathname)
    event.respondWith(
      // Try network first
      fetch(event.request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone()

          // Cache the response
          caches.open(DYNAMIC_CACHE).then((cache) => {
            console.log("[Service Worker] Caching reference data:", url.pathname)
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(async () => {
          console.log("[Service Worker] Fetching reference data failed, trying cache:", url.pathname)
          // If network fails, try cache
          const cache = await caches.open(DYNAMIC_CACHE)
          const cachedResponse = await cache.match(event.request)

          if (cachedResponse) {
            console.log("[Service Worker] Serving cached reference data:", url.pathname)
            return cachedResponse
          }

          // If no cache, return a special response that the app can handle
          console.log("[Service Worker] No cached data found for:", url.pathname)
          return new Response(
            JSON.stringify({
              offline: true,
              message: "You are offline. Using local data.",
              endpoint: url.pathname,
            }),
            {
              headers: { "Content-Type": "application/json" },
            },
          )
        }),
    )
    return
  }

  // Strategy for API requests - Cache then network with fallback
  if (isApiRequest(url)) {
    // Special handling for timeline data
    if (url.pathname === "/api/nhatky") {
      console.log("[Service Worker] Handling timeline data request")
      event.respondWith(
        // Try network first
        fetch(event.request)
          .then((response) => {
            // Clone the response
            const responseToCache = response.clone()

            // Cache the response
            caches.open(DYNAMIC_CACHE).then((cache) => {
              // Create a custom cache key that includes query parameters
              console.log("[Service Worker] Caching timeline data")
              const cacheKey = new Request(event.request.url, { ...event.request, mode: "no-cors" })
              cache.put(cacheKey, responseToCache)
            })

            return response
          })
          .catch(async () => {
            console.log("[Service Worker] Fetching timeline data failed, trying cache")
            // If network fails, try cache
            const cache = await caches.open(DYNAMIC_CACHE)
            const cachedResponse = await cache.match(event.request.url)

            if (cachedResponse) {
              console.log("[Service Worker] Serving cached timeline data")
              return cachedResponse
            }

            // If no cache, return a special response that the app can handle
            console.log("[Service Worker] No cached timeline data found")
            return new Response(
              JSON.stringify({
                offline: true,
                message: "You are offline. Using local data.",
              }),
              {
                headers: { "Content-Type": "application/json" },
              },
            )
          }),
      )
      return
    }

    // For other API requests
    console.log("[Service Worker] Handling API request:", url.pathname)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone()

          // Only cache successful responses
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              console.log("[Service Worker] Caching API response:", url.pathname)
              cache.put(event.request, responseToCache)
            })
          }

          return response
        })
        .catch(() => {
          console.log("[Service Worker] Fetching API failed, trying cache:", url.pathname)
          // If network request fails, try to get from cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log("[Service Worker] Serving cached API response:", url.pathname)
              return cachedResponse
            }

            // For API requests with no cache, return an empty response
            console.log("[Service Worker] No cached API response found for:", url.pathname)
            return new Response(JSON.stringify({ offline: true, error: "You are offline" }), {
              headers: { "Content-Type": "application/json" },
            })
          })
        }),
    )
    return
  }

  // Strategy for navigation requests (HTML pages) - Network first, then cache
  if (isNavigationRequest(event.request)) {
    console.log("[Service Worker] Handling navigation request:", url.pathname)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone()

          // Cache the navigation request
          caches.open(CACHE_NAME).then((cache) => {
            console.log("[Service Worker] Caching navigation response:", url.pathname)
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          console.log("[Service Worker] Fetching page failed, trying cache:", url.pathname)
          // If network request fails, try to get from cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log("[Service Worker] Serving cached page:", url.pathname)
              return cachedResponse
            }

            // If no cache for this navigation, return the offline page
            console.log("[Service Worker] No cached page found, serving offline page")
            return caches.match("/offline")
          })
        }),
    )
    return
  }

  // Strategy for static assets - Cache first, then network
  if (isStaticAsset(url)) {
    console.log("[Service Worker] Handling static asset request:", url.pathname)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return cached response if available
        if (cachedResponse) {
          console.log("[Service Worker] Serving cached asset:", url.pathname)
          return cachedResponse
        }

        // Otherwise fetch from network and cache
        console.log("[Service Worker] No cached asset found, fetching from network:", url.pathname)
        return fetch(event.request)
          .then((response) => {
            // Clone the response
            const responseToCache = response.clone()

            // Cache the asset
            caches.open(CACHE_NAME).then((cache) => {
              console.log("[Service Worker] Caching new asset:", url.pathname)
              cache.put(event.request, responseToCache)
            })

            return response
          })
          .catch((error) => {
            console.error("[Service Worker] Fetching static asset failed:", url.pathname, error)
            // For images, could return a placeholder
            if (url.pathname.endsWith(".png") || url.pathname.endsWith(".jpg") || url.pathname.endsWith(".svg")) {
              return caches.match("/images/offline-placeholder.png")
            }

            // For other assets, just propagate the error
            throw error
          })
      }),
    )
    return
  }

  // Default strategy for everything else (stale-while-revalidate)
  console.log("[Service Worker] Handling default request:", url.pathname)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        console.log("[Service Worker] Serving cached response:", url.pathname)
        // Fetch from network in the background to update cache
        fetch(event.request)
          .then((response) => {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              console.log("[Service Worker] Updating cached response:", url.pathname)
              cache.put(event.request, response.clone())
            })
          })
          .catch(() => {
            // Silently fail - we already have a cached response
            console.log("[Service Worker] Background update failed for:", url.pathname)
          })

        return cachedResponse
      }

      // Otherwise fetch from network
      console.log("[Service Worker] No cached response found, fetching from network:", url.pathname)
      return fetch(event.request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone()

          // Cache the response
          caches.open(DYNAMIC_CACHE).then((cache) => {
            console.log("[Service Worker] Caching new response:", url.pathname)
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch((error) => {
          console.error("[Service Worker] Fetch failed:", url.pathname, error)
          // Just propagate the error if we have no cached response
          throw error
        })
    }),
  )
})

// Background sync for offline operations
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync event:", event.tag)
  if (event.tag === "sync-timeline-entries") {
    event.waitUntil(syncTimelineEntries())
  }
})

// Function to sync timeline entries
async function syncTimelineEntries() {
  try {
    console.log("[Service Worker] Starting background sync for timeline entries")
    // Send a message to the client to trigger sync
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      console.log("[Service Worker] Sending sync message to client")
      client.postMessage({
        type: "SYNC_TIMELINE_ENTRIES",
      })
    })
    return true
  } catch (error) {
    console.error("[Service Worker] Background sync failed:", error)
    return false
  }
}

// Listen for messages from the client
self.addEventListener("message", (event) => {
  console.log("[Service Worker] Received message from client:", event.data)
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[Service Worker] Skipping waiting phase")
    self.skipWaiting()
  }

  // Handle manual cache of reference data
  if (event.data && event.data.type === "CACHE_REFERENCE_DATA") {
    console.log("[Service Worker] Manual caching of reference data requested")
    event.waitUntil(cacheReferenceData())
  }
})

// Function to manually cache reference data
async function cacheReferenceData() {
  try {
    console.log("[Service Worker] Starting manual cache of reference data")
    const cache = await caches.open(DYNAMIC_CACHE)

    // Cache each reference data endpoint
    for (const endpoint of REFERENCE_DATA_ENDPOINTS) {
      try {
        console.log("[Service Worker] Fetching and caching:", endpoint)
        const response = await fetch(endpoint)
        await cache.put(endpoint, response)
        console.log("[Service Worker] Successfully cached:", endpoint)
      } catch (error) {
        console.error("[Service Worker] Failed to cache:", endpoint, error)
      }
    }

    console.log("[Service Worker] Manual caching of reference data completed")
    return true
  } catch (error) {
    console.error("[Service Worker] Manual caching of reference data failed:", error)
    return false
  }
}

