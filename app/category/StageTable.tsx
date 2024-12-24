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

export default function StageTable({ data, onEdit }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Desktop view */}
      <div className="hidden md:block w-full max-w-6xl">
        <Card className="w-full shadow-lg rounded-lg bg-white">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-extrabold text-gray-800">
              📊 Danh Sách Giai Đoạn
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giai Đoạn</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Giai Đoạn</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Màu Sắc</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi Chú</TableHead>
                  <TableHead className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((stage, index) => (
                  <motion.tr
                    key={stage._id}
                    whileHover={{ scale: 1.02, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50 transition"
                  >
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stage.giaidoan}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stage.tengiaidoan}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: stage.color }}></div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stage.ghichu}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                      <Button
                        variant="ghost"
                        onClick={() => onEdit(stage)}
                        className="flex items-center justify-center text-blue-500 hover:text-blue-700 transition"
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
        {data.map((stage, index) => (
          <Card key={stage._id} className="shadow-md rounded-lg bg-white">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">Giai Đoạn:</span>
                  <span className="text-gray-600">{stage.giaidoan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">Tên Giai Đoạn:</span>
                  <span className="text-gray-600">{stage.tengiaidoan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">Màu Sắc:</span>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: stage.color }}></div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">Ghi Chú:</span>
                  <span className="text-sm text-gray-600">{stage.ghichu}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => onEdit(stage)}
                className="w-full flex items-center justify-center text-blue-500 hover:text-blue-700 transition"
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
