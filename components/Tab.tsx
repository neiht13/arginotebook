"use client"

// Update the Tab component to support icons
import type React from "react"

interface TabProps {
  label: string
  active: boolean
  onClick: () => void
  icon?: React.ReactNode
}

const Tab: React.FC<TabProps> = ({ label, active, onClick, icon }) => {
  return (
    <button
      className={`px-4 py-2 mr-2 rounded-t-lg transition-all duration-200 ${
        active ? "bg-lime-100 text-lime-700 font-medium" : "bg-white text-slate-600 hover:bg-slate-50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {icon && icon}
        <span>{label}</span>
      </div>
    </button>
  )
}

export default Tab

