import { Toaster } from "@/components/ui/toaster"
import type React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster />
      {children}
    </>
  )
}

