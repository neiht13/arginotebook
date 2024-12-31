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

export default function TaskTable({ data, onEdit }) {
  return (
    <div className="h-auto bg-gray-100 flex items-center justify-center p-4">
      {/* Desktop view */}
      <div className="hidden md:block w-full max-w-6xl">
        <Card className="w-full shadow-lg rounded-lg bg-white">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-extrabold text-gray-800">
              📋 Danh Sách Công Việc
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Công Việc</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giai Đoạn</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi Tiết Công Việc</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi Chú</TableHead>
                  <TableHead className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((task, index) => (
                  <motion.tr
                    key={task._id}
                    whileHover={{ scale: 1.02, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50 transition"
                  >
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{task.stt}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{task.tenCongViec}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.tenGiaiDoan}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.chitietcongviec}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.ghichu}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                      <Button
                        variant="ghost"
                        onClick={() => onEdit(task)}
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
        {data.map((task, index) => (
          <Card key={task._id} className="shadow-md rounded-lg bg-white">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">STT:</span>
                  <span className="text-gray-600">{task.stt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">Tên Công Việc:</span>
                  <span className="text-gray-600">{task.tenCongViec}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">Giai Đoạn:</span>
                  <span className="text-gray-600">{task.tenGiaiDoan}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">Chi Tiết Công Việc:</span>
                  <span className="text-sm text-gray-600">{task.chitietcongviec}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">Ghi Chú:</span>
                  <span className="text-sm text-gray-600">{task.ghichu}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => onEdit(task)}
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
