"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const cropData: Record<
  string,
  {
    stage: string
    duration: string
    recommendations: string[]
  }[]
> = {
  rice: [
    {
      stage: "Gieo mạ",
      duration: "15-20 ngày",
      recommendations: [
        "Chuẩn bị đất kỹ, đảm bảo độ ẩm thích hợp",
        "Sử dụng hạt giống chất lượng cao",
        "Kiểm soát mực nước trong ruộng mạ",
      ],
    },
    {
      stage: "Cấy",
      duration: "1-2 ngày",
      recommendations: [
        "Cấy khi cây mạ đạt 3-4 lá",
        "Đảm bảo khoảng cách cấy phù hợp",
        "Cấy nông và thẳng hàng",
      ],
    },
    {
      stage: "Đẻ nhánh",
      duration: "15-20 ngày",
      recommendations: [
        "Duy trì mực nước thích hợp",
        "Bón phân cân đối NPK",
        "Theo dõi và phòng trừ sâu bệnh",
      ],
    },
    {
      stage: "Làm đòng",
      duration: "20-25 ngày",
      recommendations: [
        "Tăng cường bón phân kali",
        "Kiểm soát mực nước để tránh ngập úng",
        "Phòng trừ sâu cuốn lá, đạo ôn",
      ],
    },
    {
      stage: "Trổ bông",
      duration: "7-10 ngày",
      recommendations: [
        "Duy trì độ ẩm đất thích hợp",
        "Tránh sử dụng thuốc trừ sâu trong giai đoạn này",
        "Bảo vệ bông lúa khỏi các tác động bên ngoài",
      ],
    },
    {
      stage: "Chín",
      duration: "25-30 ngày",
      recommendations: [
        "Giảm dần mực nước trong ruộng",
        "Chuẩn bị công cụ thu hoạch",
        "Thu hoạch khi 85-90% hạt chín vàng",
      ],
    },
  ],
  corn: [
    {
      stage: "Gieo hạt",
      duration: "5-7 ngày",
      recommendations: [
        "Chọn giống ngô phù hợp với điều kiện địa phương",
        "Xử lý hạt giống trước khi gieo",
        "Đảm bảo độ sâu gieo hạt thích hợp",
      ],
    },
    {
      stage: "Nảy mầm",
      duration: "7-10 ngày",
      recommendations: [
        "Duy trì độ ẩm đất thích hợp",
        "Bảo vệ cây con khỏi côn trùng gây hại",
        "Chuẩn bị kế hoạch tưới tiêu",
      ],
    },
    {
      stage: "Phát triển thân lá",
      duration: "30-40 ngày",
      recommendations: [
        "Bón phân đầy đủ theo nhu cầu của cây",
        "Làm cỏ và vun gốc định kỳ",
        "Theo dõi và phòng trừ sâu bệnh",
      ],
    },
    {
      stage: "Ra hoa",
      duration: "15-20 ngày",
      recommendations: [
        "Đảm bảo đủ nước trong giai đoạn này",
        "Tránh sử dụng thuốc trừ sâu ảnh hưởng đến quá trình thụ phấn",
        "Bổ sung phân bón lá nếu cần thiết",
      ],
    },
    {
      stage: "Phát triển bắp",
      duration: "20-30 ngày",
      recommendations: [
        "Tiếp tục cung cấp đủ nước và dinh dưỡng",
        "Phòng trừ sâu đục bắp và các loại sâu bệnh khác",
        "Tỉa bỏ các bắp phụ nếu cần",
      ],
    },
    {
      stage: "Chín",
      duration: "20-30 ngày",
      recommendations: [
        "Giảm lượng nước tưới",
        "Chuẩn bị kế hoạch thu hoạch",
        "Thu hoạch khi hạt đã chín hoàn toàn",
      ],
    },
  ],

  // Thêm các loại cây ăn trái
  mango: [
    {
      stage: "Giai đoạn cây con",
      duration: "6-12 tháng",
      recommendations: [
        "Chọn giống xoài phù hợp (có chất lượng, năng suất tốt)",
        "Tưới nước thường xuyên nhưng tránh ngập úng",
        "Bón phân hữu cơ định kỳ giúp bộ rễ phát triển tốt",
      ],
    },
    {
      stage: "Phát triển cành lá",
      duration: "1-2 năm",
      recommendations: [
        "Cắt tỉa cành vượt, tạo tán cây thông thoáng",
        "Bón phân NPK cân đối, tăng kali để cành lá khỏe",
        "Kiểm tra sâu bệnh (sâu đục thân, rầy, nhện...) và xử lý kịp thời",
      ],
    },
    {
      stage: "Ra hoa, đậu trái",
      duration: "2-3 tuần",
      recommendations: [
        "Không phun thuốc trừ sâu độc hại vào thời điểm hoa nở",
        "Bón bổ sung phân bón lá, vi lượng để hỗ trợ đậu trái",
        "Giữ đất ẩm vừa phải, tránh úng nước",
      ],
    },
    {
      stage: "Nuôi trái",
      duration: "3-4 tháng",
      recommendations: [
        "Tăng cường phân kali, canxi để trái cứng và ngọt",
        "Tỉa bớt trái non nếu quá nhiều để tránh cây kiệt sức",
        "Thường xuyên kiểm tra sâu, bệnh, nấm trên trái",
      ],
    },
    {
      stage: "Thu hoạch",
      duration: "Tùy giống (khoảng 3-6 tháng sau khi đậu trái)",
      recommendations: [
        "Thu hái khi vỏ trái chuyển màu và độ chín phù hợp",
        "Tránh làm trầy xước vỏ trái, ảnh hưởng chất lượng",
        "Bảo quản nơi thoáng mát, tránh nắng trực tiếp",
      ],
    },
  ],

  longan: [
    {
      stage: "Giai đoạn cây con",
      duration: "6-12 tháng",
      recommendations: [
        "Giâm cành hoặc ghép cành từ giống nhãn chất lượng",
        "Duy trì độ ẩm đất, che chắn gió mạnh",
        "Bón phân hữu cơ cho cây con nhanh phát triển",
      ],
    },
    {
      stage: "Phát triển tán cây",
      duration: "1-2 năm",
      recommendations: [
        "Cắt tỉa cành rậm, tạo tán cân đối",
        "Bón phân NPK, chú ý phân lân để kích thích rễ",
        "Phòng trừ côn trùng (rệp sáp, ruồi vàng...)",
      ],
    },
    {
      stage: "Ra hoa, đậu quả",
      duration: "2-3 tuần",
      recommendations: [
        "Giữ ẩm đất, tránh để cây bị hạn",
        "Không phun thuốc trừ sâu độc khi hoa nở",
        "Bổ sung phân vi lượng, canxi nếu cần",
      ],
    },
    {
      stage: "Nuôi quả",
      duration: "3-4 tháng",
      recommendations: [
        "Kiểm tra bệnh sương mai, đốm lá nhãn",
        "Bón phân kali, canxi để quả to và ngọt",
        "Hạn chế lượng nước tưới nếu mưa nhiều",
      ],
    },
    {
      stage: "Thu hoạch",
      duration: "Khi quả vỏ hơi nâu vàng, vị ngọt đậm",
      recommendations: [
        "Thu hái nhẹ nhàng, tránh xây xát quả",
        "Bảo quản nơi thoáng mát",
        "Phân loại và đóng gói cẩn thận nếu vận chuyển xa",
      ],
    },
  ],

  jackfruit: [
    {
      stage: "Giai đoạn cây con",
      duration: "4-8 tháng",
      recommendations: [
        "Chọn giống mít có năng suất, chất lượng thịt dày",
        "Giữ ẩm đất ổn định, che nắng cho cây non",
        "Bón phân hữu cơ giúp cây phát triển bộ rễ khỏe",
      ],
    },
    {
      stage: "Phát triển thân, tán",
      duration: "1-2 năm",
      recommendations: [
        "Cắt tỉa cành để tạo thân chính vững chắc",
        "Phòng trừ sâu đục thân, sâu ăn lá",
        "Bón phân đạm, lân, kali định kỳ",
      ],
    },
    {
      stage: "Ra hoa, đậu quả",
      duration: "2-3 tuần",
      recommendations: [
        "Kiểm soát nước tưới, tránh úng",
        "Thụ phấn bổ sung nếu cần (tùy giống)",
        "Tránh phun thuốc độc khi hoa nở",
      ],
    },
    {
      stage: "Nuôi quả",
      duration: "3-5 tháng",
      recommendations: [
        "Chống đỡ cành quả nặng, tránh gãy đổ",
        "Bón phân kali, vi lượng hỗ trợ trái to, múi dày",
        "Kiểm soát sâu đục quả, nấm mốc",
      ],
    },
    {
      stage: "Thu hoạch",
      duration: "Khi quả chuyển màu nâu vàng, có mùi thơm đặc trưng",
      recommendations: [
        "Cắt sát cuống, tránh để mủ chảy nhiều",
        "Bảo quản nơi khô ráo, thoáng mát",
        "Chế biến ngay nếu độ chín cao, tránh hư hỏng",
      ],
    },
  ],

  durian: [
    {
      stage: "Giai đoạn cây con",
      duration: "6-12 tháng",
      recommendations: [
        "Chọn giống sầu riêng (Ri6, Musang King, Monthong...) chất lượng",
        "Che nắng, giữ ẩm, bón phân hữu cơ",
        "Phòng trừ nấm rễ, úng nước",
      ],
    },
    {
      stage: "Phát triển cành lá",
      duration: "1-3 năm",
      recommendations: [
        "Cắt tỉa cành, tạo tán thoáng",
        "Bón phân NPK đầy đủ, trọng điểm vào đạm & kali",
        "Theo dõi sâu đục thân, bọ xít muỗi gây hại",
      ],
    },
    {
      stage: "Ra hoa",
      duration: "2-3 tuần",
      recommendations: [
        "Hạn chế tưới nhiều nước, tránh rụng hoa",
        "Không phun thuốc trừ sâu độc, ảnh hưởng côn trùng thụ phấn",
        "Tạo điều kiện cho ong, bướm tham gia thụ phấn",
      ],
    },
    {
      stage: "Đậu quả, nuôi quả",
      duration: "3-4 tháng",
      recommendations: [
        "Bón phân kali, canxi, vi lượng thường xuyên",
        "Tỉa bớt trái non, đảm bảo mật độ thích hợp",
        "Chống đỡ cành có nhiều quả, tránh gãy",
      ],
    },
    {
      stage: "Thu hoạch",
      duration: "Khi trái có gai nở, vỏ chuyển màu",
      recommendations: [
        "Thu hái nhẹ nhàng, tránh va đập",
        "Kiểm tra độ chín (có thể ngửi mùi đặc trưng)",
        "Bảo quản khô thoáng, tiêu thụ sớm",
      ],
    },
  ],
}

