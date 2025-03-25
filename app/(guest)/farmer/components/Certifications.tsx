"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Award, Calendar, Building, FileImage } from "lucide-react"

interface CertificationsProps {
  certifications: any[]
}

export default function Certifications({ certifications }: CertificationsProps) {
  const [selectedCertification, setSelectedCertification] = useState<any | null>(null)

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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-yellow-100 text-yellow-800"
      case "revoked":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Còn hiệu lực"
      case "expired":
        return "Hết hạn"
      case "revoked":
        return "Đã thu hồi"
      default:
        return "Không xác định"
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi })
    } catch (error) {
      return "Không xác định"
    }
  }

  if (certifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-600">Chưa có chứng nhận</h3>
        <p className="text-gray-500 mt-2">Nông hộ này chưa có chứng nhận nào được cập nhật.</p>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.h2
        variants={itemVariants}
        className="text-2xl font-bold text-green-800 mb-6 pb-2 border-b border-green-100"
      >
        Chứng nhận
      </motion.h2>

      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((cert) => (
          <motion.div key={cert._id} variants={itemVariants}>
            <Card
              className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer border-none shadow-md"
              onClick={() => setSelectedCertification(cert)}
            >
              <CardHeader className="pb-2 bg-green-50">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold text-green-800">{cert.name}</CardTitle>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                      cert.status,
                    )}`}
                  >
                    {getStatusText(cert.status)}
                  </span>
                </div>
                <CardDescription className="flex items-center text-slate-600">
                  <Building className="h-3.5 w-3.5 mr-1" />
                  {cert.issuer}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-4 flex-grow">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-slate-600">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                    <span>Ngày cấp: {formatDate(cert.issueDate)}</span>
                  </div>

                  {cert.expiryDate && (
                    <div className="flex items-center text-slate-600">
                      <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                      <span>Ngày hết hạn: {formatDate(cert.expiryDate)}</span>
                    </div>
                  )}

                  {cert.description && <p className="text-slate-600 mt-2 line-clamp-2">{cert.description}</p>}
                </div>

                {cert.imageUrl && (
                  <div className="mt-4 relative h-32 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={cert.imageUrl || "/placeholder.svg"}
                      alt={cert.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <FileImage className="h-8 w-8 text-white drop-shadow-md" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Certification Detail Dialog */}
      <Dialog open={!!selectedCertification} onOpenChange={(open) => !open && setSelectedCertification(null)}>
        <DialogContent className="max-w-3xl">
          {selectedCertification && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedCertification.name}</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Đơn vị cấp</h4>
                    <p className="text-gray-900 flex items-center">
                      <Building className="h-4 w-4 mr-2 text-green-600" />
                      {selectedCertification.issuer}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Ngày cấp</h4>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      {formatDate(selectedCertification.issueDate)}
                    </p>
                  </div>

                  {selectedCertification.expiryDate && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Ngày hết hạn</h4>
                      <p className="text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-green-600" />
                        {formatDate(selectedCertification.expiryDate)}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Trạng thái</h4>
                    <p
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 ${getStatusColor(
                        selectedCertification.status,
                      )}`}
                    >
                      {getStatusText(selectedCertification.status)}
                    </p>
                  </div>

                  {selectedCertification.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Mô tả</h4>
                      <p className="text-gray-900 whitespace-pre-line">{selectedCertification.description}</p>
                    </div>
                  )}
                </div>

                {selectedCertification.imageUrl && (
                  <div className="relative rounded-md overflow-hidden bg-gray-100 aspect-square">
                    <img
                      src={selectedCertification.imageUrl || "/placeholder.svg"}
                      alt={selectedCertification.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

