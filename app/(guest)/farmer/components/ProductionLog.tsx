"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Leaf, Droplets, Tractor } from "lucide-react"

interface ProductionLogProps {
  farmingLogs: any[]
  seasons: any[]
}

export default function ProductionLog({ farmingLogs, seasons }: ProductionLogProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>("")

  // Group logs by stage (giaiDoan)
  const groupedLogs = useMemo(() => {
    // Filter logs by selected season if any
    const filteredLogs = selectedSeason ? farmingLogs.filter((log) => log.muaVuId === selectedSeason) : farmingLogs

    // Sort logs by date
    const sortedLogs = [...filteredLogs].sort((a, b) => {
      const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date(0)
        const [day, month, year] = dateStr.split("-").map(Number)
        return new Date(year, month - 1, day)
      }

      return parseDate(a.ngayThucHien).getTime() - parseDate(b.ngayThucHien).getTime()
    })

    // Group by stage
    return sortedLogs.reduce(
      (groups, item) => {
        const { giaiDoan } = item
        if (!giaiDoan) return groups

        if (!groups[giaiDoan]) {
          groups[giaiDoan] = []
        }
        groups[giaiDoan].push(item)
        return groups
      },
      {} as Record<string, any[]>,
    )
  }, [farmingLogs, selectedSeason])

  // Get stages
  const stages = useMemo(() => Object.keys(groupedLogs), [groupedLogs])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  }

  // Get icon for activity type
  const getActivityIcon = (activity: string) => {
    if (!activity) return <Tractor className="h-5 w-5 text-gray-500" />

    const activityLower = activity.toLowerCase()
    if (activityLower.includes("phân") || activityLower.includes("bon")) {
      return <Leaf className="h-5 w-5 text-green-600" />
    } else if (activityLower.includes("thuốc") || activityLower.includes("phun")) {
      return <Droplets className="h-5 w-5 text-blue-600" />
    } else {
      return <Tractor className="h-5 w-5 text-amber-600" />
    }
  }

  if (farmingLogs.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-600">Chưa có nhật ký sản xuất</h3>
        <p className="text-gray-500 mt-2">Nông hộ này chưa có nhật ký sản xuất nào được cập nhật.</p>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-bold text-green-800 pb-2 border-b border-green-100 w-full md:w-auto"
        >
          Nhật ký sản xuất
        </motion.h2>

        {seasons.length > 0 && (
          <motion.div variants={itemVariants} className="w-full md:w-64">
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn mùa vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mùa vụ</SelectItem>
                {seasons.map((season) => (
                  <SelectItem key={season._id} value={season._id}>
                    {season.muavu} {season.nam}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </div>

      {stages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Không có dữ liệu nhật ký sản xuất để hiển thị.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-green-200 z-0"></div>

          {/* Stages */}
          {stages.map((stage, stageIndex) => (
            <motion.div key={stage} variants={itemVariants} className="mb-10 relative z-10">
              {/* Stage header */}
              <div className="flex items-center mb-6">
                <div className="bg-green-600 text-white h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                  {stageIndex + 1}
                </div>
                <h3 className="ml-4 text-xl font-semibold text-green-800">{stage}</h3>
              </div>

              {/* Activities in this stage */}
              <div className="ml-6 space-y-6">
                {groupedLogs[stage].map((log, logIndex) => (
                  <Card key={log._id || logIndex} className="border-none shadow-md overflow-hidden">
                    <CardHeader className="bg-green-50 pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-medium text-green-800 flex items-center">
                          {getActivityIcon(log.congViec)}
                          <span className="ml-2">{log.congViec || "Hoạt động canh tác"}</span>
                        </CardTitle>
                        <Badge variant="outline" className="bg-white">
                          {log.ngayThucHien}
                          {log.ngaySauBatDau && Number.parseInt(log.ngaySauBatDau) > 0 && ` - ${log.ngaySauBatDau} NSS`}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {log.chiTietCongViec && <p className="text-gray-700 mb-4">{log.chiTietCongViec}</p>}

                      {/* Agrochemicals used */}
                      {log.agrochemicals && log.agrochemicals.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Vật tư sử dụng:</h4>
                          <ul className="space-y-1">
                            {log.agrochemicals.map((agro, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-center">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></span>
                                {agro.name} - {agro.lieuLuong} {agro.donViTinh}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Activity image */}
                      {log.image && (
                        <div className="mt-4">
                          <img
                            src={log.image}
                            alt="Hình ảnh hoạt động"
                            className="w-full h-auto max-h-60 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

