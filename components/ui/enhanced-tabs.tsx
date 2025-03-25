"use client"

import type * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type TabItem = {
  id: string
  label: string
  icon?: React.ReactNode
}

interface EnhancedTabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  variant?: "default" | "pills" | "underline" | "cards"
  fullWidth?: boolean
  className?: string
}

const tabVariants = {
  inactive: { opacity: 0.7, y: 0 },
  active: { opacity: 1, y: -5, transition: { type: "spring", stiffness: 300 } },
}

const contentVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
}

export function EnhancedTabs({
  tabs,
  activeTab,
  onChange,
  variant = "default",
  fullWidth = false,
  className,
}: EnhancedTabsProps) {
  const getTabStyles = (id: string) => {
    const isActive = activeTab === id

    const baseStyles = "flex items-center gap-2 transition-all duration-200 font-medium"

    const variantStyles = {
      default: cn("py-3 px-4 rounded-lg", isActive ? "bg-lime-100 text-lime-700" : "text-slate-600 hover:bg-slate-100"),
      pills: cn("py-2 px-4 rounded-full", isActive ? "bg-lime-500 text-white" : "text-slate-600 hover:bg-slate-100"),
      underline: cn(
        "py-3 px-4 border-b-2",
        isActive ? "border-lime-500 text-lime-700" : "border-transparent text-slate-600 hover:text-slate-800",
      ),
      cards: cn(
        "py-4 px-4 flex flex-col items-center gap-2 rounded-t-lg",
        isActive
          ? "bg-lime-50 text-lime-700 border-b-2 border-lime-500"
          : "text-slate-600 hover:bg-slate-50 border-b-2 border-transparent",
      ),
    }

    return cn(baseStyles, variantStyles[variant])
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "flex",
          variant === "cards" ? "border-b border-slate-200" : "",
          fullWidth ? "w-full grid" : "overflow-x-auto hide-scrollbar",
          fullWidth ? `grid-cols-${tabs.length}` : "",
        )}
      >
        {tabs.map((tab) => (
          <motion.div
            key={tab.id}
            variants={tabVariants}
            animate={activeTab === tab.id ? "active" : "inactive"}
            className={fullWidth ? "w-full" : ""}
          >
            <button type="button" onClick={() => onChange(tab.id)} className={getTabStyles(tab.id)}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

interface EnhancedTabsContentProps {
  id: string
  activeTab: string
  children: React.ReactNode
}

export function EnhancedTabsContent({ id, activeTab, children }: EnhancedTabsContentProps) {
  if (id !== activeTab) return null

  return (
    <motion.div key={id} initial="hidden" animate="visible" variants={contentVariants}>
      {children}
    </motion.div>
  )
}

