"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, MoreVertical, AlertCircle } from "lucide-react"
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

interface VatTuTableProps {
  data: VatTu[]
  onEdit: (vatTu: VatTu) => void
  onDelete: (id: string) => void
}

export default function VatTuTable({ data, onEdit, onDelete }: VatTuTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const cancelDelete = () => {
    setDeleteId(null)
  }

  const isExpired = (date: string) => {
    if (!date) return false
    try {
      return isAfter(new Date(), parseISO(date))
    } catch (error) {
      return false
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: vi })
    } catch (error) {
      return dateString
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount)
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-slate-100 p-3 mb-4">
          <AlertCircle className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">Không có dữ liệu</h3>
        <p className="text-sm text-slate-500 max-w-md">
          Chưa có vật tư nào được thêm vào hệ thống. Hãy thêm vật tư mới để quản lý.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[250px]">Tên vật tư</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead className="text-right">Đơn giá</TableHead>
              <TableHead className="text-right">Hạn sử dụng</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{item.ten}</span>
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
                  <span className={item.soLuong <= 0 ? "text-red-500" : ""}>
                    {item.soLuong} {item.donViTinh}
                  </span>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(item.donGia)} đ</TableCell>
                <TableCell className="text-right">
                  {item.hanSuDung ? (
                    <span className={isExpired(item.hanSuDung) ? "text-red-500" : ""}>
                      {formatDate(item.hanSuDung)}
                      {isExpired(item.hanSuDung) && " (Hết hạn)"}
                    </span>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(item._id as string)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vật tư này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

