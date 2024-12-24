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

export default function SeasonTable({ data, onEdit }) {
  return (
    <div>
      {/* Desktop view */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mùa vụ</TableHead>
              <TableHead>Năm</TableHead>
              <TableHead>Ngày bắt đầu</TableHead>
              <TableHead>Phương pháp</TableHead>
              <TableHead>Giống</TableHead>
              <TableHead>Diện tích</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((season) => (
              <TableRow key={season._id}>
                <TableCell>{season.muavu}</TableCell>
                <TableCell>{season.nam}</TableCell>
                <TableCell>{season.ngaybatdau}</TableCell>
                <TableCell>{season.phuongphap}</TableCell>
                <TableCell>{season.giong}</TableCell>
                <TableCell>{season.dientich}</TableCell>
                <TableCell>{season.soluong}</TableCell>
                <TableCell>
                  <Button onClick={() => onEdit(season)}>Sửa</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {data.map((season) => (
          <Card key={season._id}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold">Mùa vụ:</span>
                  <span>{season.muavu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Năm:</span>
                  <span>{season.nam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Ngày bắt đầu:</span>
                  <span>{season.ngaybatdau}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Phương pháp:</span>
                  <span>{season.phuongphap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Giống:</span>
                  <span>{season.giong}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Diện tích:</span>
                  <span>{season.dientich}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Số lượng:</span>
                  <span>{season.soluong}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => onEdit(season)} className="w-full">Sửa</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
