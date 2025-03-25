"use client"
import type React from "react"
import DashboardLayout from "@/components/ui/dashboard-layout"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useSession } from "next-auth/react"
import Spinner from "@/components/ui/spinner"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { initNetworkListeners } from "@/lib/network-status"
import { initSyncService } from "@/lib/sync-service"
import { initDB } from "@/lib/offline-storage"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    // Initialize IndexedDB
    initDB()

    // Initialize network listeners
    const cleanupNetworkListeners = initNetworkListeners()

    // Initialize sync service
    const cleanupSyncService = initSyncService()

    return () => {
      cleanupNetworkListeners?.()
      cleanupSyncService?.()
    }
  }, [])

  if (session.status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    )
  } else if (session.status === "unauthenticated") {
    router.push("/auth")
  } else {
    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <DashboardLayout>{children}</DashboardLayout>
      </>
    )
  }
}

