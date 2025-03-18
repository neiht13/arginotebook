import type React from "react"
import DashboardLayout from "@/components/ui/dashboard-layout"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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

