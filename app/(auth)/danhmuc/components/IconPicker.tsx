"use client"

import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Search, ChevronsUpDown } from "lucide-react"

// Import specific icons we want to use
import {
  FileText,
  Calendar,
  Clock,
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart,
  Bookmark,
  Box,
  Briefcase,
  Check,
  CheckCircle,
  Cloud,
  CloudRain,
  Compass,
  Crop,
  Droplet,
  Edit,
  Eye,
  FileCheck,
  Filter,
  Flag,
  Flower,
  Leaf,
  Heart,
  Home,
  Info,
  Layers,
  LifeBuoy,
  Map,
  MapPin,
  Microscope,
  Pencil,
  TreesIcon as Plant,
  Plus,
  Ruler,
  Scissors,
  SproutIcon as Seedling,
  Settings,
  ShoppingCart,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Tractor,
  Trash,
  Truck,
  Umbrella,
  User,
  Users,
  Zap,
} from "lucide-react"

// Create a map of icon names to components
const iconMap = {
  FileText,
  Calendar,
  Clock,
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart,
  Bookmark,
  Box,
  Briefcase,
  Check,
  CheckCircle,
  Cloud,
  CloudRain,
  Compass,
  Crop,
  Droplet,
  Edit,
  Eye,
  FileCheck,
  Filter,
  Flag,
  Flower,
  Leaf,
  Heart,
  Home,
  Info,
  Layers,
  LifeBuoy,
  Map,
  MapPin,
  Microscope,
  Pencil,
  Plant,
  Plus,
  Ruler,
  Scissors,
  Seedling,
  Settings,
  ShoppingCart,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Tractor,
  Trash,
  Truck,
  Umbrella,
  User,
  Users,
  Zap,
}

// Create a list of all icon names
const iconList = Object.keys(iconMap)

interface IconPickerProps {
  value?: string
  onChange: (value: string) => void
}

// Create a component that renders an icon by name
const DynamicIcon = ({ name, ...props }: { name: string; [key: string]: any }) => {
  const IconComponent = iconMap[name as keyof typeof iconMap]
  return IconComponent ? <IconComponent {...props} /> : <FileText {...props} />
}

export const IconPicker = ({ value = "FileText", onChange }: IconPickerProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredIcons, setFilteredIcons] = useState(iconList)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (searchTerm) {
      const filtered = iconList.filter((icon) => icon.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredIcons(filtered)
    } else {
      setFilteredIcons(iconList)
    }
  }, [searchTerm])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
        >
          <div className="flex items-center">
            <DynamicIcon name={value} className="mr-2 h-4 w-4" />
            <span>{value}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Tìm biểu tượng..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-4 gap-1 p-2">
            {filteredIcons.map((icon) => (
              <Button
                key={icon}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-md flex items-center justify-center",
                  value === icon && "bg-lime-100 text-lime-800",
                )}
                onClick={() => {
                  onChange(icon)
                  setIsOpen(false)
                }}
                title={icon}
              >
                <DynamicIcon name={icon} className="h-5 w-5" />
              </Button>
            ))}
            {filteredIcons.length === 0 && (
              <div className="col-span-4 py-6 text-center text-sm text-slate-500">
                Không tìm thấy biểu tượng phù hợp
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

// Export the DynamicIcon component as well for use in other components
IconPicker.Icon = DynamicIcon

