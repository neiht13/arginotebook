import { create } from "zustand"

// Store for network status
interface NetworkState {
  isOnline: boolean
  setOnline: (status: boolean) => void
  lastOnlineTime: number | null
  setLastOnlineTime: (time: number) => void
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  setOnline: (status) => set({ isOnline: status }),
  lastOnlineTime: null,
  setLastOnlineTime: (time) => set({ lastOnlineTime: time }),
}))

// Initialize network listeners
export function initNetworkListeners() {
  if (typeof window === "undefined") return

  const handleOnline = () => {
    useNetworkStore.setState({
      isOnline: true,
      lastOnlineTime: Date.now(),
    })
    localStorage.setItem("lastSyncTime", new Date().toISOString())

    // Register for background sync if supported
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync
          .register("sync-timeline-entries")
          .catch((err) => console.error("Background sync registration failed:", err))
      })
    }
  }

  const handleOffline = () => {
    useNetworkStore.setState({ isOnline: false })
  }

  window.addEventListener("online", handleOnline)
  window.addEventListener("offline", handleOffline)

  // Set initial state
  useNetworkStore.setState({
    isOnline: navigator.onLine,
    lastOnlineTime: navigator.onLine ? Date.now() : null,
  })

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline)
    window.removeEventListener("offline", handleOffline)
  }
}

// Function to check if we're online
export function isOnline() {
  return useNetworkStore.getState().isOnline
}

