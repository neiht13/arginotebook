import type React from "react"
import "react-toastify/dist/ReactToastify.css"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  )
}

