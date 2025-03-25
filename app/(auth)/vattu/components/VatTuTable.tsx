"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Edit,
  Trash2,
  MoreVertical,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  Clipboard,
} from "lucide-react"
import { format, isAfter, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import type { VatTu } from "../types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { useMediaQuery } from "../use-media-query"

interface VatTuTableProps {
  data: VatTu[]
  onEdit: (vatTu: VatTu) => void
  onDelete: (id: string) => void
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export default function VatTuTable({
  data,
  onEdit,
  onDelete,
  currentPage,
  itemsPerPage,
  onPageChange,
}: VatTuTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const formatDate = (dateString: string) =>
    dateString ? format(parseISO(dateString), "dd/MM/yyyy", { locale: vi }) : "N/A"
  const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount)
  const isExpired = (date: string) => date && isAfter(new Date(), parseISO(date))

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage)

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id)
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-lime-100 p-3 mb-4">
          <AlertCircle className="h-6 w-6 text-lime-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-1">Không có dữ liệu</h3>
        <p className="text-sm text-slate-500 max-w-md">Chưa có vật tư nào được thêm vào hệ thống.</p>
      </div>
    )
  }

  return (
    <>
      {isMobile ? (
        <div className="space-y-4">
          <AnimatePresence>
            {paginatedData.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.01 }}
                className="overflow-hidden"
              >
                <Card className="overflow-hidden border border-lime-100">
                  <div
                    className="p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExpand(item._id as string)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{item.ten}</div>
                      <div className="text-xs text-slate-500">{item.nhaCungCap || "Không có nhà cung cấp"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={item.loai === "thuốc" ? "destructive" : "secondary"}
                        className={`${item.huuCo ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}`}
                      >
                        {item.loai} {item.huuCo ? "(Hữu cơ)" : ""}
                      </Badge>
                      <span className={`text-sm font-medium ${item.soLuong <= 0 ? "text-red-500" : "text-slate-800"}`}>
                        {item.soLuong} {item.donViTinh}
                      </span>
                    </div>
                  </div>

                  {expandedItem === item._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-lime-100 bg-lime-50/50 p-4"
                    >
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-lime-600" />
                          <span className="text-slate-500">Đơn giá:</span>
                          <span className="font-medium">{formatCurrency(item.donGia)} đ</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-lime-600" />
                          <span className="text-slate-500">Hạn sử dụng:</span>
                          <span
                            className={isExpired(item.hanSuDung || "") ? "text-red-500 font-medium" : "font-medium"}
                          >
                            {item.hanSuDung ? formatDate(item.hanSuDung) : "N/A"}
                          </span>
                        </div>
                        {item.ghiChu && (
                          <div className="col-span-2 flex items-start gap-2 mt-2">
                            <Clipboard className="h-4 w-4 text-lime-600 mt-0.5" />
                            <div>
                              <span className="text-slate-500">Ghi chú:</span>
                              <p className="font-medium">{item.ghiChu}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(item)
                          }}
                          className="h-8 border-lime-200 hover:bg-lime-100"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1 text-lime-600" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteId(item._id as string)
                          }}
                          className="h-8 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-lime-50">
                <TableHead className="w-[250px] font-semibold text-lime-800">Tên vật tư</TableHead>
                <TableHead className="font-semibold text-lime-800">Loại</TableHead>
                <TableHead className="text-right font-semibold text-lime-800">Số lượng</TableHead>
                <TableHead className="text-right font-semibold text-lime-800">Đơn giá</TableHead>
                <TableHead className="text-right font-semibold text-lime-800">Hạn sử dụng</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {paginatedData.map((item) => (
                  <motion.tr
                    key={item._id}
                    className="hover:bg-lime-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-slate-800">{item.ten}</span>
                        {item.nhaCungCap && <span className="text-xs text-slate-500">{item.nhaCungCap}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.loai === "thuốc" ? "destructive" : "secondary"}
                        className={`${item.huuCo ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}`}
                      >
                        {item.loai} {item.huuCo ? "(Hữu cơ)" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={item.soLuong <= 0 ? "text-red-500" : "text-slate-800"}>
                        {item.soLuong} {item.donViTinh}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-slate-800">{formatCurrency(item.donGia)} đ</TableCell>
                    <TableCell className="text-right">
                      {item.hanSuDung ? (
                        <span className={isExpired(item.hanSuDung) ? "text-red-500" : "text-slate-800"}>
                          {formatDate(item.hanSuDung)}
                          {isExpired(item.hanSuDung) && " (Hết hạn)"}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-lime-100">
                              <MoreVertical className="h-4 w-4 text-lime-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Chỉnh sửa
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>Sửa thông tin vật tư</TooltipContent>
                              </Tooltip>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(item._id as string)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Xóa
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>Xóa vật tư này</TooltipContent>
                              </Tooltip>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TooltipProvider>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500">
            Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, data.length)} trên {data.length} vật tư
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 border-lime-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 border-lime-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vật tư này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && onDelete(deleteId)} className="bg-red-500 hover:bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