export default function CropCalendar() {
  const [selectedCrop, setSelectedCrop] = useState("rice")

  return (
    <div
      className="min-h-screen w-full
                 flex items-center justify-center p-6"
    >
      <Card className="max-w-5xl w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl">
        <CardHeader className="border-b border-slate-200 px-6 py-4">
          <CardTitle className="text-4xl font-extrabold text-slate-800">
            🌱 Lịch Mùa Vụ
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 py-6 space-y-4">
          {/* Select loại cây trồng */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <Select
              value={selectedCrop}
              onValueChange={setSelectedCrop}
            >
              <SelectTrigger className="w-64 border border-slate-300 shadow-sm">
                <SelectValue placeholder="Chọn cây trồng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rice">Lúa</SelectItem>
                <SelectItem value="corn">Ngô</SelectItem>
                <SelectItem value="mango">Xoài</SelectItem>
                <SelectItem value="longan">Nhãn</SelectItem>
                <SelectItem value="jackfruit">Mít</SelectItem>
                <SelectItem value="durian">Sầu Riêng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bảng giai đoạn */}
          <div className="overflow-x-auto">
            <Table className="w-full text-sm md:text-base border-collapse rounded-2xl">
              <TableHeader>
                <TableRow className="bg-slate-50 rounded-t-2xl">
                  <TableHead className="py-2 text-left text-xs font-medium text-slate-700 uppercase">
                    Giai Đoạn
                  </TableHead>
                  <TableHead className="py-2 text-left text-xs font-medium text-slate-700 uppercase">
                    Thời Gian
                  </TableHead>
                  <TableHead className="py-2 text-left text-xs font-medium text-slate-700 uppercase">
                    Khuyến Cáo
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cropData[selectedCrop].map((stage, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-slate-100 transition-colors"
                  >
                    <TableCell className="py-3 text-slate-800 font-semibold">
                      {stage.stage}
                    </TableCell>
                    <TableCell className="py-3 text-slate-600">
                      {stage.duration}
                    </TableCell>
                    <TableCell className="py-3">
                      <Accordion type="single" collapsible>
                        <AccordionItem value={`item-${index}`}>
                          <AccordionTrigger
                            className="text-lime-700 hover:text-lime-900 flex items-center gap-1"
                          >
                            Xem chi tiết
                          </AccordionTrigger>
                          <AnimatePresence>
                            <AccordionContent>
                              <motion.ul
                                className="list-disc pl-5 space-y-1 text-slate-700 mt-2"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                {stage.recommendations.map(
                                  (rec, recIndex) => (
                                    <li key={recIndex}>{rec}</li>
                                  )
                                )}
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
