"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Users, Ruler, Calendar } from "lucide-react"

interface FarmerInfoProps {
  user: any
}

export default function FarmerInfo({ user }: FarmerInfoProps) {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl font-bold text-green-800 mb-6 pb-2 border-b border-green-100">Thông tin nông hộ</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information Card */}
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-green-50 pb-4">
              <CardTitle className="text-green-800">Thông tin cơ bản</CardTitle>
              <CardDescription>Thông tin liên hệ và chi tiết về nông hộ</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-20 w-20 border-2 border-green-100">
                  <AvatarImage
                    src={
                      user.avatar || user.image
                        ? `https://gaochauthanhdt.vn/api/images/download?filename=${user.avatar || user.image}`
                        : "/placeholder.svg?height=80&width=80"
                    }
                    alt={user.name}
                  />
                  <AvatarFallback className="bg-green-100 text-green-800 text-xl">
                    {user.name?.charAt(0)?.toUpperCase() || "N"}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-3 flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>

                  <div className="space-y-2 text-sm">
                    {user.diachi && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                        <span>{user.diachi}</span>
                      </div>
                    )}

                    {user.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-green-600" />
                        <span>{user.phone}</span>
                      </div>
                    )}

                    {user.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-green-600" />
                        <span>{user.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farming Details Card */}
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-green-50 pb-4">
              <CardTitle className="text-green-800">Chi tiết canh tác</CardTitle>
              <CardDescription>Thông tin về hoạt động canh tác</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {user.donvihtx && (
                  <div className="flex items-start">
                    <Users className="h-5 w-5 mr-3 mt-0.5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-700">Hợp tác xã</p>
                      <p>{user.donvihtx}</p>
                    </div>
                  </div>
                )}

                {user.dientich && (
                  <div className="flex items-start">
                    <Ruler className="h-5 w-5 mr-3 mt-0.5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-700">Diện tích canh tác</p>
                      <p>
                        {user.dientich} {user.donVi || "ha"}
                      </p>
                    </div>
                  </div>
                )}

                {user.namHoatDong && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-3 mt-0.5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-700">Hoạt động từ</p>
                      <p>{user.namHoatDong}</p>
                    </div>
                  </div>
                )}

                {user.loaiCayTrong && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-700 mb-2">Loại cây trồng</p>
                    <div className="flex flex-wrap gap-2">
                      {user.loaiCayTrong.split(",").map((crop, index) => (
                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {crop.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description Card */}
        {user.description && (
          <Card className="mt-6 overflow-hidden border-none shadow-md">
            <CardHeader className="bg-green-50 pb-4">
              <CardTitle className="text-green-800">Giới thiệu</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 whitespace-pre-line">{user.description}</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}

