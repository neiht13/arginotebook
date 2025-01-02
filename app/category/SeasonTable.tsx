"use client"

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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Edit2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SeasonTable({ data, onEdit }) {
  return (
    <div className="h-auto bg-slate-100 flex items-center justify-center p-4">
      {/* Desktop view */}
      <div className="hidden md:block w-full max-w-6xl">
        <Card className="w-full shadow-lg rounded-lg bg-white">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-extrabold text-slate-800">
              📅 Danh Sách Mùa Vụ
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mùa Vụ</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Năm</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày Bắt Đầu</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phương Pháp</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Giống</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Diện Tích</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Số Lượng</TableHead>
                  <TableHead className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((season, index) => (
                  <motion.tr
                    key={season._id}
                    whileHover={{ scale: 1.02, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-slate-50 transition"
                  >
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{season.muavu}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{season.nam}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{season.ngaybatdau}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{season.phuongphap}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{season.giong}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{season.dientich}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{season.soluong}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                      <Button
                        variant="ghost"
                        onClick={() => onEdit(season)}
                        className="flex items-center justify-center text-cyan-500 hover:text-cyan-700 transition"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Sửa
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4 w-full max-w-md">
        {data.map((season, index) => (
          <Card key={season._id} className="shadow-md rounded-lg bg-white">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Mùa Vụ:</span>
                  <span className="text-slate-600">{season.muavu}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Năm:</span>
                  <span className="text-slate-600">{season.nam}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Ngày Bắt Đầu:</span>
                  <span className="text-slate-600">{season.ngaybatdau}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Phương Pháp:</span>
                  <span className="text-slate-600">{season.phuongphap}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Giống:</span>
                  <span className="text-slate-600">{season.giong}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Diện Tích:</span>
                  <span className="text-slate-600">{season.dientich}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Số Lượng:</span>
                  <span className="text-slate-600">{season.soluong}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => onEdit(season)}
                className="w-full flex items-center justify-center text-cyan-500 hover:text-cyan-700 transition"
                variant="ghost"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Sửa
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
