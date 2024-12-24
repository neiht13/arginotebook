import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export default function TaskTable({ data, onEdit }) {
  return (
    <div>
      {/* Desktop view */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên công việc</TableHead>
              <TableHead>Giai đoạn</TableHead>
              <TableHead>Chi tiết công việc</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.stt}</TableCell>
                <TableCell>{task.tenCongViec}</TableCell>
                <TableCell>{task.tenGiaiDoan}</TableCell>
                <TableCell>{task.chitietcongviec}</TableCell>
                <TableCell>{task.ghichu}</TableCell>
                <TableCell>
                  <Button onClick={() => onEdit(task)}>Sửa</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {data.map((task) => (
          <Card key={task._id}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold">STT:</span>
                  <span>{task.stt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Tên công việc:</span>
                  <span>{task.tenCongViec}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Giai đoạn:</span>
                  <span>{task.tenGiaiDoan}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Chi tiết công việc:</span>
                  <span className="text-sm">{task.chitietcongviec}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Ghi chú:</span>
                  <span className="text-sm">{task.ghichu}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => onEdit(task)} className="w-full">Sửa</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

