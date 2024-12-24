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

export default function StageTable({ data, onEdit }) {
  return (
    <div>
      {/* Desktop view */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Giai đoạn</TableHead>
              <TableHead>Tên giai đoạn</TableHead>
              <TableHead>Màu sắc</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((stage) => (
              <TableRow key={stage._id}>
                <TableCell>{stage.giaidoan}</TableCell>
                <TableCell>{stage.tengiaidoan}</TableCell>
                <TableCell>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: stage.color }}></div>
                </TableCell>
                <TableCell>{stage.ghichu}</TableCell>
                <TableCell>
                  <Button onClick={() => onEdit(stage)}>Sửa</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {data.map((stage) => (
          <Card key={stage._id}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Giai đoạn:</span>
                  <span>{stage.giaidoan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Tên giai đoạn:</span>
                  <span>{stage.tengiaidoan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Màu sắc:</span>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: stage.color }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Ghi chú:</span>
                  <span>{stage.ghichu}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => onEdit(stage)} className="w-full">Sửa</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

