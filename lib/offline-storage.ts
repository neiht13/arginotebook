import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { TimelineEntry } from "@/app/(auth)/timeline/types"

interface FarmAppDB extends DBSchema {
  timelineEntries: {
    key: string
    value: TimelineEntry & {
      _syncStatus: "pending" | "synced" | "error"
      _localId?: string
      _operation: "create" | "update" | "delete"
      _syncError?: string
      _lastModified: number
    }
    indexes: {
      "by-sync-status": string
      "by-user-id": string
      "by-last-modified": number
    }
  }
  syncQueue: {
    key: string
    value: {
      id: string
      operation: "create" | "update" | "delete"
      data: any
      timestamp: number
      retryCount: number
    }
  }
  appSettings: {
    key: string
    value: {
      key: string
      value: any
      lastUpdated: number
    }
  }
  apiCache: {
    key: string
    value: {
      url: string
      data: any
      timestamp: number
    }
  }
  // Reference data stores
  muavu: {
    key: string // _id
    value: any
    indexes: {
      "by-last-modified": number
    }
  }
  giaidoan: {
    key: string // _id
    value: any
    indexes: {
      "by-last-modified": number
    }
  }
  congviec: {
    key: string // _id
    value: any
    indexes: {
      "by-stage-id": string
      "by-last-modified": number
    }
  }
}

let db: IDBPDatabase<FarmAppDB> | null = null

// Increase the version number to trigger an upgrade
const DB_VERSION = 4

