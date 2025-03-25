import { Toaster } from "@/components/ui/toaster"
import type React from "react"

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster />
      {children}
    </>
  )
}

