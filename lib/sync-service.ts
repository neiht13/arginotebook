import axios from "axios"
import {
  getPendingSyncEntries,
  markEntrySynced,
  markEntryError,
  getAllTimelineEntries,
  storeServerData,
  saveAppSetting,
  cacheApiData,
  storeReferenceData,
  getReferenceData,
} from "./offline-storage"
import { useNetworkStore } from "./network-status"
import type { TimelineEntry } from "@/app/(auth)/timeline/types"

let syncInProgress = false
let syncTimeout: NodeJS.Timeout | null = null

export async function syncData() {
  // Don't run multiple syncs simultaneously
  if (syncInProgress) {
    console.log("Sync already in progress, skipping")
    return
  }

  // Don't sync if offline
  if (!useNetworkStore.getState().isOnline) {
    console.log("Device is offline, skipping sync")
    return
  }

  try {
    syncInProgress = true
    console.log("Starting data synchronization")

    // Get all pending entries
    const pendingEntries = await getPendingSyncEntries()

    if (pendingEntries.length === 0) {
      console.log("No pending entries to sync")
    } else {
      console.log(`Syncing ${pendingEntries.length} pending entries`)

      // Process each entry
      for (const entry of pendingEntries) {
        try {
          switch (entry._operation) {
            case "create":
              // If it's a local entry (not yet on server)
              if (entry._id.startsWith("local_")) {
                console.log(`Creating new entry on server (local ID: ${entry._id})`)
                // Remove local ID and other metadata before sending to server
                const { _id, _localId, _syncStatus, _operation, _lastModified, _syncError, ...dataToSend } = entry

                // Send to server
                const response = await axios.post("/api/nhatky", dataToSend)

                // Mark as synced with the server data
                await markEntrySynced(entry._id, {
                  ...dataToSend,
                  _id: response.data.id || response.data._id,
                } as TimelineEntry)
              }
              break

            case "update":
              console.log(`Updating entry on server: ${entry._id}`)
              // Remove metadata before sending to server
              const { _syncStatus, _operation, _lastModified, _syncError, ...updateData } = entry

              // Send to server
              await axios.put("/api/nhatky", updateData)

              // Mark as synced
              await markEntrySynced(entry._id)
              break

            case "delete":
              console.log(`Deleting entry on server: ${entry._id}`)
              // Send delete request to server
              await axios.delete(`/api/nhatky?id=${entry._id}`)

              // Mark as synced (which will remove it)
              await markEntrySynced(entry._id)
              break
          }
        } catch (error) {
          console.error(`Error syncing entry ${entry._id}:`, error)
          await markEntryError(entry._id, error)
        }
      }
    }

    // Sync reference data
    await syncReferenceData()

    // Update last sync time
    await saveAppSetting("lastSyncTime", Date.now())
    localStorage.setItem("lastSyncTime", new Date().toISOString())
  } catch (error) {
    console.error("Sync error:", error)
  } finally {
    syncInProgress = false

    // Schedule next sync
    if (syncTimeout) clearTimeout(syncTimeout)
    syncTimeout = setTimeout(syncData, 60000) // Try again in 1 minute
  }
}

// Function to sync reference data
async function syncReferenceData() {
  try {
    console.log("Syncing reference data")

    // Sync muavu data
    try {
      const muavuResponse = await axios.get("/api/muavu")
      await storeReferenceData("muavu", muavuResponse.data)
      console.log(`Synced ${muavuResponse.data.length} muavu items`)
    } catch (error) {
      console.error("Error syncing muavu data:", error)
    }

    // Sync giaidoan data
    try {
      const giaidoanResponse = await axios.get("/api/giaidoan")
      await storeReferenceData("giaidoan", giaidoanResponse.data)
      console.log(`Synced ${giaidoanResponse.data.length} giaidoan items`)
    } catch (error) {
      console.error("Error syncing giaidoan data:", error)
    }

    // Sync congviec data
    try {
      const congviecResponse = await axios.get("/api/congviec")
      await storeReferenceData("congviec", congviecResponse.data)
      console.log(`Synced ${congviecResponse.data.length} congviec items`)
    } catch (error) {
      console.error("Error syncing congviec data:", error)
    }
  } catch (error) {
    console.error("Error syncing reference data:", error)
  }
}

// Start sync when online
export function initSyncService() {
  if (typeof window === "undefined") return

  // Listen for service worker messages
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SYNC_TIMELINE_ENTRIES") {
        console.log("Received sync message from service worker")
        syncData()
      }
    })
  }

  const unsubscribe = useNetworkStore.subscribe(
    (state) => state.isOnline,
    (isOnline) => {
      if (isOnline) {
        console.log("Device is back online, triggering sync")
        // When we come back online, sync immediately
        syncData()
      }
    },
  )

  // Initial sync
  if (useNetworkStore.getState().isOnline) {
    console.log("Initializing sync service, device is online")
    syncData()
  } else {
    console.log("Initializing sync service, device is offline")
  }

  return unsubscribe
}

// Function to fetch data with offline fallback
export async function fetchTimelineData(userId: string) {
  try {
    if (!useNetworkStore.getState().isOnline) {
      console.log("Device is offline, fetching data from IndexedDB")
      // If offline, get data from IndexedDB
      return await getAllTimelineEntries(userId)
    }

    console.log("Device is online, fetching data from server")
    // If online, try to get from server
    const response = await axios.get("/api/nhatky", {
      params: { uId: userId },
    })

    // Store the server data in IndexedDB for offline use
    const serverData = response.data
    console.log(`Received ${serverData.length} entries from server`)

    // Cache the API response
    await cacheApiData(`/api/nhatky?uId=${userId}`, serverData)

    // Store in IndexedDB
    await storeServerData(userId, serverData)

    return serverData
  } catch (error) {
    console.error("Error fetching timeline data:", error)

    // Fallback to local data if server request fails
    console.log("Server request failed, falling back to local data")
    return await getAllTimelineEntries(userId)
  }
}

// Functions to fetch reference data
export async function fetchMuavu() {
  try {
    if (!useNetworkStore.getState().isOnline) {
      console.log("Device is offline, fetching muavu from IndexedDB")
      return await getReferenceData("muavu")
    }

    console.log("Device is online, fetching muavu from server")
    const response = await axios.get("/api/muavu")
    const data = response.data

    // Store for offline use
    await storeReferenceData("muavu", data)

    return data
  } catch (error) {
    console.error("Error fetching muavu data:", error)
    return await getReferenceData("muavu")
  }
}

export async function fetchGiaiDoan() {
  try {
    if (!useNetworkStore.getState().isOnline) {
      console.log("Device is offline, fetching giaidoan from IndexedDB")
      return await getReferenceData("giaidoan")
    }

    console.log("Device is online, fetching giaidoan from server")
    const response = await axios.get("/api/giaidoan")
    const data = response.data

    // Store for offline use
    await storeReferenceData("giaidoan", data)

    return data
  } catch (error) {
    console.error("Error fetching giaidoan data:", error)
    return await getReferenceData("giaidoan")
  }
}

export async function fetchCongViec() {
  try {
    if (!useNetworkStore.getState().isOnline) {
      console.log("Device is offline, fetching congviec from IndexedDB")
      return await getReferenceData("congviec")
    }

    console.log("Device is online, fetching congviec from server")
    const response = await axios.get("/api/congviec")
    const data = response.data

    // Store for offline use
    await storeReferenceData("congviec", data)

    return data
  } catch (error) {
    console.error("Error fetching congviec data:", error)
    return await getReferenceData("congviec")
  }
}