export async function initDB() {
  if (db) return db

  try {
    // Force a clean database if we're upgrading
    if (typeof window !== "undefined") {
      try {
        const existingDBs = await window.indexedDB.databases()
        const farmAppDB = existingDBs.find((db) => db.name === "farm-app-db")

        if (farmAppDB && farmAppDB.version !== DB_VERSION) {
          console.log(`Database version mismatch. Existing: ${farmAppDB.version}, Required: ${DB_VERSION}`)
          console.log("Deleting existing database to ensure schema updates")
          await window.indexedDB.deleteDatabase("farm-app-db")
        }
      } catch (error) {
        console.error("Error checking existing database:", error)
        // Continue anyway - some browsers don't support databases()
      }
    }

    db = await openDB<FarmAppDB>("farm-app-db", DB_VERSION, {
      upgrade(database, oldVersion, newVersion, transaction) {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`)

        // Create timeline entries store
        if (!database.objectStoreNames.contains("timelineEntries")) {
          console.log("Creating timelineEntries store")
          const timelineStore = database.createObjectStore("timelineEntries", {
            keyPath: "_id",
          })
          timelineStore.createIndex("by-sync-status", "_syncStatus")
          timelineStore.createIndex("by-user-id", "uId")
          timelineStore.createIndex("by-last-modified", "_lastModified")
        } else {
          // Ensure indexes exist
          try {
            const timelineStore = transaction.objectStore("timelineEntries")
            if (!timelineStore.indexNames.contains("by-sync-status")) {
              timelineStore.createIndex("by-sync-status", "_syncStatus")
            }
            if (!timelineStore.indexNames.contains("by-user-id")) {
              timelineStore.createIndex("by-user-id", "uId")
            }
            if (!timelineStore.indexNames.contains("by-last-modified")) {
              timelineStore.createIndex("by-last-modified", "_lastModified")
            }
          } catch (error) {
            console.error("Error updating timelineEntries indexes:", error)
          }
        }

        // Create sync queue store
        if (!database.objectStoreNames.contains("syncQueue")) {
          console.log("Creating syncQueue store")
          database.createObjectStore("syncQueue", {
            keyPath: "id",
          })
        }

        // Create app settings store
        if (!database.objectStoreNames.contains("appSettings")) {
          console.log("Creating appSettings store")
          database.createObjectStore("appSettings", {
            keyPath: "key",
          })
        }

        // Create API cache store
        if (!database.objectStoreNames.contains("apiCache")) {
          console.log("Creating apiCache store")
          database.createObjectStore("apiCache", {
            keyPath: "url",
          })
        }

        // Create reference data stores with proper indexes
        if (!database.objectStoreNames.contains("muavu")) {
          console.log("Creating muavu store")
          const muavuStore = database.createObjectStore("muavu", {
            keyPath: "_id",
          })
          muavuStore.createIndex("by-last-modified", "_lastModified")
        } else {
          try {
            const muavuStore = transaction.objectStore("muavu")
            if (!muavuStore.indexNames.contains("by-last-modified")) {
              muavuStore.createIndex("by-last-modified", "_lastModified")
            }
          } catch (error) {
            console.error("Error updating muavu indexes:", error)
          }
        }

        if (!database.objectStoreNames.contains("giaidoan")) {
          console.log("Creating giaidoan store")
          const giaidoanStore = database.createObjectStore("giaidoan", {
            keyPath: "_id",
          })
          giaidoanStore.createIndex("by-last-modified", "_lastModified")
        } else {
          try {
            const giaidoanStore = transaction.objectStore("giaidoan")
            if (!giaidoanStore.indexNames.contains("by-last-modified")) {
              giaidoanStore.createIndex("by-last-modified", "_lastModified")
            }
          } catch (error) {
            console.error("Error updating giaidoan indexes:", error)
          }
        }

        if (!database.objectStoreNames.contains("congviec")) {
          console.log("Creating congviec store")
          const congviecStore = database.createObjectStore("congviec", {
            keyPath: "_id",
          })
          congviecStore.createIndex("by-stage-id", "giaidoanId")
          congviecStore.createIndex("by-last-modified", "_lastModified")
        } else {
          try {
            const congviecStore = transaction.objectStore("congviec")
            if (!congviecStore.indexNames.contains("by-stage-id")) {
              congviecStore.createIndex("by-stage-id", "giaidoanId")
            }
            if (!congviecStore.indexNames.contains("by-last-modified")) {
              congviecStore.createIndex("by-last-modified", "_lastModified")
            }
          } catch (error) {
            console.error("Error updating congviec indexes:", error)
          }
        }
      },
      blocked() {
        console.log("Database upgrade blocked - please close other tabs/windows")
      },
      blocking() {
        console.log("Database is blocking an upgrade in another tab/window")
        // Close the database to allow the other tab to upgrade
        if (db) db.close()
        db = null
      },
      terminated() {
        console.log("Database connection terminated unexpectedly")
        db = null
      },
    })

    console.log("IndexedDB initialized successfully")
    return db
  } catch (error) {
    console.error("Error initializing IndexedDB:", error)
    throw error
  }
}

// Timeline entries operations
export async function saveTimelineEntry(entry: TimelineEntry, operation: "create" | "update" = "create") {
  try {
    const database = await initDB()

    // For new entries without an _id, generate a temporary local ID
    if (!entry._id && operation === "create") {
      entry._id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      entry._localId = entry._id
    }

    // Add sync metadata
    const entryWithMeta = {
      ...entry,
      _syncStatus: "pending",
      _operation: operation,
      _lastModified: Date.now(),
    }

    console.log(`Saving timeline entry to IndexedDB: ${entry._id}`)
    await database.put("timelineEntries", entryWithMeta)

    // Add to sync queue
    await database.put("syncQueue", {
      id: entry._id,
      operation,
      data: entry,
      timestamp: Date.now(),
      retryCount: 0,
    })

    return entry
  } catch (error) {
    console.error("Error saving timeline entry to IndexedDB:", error)
    throw error
  }
}

export async function deleteTimelineEntry(id: string) {
  try {
    const database = await initDB()

    // Get the entry first to preserve its data for sync
    const entry = await database.get("timelineEntries", id)

    if (entry) {
      // Mark as pending delete
      entry._syncStatus = "pending"
      entry._operation = "delete"
      entry._lastModified = Date.now()
      await database.put("timelineEntries", entry)

      // Add to sync queue
      await database.put("syncQueue", {
        id,
        operation: "delete",
        data: entry,
        timestamp: Date.now(),
        retryCount: 0,
      })
    }

    // If it's a local entry that hasn't been synced yet, we can remove it completely
    if (id.startsWith("local_")) {
      await database.delete("timelineEntries", id)
    }
  } catch (error) {
    console.error("Error deleting timeline entry from IndexedDB:", error)
    throw error
  }
}

export async function getAllTimelineEntries(userId: string) {
  try {
    const database = await initDB()

    // First check if the index exists
    const transaction = database.transaction("timelineEntries", "readonly")
    const store = transaction.objectStore("timelineEntries")

    if (!store.indexNames.contains("by-user-id")) {
      console.warn("by-user-id index not found, falling back to filtering all entries")
      // Fallback: get all entries and filter manually
      const allEntries = await database.getAll("timelineEntries")
      return allEntries
        .filter((entry) => entry.uId === userId && entry._operation !== "delete")
        .sort((a, b) => {
          const dateA = parseVietnameseDate(a.ngayThucHien)
          const dateB = parseVietnameseDate(b.ngayThucHien)
          return dateB.getTime() - dateA.getTime()
        })
    }

    // Check if we have any entries for this user
    const entriesCount = await database.countFromIndex("timelineEntries", "by-user-id", userId)
    console.log(`Found ${entriesCount} entries for user ${userId} in IndexedDB`)

    if (entriesCount === 0) {
      console.log("No entries found in IndexedDB, checking API cache")
      // Try to get from API cache
      const cachedData = await getCachedApiData(`/api/nhatky?uId=${userId}`)
      if (cachedData) {
        console.log("Found data in API cache, storing in IndexedDB")
        // Store in IndexedDB for future use
        await storeServerData(userId, cachedData)
        return cachedData
      }
      return []
    }

    // Use the by-user-id index to get entries for this user
    const entries = await database.getAllFromIndex("timelineEntries", "by-user-id", userId)

    // Filter out entries marked for deletion
    return entries
      .filter((entry) => entry._operation !== "delete")
      .sort((a, b) => {
        // Parse dates and sort by date (newest first)
        const dateA = parseVietnameseDate(a.ngayThucHien)
        const dateB = parseVietnameseDate(b.ngayThucHien)
        return dateB.getTime() - dateA.getTime()
      })
  } catch (error) {
    console.error("Error getting timeline entries from IndexedDB:", error)

    // Fallback: try to get from API cache
    try {
      const cachedData = await getCachedApiData(`/api/nhatky?uId=${userId}`)
      if (cachedData) {
        return cachedData
      }
    } catch (cacheError) {
      console.error("Error getting cached API data:", cacheError)
    }

    return []
  }
}

export async function getPendingSyncEntries() {
  try {
    const database = await initDB()

    // First check if the index exists
    const transaction = database.transaction("timelineEntries", "readonly")
    const store = transaction.objectStore("timelineEntries")

    if (!store.indexNames.contains("by-sync-status")) {
      console.warn("by-sync-status index not found, falling back to filtering all entries")
      // Fallback: get all entries and filter manually
      const allEntries = await database.getAll("timelineEntries")
      return allEntries.filter((entry) => entry._syncStatus === "pending")
    }

    return await database.getAllFromIndex("timelineEntries", "by-sync-status", "pending")
  } catch (error) {
    console.error("Error getting pending sync entries from IndexedDB:", error)
    return []
  }
}

export async function markEntrySynced(id: string, serverData?: TimelineEntry) {
  try {
    const database = await initDB()

    // If this was a local entry that now has a server ID
    if (id.startsWith("local_") && serverData && serverData._id) {
      console.log(`Marking local entry ${id} as synced with server ID ${serverData._id}`)
      // Delete the local entry
      await database.delete("timelineEntries", id)

      // Add the server entry
      await database.put("timelineEntries", {
        ...serverData,
        _syncStatus: "synced",
        _operation: "create",
        _localId: id, // Keep track of the local ID for reference
        _lastModified: Date.now(),
      })

      // Remove from sync queue
      await database.delete("syncQueue", id)
    } else {
      // For existing entries, just update the sync status
      const entry = await database.get("timelineEntries", id)
      if (entry) {
        console.log(`Marking entry ${id} as synced`)
        entry._syncStatus = "synced"
        entry._lastModified = Date.now()
        await database.put("timelineEntries", entry)

        // Remove from sync queue
        await database.delete("syncQueue", id)
      }
    }

    // Update last sync time
    await saveAppSetting("lastSyncTime", Date.now())
    localStorage.setItem("lastSyncTime", new Date().toISOString())
  } catch (error) {
    console.error("Error marking entry as synced in IndexedDB:", error)
    throw error
  }
}

export async function markEntryError(id: string, error?: any) {
  try {
    const database = await initDB()
    const entry = await database.get("timelineEntries", id)

    if (entry) {
      console.log(`Marking entry ${id} as error: ${error?.message || "Unknown error"}`)
      entry._syncStatus = "error"
      entry._syncError = error?.message || "Unknown error"
      entry._lastModified = Date.now()
      await database.put("timelineEntries", entry)
    }
  } catch (error) {
    console.error("Error marking entry as error in IndexedDB:", error)
  }
}

// API cache operations
export async function cacheApiData(url: string, data: any) {
  try {
    const database = await initDB()
    await database.put("apiCache", {
      url,
      data,
      timestamp: Date.now(),
    })
    console.log(`Cached API data for ${url}`)
  } catch (error) {
    console.error("Error caching API data:", error)
  }
}

export async function getCachedApiData(url: string) {
  try {
    const database = await initDB()
    const cachedData = await database.get("apiCache", url)

    if (cachedData) {
      console.log(`Found cached API data for ${url}, timestamp: ${new Date(cachedData.timestamp).toISOString()}`)
      return cachedData.data
    }

    return null
  } catch (error) {
    console.error("Error getting cached API data:", error)
    return null
  }
}

// App settings operations
export async function saveAppSetting(key: string, value: any) {
  try {
    const database = await initDB()
    await database.put("appSettings", {
      key,
      value,
      lastUpdated: Date.now(),
    })
  } catch (error) {
    console.error("Error saving app setting to IndexedDB:", error)
  }
}

export async function getAppSetting(key: string) {
  try {
    const database = await initDB()
    const setting = await database.get("appSettings", key)
    return setting?.value
  } catch (error) {
    console.error("Error getting app setting from IndexedDB:", error)
    return null
  }
}

// Reference data operations
export async function storeReferenceData(type: "muavu" | "giaidoan" | "congviec", data: any[]) {
  try {
    const database = await initDB()
    const transaction = database.transaction(type, "readwrite")
    const store = transaction.objectStore(type)

    console.log(`Storing ${data.length} ${type} items in IndexedDB`)

    // Clear existing data
    await store.clear()

    // Add _lastModified to each item
    const timestamp = Date.now()
    const dataWithMeta = data.map((item) => ({
      ...item,
      _lastModified: timestamp,
    }))

    // Store new data
    for (const item of dataWithMeta) {
      await store.put(item)
    }

    await transaction.done

    // Cache the API response
    await cacheApiData(`/api/${type}`, data)

    // Update last sync time for this type
    await saveAppSetting(`last${type}SyncTime`, timestamp)

    console.log(`Successfully stored ${type} data in IndexedDB`)
    return true
  } catch (error) {
    console.error(`Error storing ${type} data in IndexedDB:`, error)
    return false
  }
}

export async function getReferenceData(type: "muavu" | "giaidoan" | "congviec") {
  try {
    const database = await initDB()

    // Check if the store exists
    if (!database.objectStoreNames.contains(type)) {
      console.warn(`${type} store not found in IndexedDB`)
      return []
    }

    // Get all data from the store
    const data = await database.getAll(type)

    if (data.length === 0) {
      console.log(`No ${type} data found in IndexedDB, checking API cache`)
      // Try to get from API cache
      const cachedData = await getCachedApiData(`/api/${type}`)
      if (cachedData) {
        console.log(`Found ${type} data in API cache, storing in IndexedDB`)
        // Store in IndexedDB for future use
        await storeReferenceData(type, cachedData)
        return cachedData
      }
      return []
    }

    console.log(`Retrieved ${data.length} ${type} items from IndexedDB`)
    return data
  } catch (error) {
    console.error(`Error getting ${type} data from IndexedDB:`, error)

    // Try to get from API cache as fallback
    try {
      const cachedData = await getCachedApiData(`/api/${type}`)
      if (cachedData) {
        return cachedData
      }
    } catch (cacheError) {
      console.error("Error getting cached API data:", cacheError)
    }

    return []
  }
}

// Get tasks filtered by stage ID
export async function getTasksByStageId(stageId: string) {
  try {
    const database = await initDB()

    // Check if the store and index exist
    if (!database.objectStoreNames.contains("congviec")) {
      console.warn("congviec store not found in IndexedDB")
      return []
    }

    const transaction = database.transaction("congviec", "readonly")
    const store = transaction.objectStore("congviec")

    if (!store.indexNames.contains("by-stage-id")) {
      console.warn("by-stage-id index not found in congviec store, falling back to filtering all tasks")
      // Fallback: get all tasks and filter manually
      const allTasks = await database.getAll("congviec")
      return allTasks.filter((task) => task.giaidoanId === stageId)
    }

    // Use the index to get tasks for this stage
    return await database.getAllFromIndex("congviec", "by-stage-id", stageId)
  } catch (error) {
    console.error("Error getting tasks by stage ID from IndexedDB:", error)
    return []
  }
}

// Function to store server data in IndexedDB
export async function storeServerData(userId: string, serverData: TimelineEntry[]) {
  try {
    const database = await initDB()

    // First check if the store has the required index
    const transaction = database.transaction("timelineEntries", "readwrite")
    const store = transaction.objectStore("timelineEntries")

    if (!store.indexNames.contains("by-user-id")) {
      console.warn("by-user-id index not found, creating it")
      // We can't create an index in the middle of a transaction, so we need to abort and recreate
      transaction.abort()

      // Force a database upgrade to create the missing index
      db = null
      await initDB()

      // Start a new transaction
      const newTransaction = database.transaction("timelineEntries", "readwrite")
      const newStore = newTransaction.objectStore("timelineEntries")

      console.log(`Storing ${serverData.length} server entries for user ${userId} in IndexedDB`)

      // Process each server entry
      for (const serverEntry of serverData) {
        // Get existing entry if any
        const existingEntry = await database.get("timelineEntries", serverEntry._id)

        // If entry doesn't exist locally or is not pending, update it
        if (!existingEntry || existingEntry._syncStatus !== "pending") {
          await newStore.put({
            ...serverEntry,
            _syncStatus: "synced",
            _operation: "update",
            _lastModified: Date.now(),
          })
        }
        // If entry exists and is pending, we keep the local version
      }

      await newTransaction.done
    } else {
      // Normal flow when index exists
      console.log(`Storing ${serverData.length} server entries for user ${userId} in IndexedDB`)

      // Get all existing entries for this user
      const existingEntries = await store.index("by-user-id").getAll(userId)
      const existingMap = new Map(existingEntries.map((entry) => [entry._id, entry]))

      // Process each server entry
      for (const serverEntry of serverData) {
        const existingEntry = existingMap.get(serverEntry._id)

        // If entry doesn't exist locally or is not pending, update it
        if (!existingEntry || existingEntry._syncStatus !== "pending") {
          await store.put({
            ...serverEntry,
            _syncStatus: "synced",
            _operation: "update",
            _lastModified: Date.now(),
          })
        }
        // If entry exists and is pending, we keep the local version
      }

      await transaction.done
    }

    // Cache the API response
    await cacheApiData(`/api/nhatky?uId=${userId}`, serverData)

    // Update last sync time
    await saveAppSetting("lastSyncTime", Date.now())
    localStorage.setItem("lastSyncTime", new Date().toISOString())

    console.log("Successfully stored server data in IndexedDB")
    return true
  } catch (error) {
    console.error("Error storing server data in IndexedDB:", error)
    return false
  }
}

// Function to clear all data (for testing or logout)
export async function clearAllData() {
  try {
    const database = await initDB()
    await database.clear("timelineEntries")
    await database.clear("syncQueue")
    await database.clear("apiCache")
    await database.clear("muavu")
    await database.clear("giaidoan")
    await database.clear("congviec")
    localStorage.removeItem("lastSyncTime")
    console.log("Cleared all data from IndexedDB")
    return true
  } catch (error) {
    console.error("Error clearing data from IndexedDB:", error)
    return false
  }
}

// Helper function to parse Vietnamese date format
function parseVietnameseDate(dateString: string) {
  try {
    const [day, month, year] = dateString.split("-").map(Number)
    return new Date(year, month - 1, day)
  } catch (error) {
    console.error("Error parsing Vietnamese date:", error)
    return new Date()
  }
}

