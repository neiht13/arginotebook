"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const cropData = {
  rice: [
    { 
      stage: 'Gieo mạ', 
      duration: '15-20 ngày',
      recommendations: [
        'Chuẩn bị đất kỹ, đảm bảo độ ẩm thích hợp',
        'Sử dụng hạt giống chất lượng cao',
        'Kiểm soát mực nước trong ruộng mạ'
      ]
    },
    { 
      stage: 'Cấy', 
      duration: '1-2 ngày',
      recommendations: [
        'Cấy khi cây mạ đạt 3-4 lá',
        'Đảm bảo khoảng cách cấy phù hợp',
        'Cấy nông và thẳng hàng'
      ]
    },
    { 
      stage: 'Đẻ nhánh', 
      duration: '15-20 ngày',
      recommendations: [
        'Duy trì mực nước thích hợp',
        'Bón phân cân đối NPK',
        'Theo dõi và phòng trừ sâu bệnh'
      ]
    },
    { 
      stage: 'Làm đòng', 
      duration: '20-25 ngày',
      recommendations: [
        'Tăng cường bón phân kali',
        'Kiểm soát mực nước để tránh ngập úng',
        'Phòng trừ sâu cuốn lá, đạo ôn'
      ]
    },
    { 
      stage: 'Trổ bông', 
      duration: '7-10 ngày',
      recommendations: [
        'Duy trì độ ẩm đất thích hợp',
        'Tránh sử dụng thuốc trừ sâu trong giai đoạn này',
        'Bảo vệ bông lúa khỏi các tác động bên ngoài'
      ]
    },
    { 
      stage: 'Chín', 
      duration: '25-30 ngày',
      recommendations: [
        'Giảm dần mực nước trong ruộng',
        'Chuẩn bị công cụ thu hoạch',
        'Thu hoạch khi 85-90% hạt chín vàng'
      ]
    },
  ],
  corn: [
    { 
      stage: 'Gieo hạt', 
      duration: '5-7 ngày',
      recommendations: [
        'Chọn giống ngô phù hợp với điều kiện địa phương',
        'Xử lý hạt giống trước khi gieo',
        'Đảm bảo độ sâu gieo hạt thích hợp'
      ]
    },
    { 
      stage: 'Nảy mầm', 
      duration: '7-10 ngày',
      recommendations: [
        'Duy trì độ ẩm đất thích hợp',
        'Bảo vệ cây con khỏi côn trùng gây hại',
        'Chuẩn bị kế hoạch tưới tiêu'
      ]
    },
    { 
      stage: 'Phát triển thân lá', 
      duration: '30-40 ngày',
      recommendations: [
        'Bón phân đầy đủ theo nhu cầu của cây',
        'Làm cỏ và vun gốc định kỳ',
        'Theo dõi và phòng trừ sâu bệnh'
      ]
    },
    { 
      stage: 'Ra hoa', 
      duration: '15-20 ngày',
      recommendations: [
        'Đảm bảo đủ nước trong giai đoạn này',
        'Tránh sử dụng thuốc trừ sâu ảnh hưởng đến quá trình thụ phấn',
        'Bổ sung phân bón lá nếu cần thiết'
      ]
    },
    { 
      stage: 'Phát triển bắp', 
      duration: '20-30 ngày',
      recommendations: [
        'Tiếp tục cung cấp đủ nước và dinh dưỡng',
        'Phòng trừ sâu đục bắp và các loại sâu bệnh khác',
        'Tỉa bỏ các bắp phụ nếu cần'
      ]
    },
    { 
      stage: 'Chín', 
      duration: '20-30 ngày',
      recommendations: [
        'Giảm lượng nước tưới',
        'Chuẩn bị kế hoạch thu hoạch',
        'Thu hoạch khi hạt đã chín hoàn toàn'
      ]
    },
  ],
}


export default function CropCalendar() {
  const [selectedCrop, setSelectedCrop] = useState('rice')

  return (
    <div className="h-auto w-auto bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-lg rounded-lg bg-white">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-extrabold text-gray-800 flex items-center">
            🌱 Lịch Mùa Vụ
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-6">
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="Chọn cây trồng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rice">Lúa</SelectItem>
                <SelectItem value="corn">Ngô</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="">
            <Table className="w-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giai Đoạn</TableHead>
                  <TableHead className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời Gian</TableHead>
                  <TableHead className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khuyến Cáo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cropData[selectedCrop].map((stage, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 transition">
                    <TableCell className="py-2  whitespace-nowrap">
                      <span className="font-medium text-gray-700">{stage.stage}</span>
                    </TableCell>
                    <TableCell className="py-2 whitespace-nowrap text-gray-500">{stage.duration}</TableCell>
                    <TableCell className="py-2  whitespace-nowrap">
                      <Accordion type="single" collapsible>
                        <AccordionItem value={`item-${index}`}>
                          <AccordionTrigger className="flex items-center text-blue-600 hover:text-blue-800 transition">
                            Xem chi tiết
                          </AccordionTrigger>
                          <AnimatePresence>
                            <AccordionContent>
                              <motion.ul
                                className="list-disc pl-5 space-y-1 text-gray-600"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                {stage.recommendations.map((rec, recIndex) => (
                                  <li key={recIndex} className='whitespace-break-spaces'>{rec}</li>
                                ))}
                              </motion.ul>
                            </AccordionContent>
                          </AnimatePresence>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}