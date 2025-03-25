"use client"

// components/Tabs.tsx
import type React from "react"
import { useState } from "react"
import { EnhancedTabs, EnhancedTabsContent } from "@/components/ui/enhanced-tabs"

interface TabsProps {
  children: React.ReactElement[]
  variant?: "default" | "pills" | "underline" | "cards"
}

const Tabs: React.FC<TabsProps> = ({ children, variant = "default" }) => {
  const [activeTab, setActiveTab] = useState(children[0].props.label)

  // For backward compatibility with the old Tab component
  const handleTabClick = (label: string) => {
    setActiveTab(label)
  }

  // Convert children to tab format for EnhancedTabs
  const tabs = children.map((child) => ({
    id: child.props.label,
    label: child.props.label,
    icon: child.props.icon,
  }))

  return (
    <div>
      <EnhancedTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant={variant} className="mb-5" />

      {children.map((child) => (
        <EnhancedTabsContent key={child.props.label} id={child.props.label} activeTab={activeTab}>
          {child.props.children}
        </EnhancedTabsContent>
      ))}
    </div>
  )
}

export default Tabs

