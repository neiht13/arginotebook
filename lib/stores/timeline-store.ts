import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import axios from "axios"
import { useNetworkStore } from "@/lib/network-status"
import { saveTimelineEntry, deleteTimelineEntry, getAllTimelineEntries } from "@/lib/offline-storage"
import type { TimelineEntry } from "@/app/(auth)/timeline/types"

interface TimelineState {
  entries: TimelineEntry[]
  isLoading: boolean
  hasPendingChanges: boolean
  fetchEntries: (userId: string) => Promise<void>
  addEntry: (entry: TimelineEntry) => Promise<void>
  updateEntry: (id: string, entry: TimelineEntry) => Promise<void>
  removeEntry: (id: string) => Promise<void>
  checkPendingChanges: (userId: string) => Promise<void>
  syncWithServer: () => Promise<void>
  reset: () => void
}

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      hasPendingChanges: false,
      fetchEntries: async (userId: string) => {
        try {
          set({ isLoading: true })
          const isOnline = useNetworkStore.getState().isOnline
          if (isOnline) {
            const response = await axios.get(`/api/nhatky?uId=${userId}`)
            const sortedData = [...response.data].sort((a: TimelineEntry, b: TimelineEntry) => {
              const dateA = parseVietnameseDate(a.ngayThucHien)
              const dateB = parseVietnameseDate(b.ngayThucHien)
              return dateB.getTime() - dateA.getTime()
            })
            set({ entries: sortedData })
          } else {
            const localData = await getAllTimelineEntries(userId)
            const filteredData = localData.filter((entry) => !entry._deleted)
            const sortedData = [...filteredData].sort((a: TimelineEntry, b: TimelineEntry) => {
              const dateA = parseVietnameseDate(a.ngayThucHien)
              const dateB = parseVietnameseDate(b.ngayThucHien)
              return dateB.getTime() - dateA.getTime()
            })
            set({ entries: sortedData })
          }
          await get().checkPendingChanges(userId)
        } catch (error) {
          console.error("Error fetching timeline entries:", error)
          try {
            const localData = await getAllTimelineEntries(userId)
            const filteredData = localData.filter((entry) => !entry._deleted)
            const sortedData = [...filteredData].sort((a: TimelineEntry, b: TimelineEntry) => {
              const dateA = parseVietnameseDate(a.ngayThucHien)
              const dateB = parseVietnameseDate(b.ngayThucHien)
              return dateB.getTime() - dateA.getTime()
            })
            set({ entries: sortedData })
          } catch (localError) {
            console.error("Error getting local data:", localError)
          }
        } finally {
          set({ isLoading: false })
        }
      },
      addEntry: async (entry: TimelineEntry) => {
        try {
          await saveTimelineEntry(entry)
          set((state) => ({
            entries: [entry, ...state.entries],
          }))
          if (useNetworkStore.getState().isOnline) {
            await get().syncWithServer()
          } else {
            set({ hasPendingChanges: true })
          }
        } catch (error) {
          console.error("Error adding timeline entry:", error)
          throw error
        }
      },
      updateEntry: async (id: string, entry: TimelineEntry) => {
        try {
          await saveTimelineEntry(entry)
          set((state) => ({
            entries: state.entries.map((item) => (item._id === id ? entry : item)),
          }))
          if (useNetworkStore.getState().isOnline) {
            await get().syncWithServer()
          } else {
            set({ hasPendingChanges: true })
          }
        } catch (error) {
          console.error("Error updating timeline entry:", error)
          throw error
        }
      },
      removeEntry: async (id: string) => {
        try {
          await deleteTimelineEntry(id)
          set((state) => ({
            entries: state.entries.filter((item) => item._id !== id),
          }))
          if (useNetworkStore.getState().isOnline) {
            await get().syncWithServer()
          } else {
            set({ hasPendingChanges: true })
          }
        } catch (error) {
          console.error("Error removing timeline entry:", error)
          throw error
        }
      },
      checkPendingChanges: async (userId: string) => {
        try {
          const localData = await getAllTimelineEntries(userId)
          const pendingEntries = localData.filter((entry) => entry._syncStatus === "pending" || entry._deleted)
          set({ hasPendingChanges: pendingEntries.length > 0 })
        } catch (error) {
          console.error("Error checking pending changes:", error)
        }
      },
      syncWithServer: async () => {
        try {
          if (!useNetworkStore.getState().isOnline) {
            return
          }
          set({ hasPendingChanges: false })
        } catch (error) {
          console.error("Error syncing with server:", error)
        }
      },
      reset: () => {
        set({
          entries: [],
          hasPendingChanges: false,
        })
      },
    }),
    {
      name: "timeline-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        entries: [],
        hasPendingChanges: state.hasPendingChanges,
      }),
    }
  )
)

const parseVietnameseDate = (dateString: string): Date => {
  try {
    const [day, month, year] = dateString.split("-").map(Number)
    return new Date(year, month - 1, day)
  } catch (error) {
    console.error("Error parsing date:", error)
    return new Date()
  }
}