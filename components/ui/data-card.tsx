"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface DataCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  onClick?: () => void
}

export function DataCard({ title, value, icon, description, trend, className, onClick }: DataCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "overflow-hidden transition-all duration-200 hover:shadow-md",
          onClick && "cursor-pointer",
          className,
        )}
        onClick={onClick}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
          {icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-lime-100 text-lime-700">{icon}</div>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">{value}</div>
          {(description || trend) && (
            <div className="flex items-center mt-1">
              {trend && (
                <span className={cn("text-xs font-medium mr-2", trend.isPositive ? "text-green-600" : "text-red-600")}>
                  {trend.isPositive ? "+" : "-"}
                  {trend.value}%
                </span>
              )}
              {description && <span className="text-xs text-slate-500">{description}</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

