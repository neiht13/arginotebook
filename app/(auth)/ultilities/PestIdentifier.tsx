"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CameraIcon, CheckCircle, ShieldAlertIcon, Leaf, AlertTriangle, Info } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

// Mô hình đơn giản cho nhận diện dịch hại
const SAMPLE_DISEASES = [
  {
    id: 1,
    name: "Đạo ôn lá",
    scientificName: "Pyricularia oryzae",
    description: "Bệnh đạo ôn lá là một trong những bệnh phổ biến nhất trên cây lúa, gây ra bởi nấm Pyricularia oryzae.",
    symptoms: "Vết bệnh hình thoi, màu xám ở giữa, viền nâu đậm, kích thước 1-2cm.",
    treatment: "Sử dụng giống kháng bệnh, phun thuốc trừ nấm như Tricyclazole, Isoprothiolane.",
    image: "/placeholder.svg?height=300&width=400"
  },
  {
    id: 2,
    name: "Bạc lá",
    scientificName: "Xanthomonas oryzae",
    description: "Bệnh bạc lá do vi khuẩn Xanthomonas oryzae gây ra, phổ biến ở vùng nhiệt đới và á nhiệt đới.",
    symptoms: "Lá có vết bạc màu vàng nhạt dọc theo gân lá, sau đó lan rộng và chuyển sang màu nâu.",
    treatment: "Sử dụng giống kháng bệnh, quản lý nước tốt, sử dụng thuốc kháng sinh nông nghiệp.",
    image: "/placeholder.svg?height=300&width=400"
  },
  {
    id: 3,
    name: "Khô vằn",
    scientificName: "Rhizoctonia solani",
    description: "Bệnh khô vằn do nấm Rhizoctonia solani gây ra, thường xuất hiện ở giai đoạn lúa đứng cái và trổ bông.",
    symptoms: "Vết bệnh hình bầu dục không đều, màu xám xanh, viền nâu đậm trên lá và bẹ lá.",
    treatment: "Bón phân cân đối, giảm mật độ gieo sạ, sử dụng thuốc trừ nấm như Validamycin, Hexaconazole.",
    image: "/placeholder.svg?height=300&width=400"
  }
]

export default function PestIdentifier() {
  const [image, setImage] = useState(null)
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("identify")
  const [identifiedDisease, setIdentifiedDisease] = useState(null)
  const [showLibrary, setShowLibrary] = useState(false)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result)
        setResult("")
        setError("")
        setIdentifiedDisease(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image) return

    setIsLoading(true)
    setResult("")
    setError("")

    try {
      // Giả lập API call thay vì gọi API thực tế
      setTimeout(() => {
        // Chọn ngẫu nhiên một bệnh từ danh sách mẫu
        const randomIndex = Math.floor(Math.random() * SAMPLE_DISEASES.length)
        const disease = SAMPLE_DISEASES[randomIndex]
        
        setResult(`Kết quả nhận diện: ${disease.name} (${disease.scientificName})`)
        setIdentifiedDisease(disease)
        setIsLoading(false)
        
        // Chuyển sang tab thông tin chi tiết
        setTimeout(() => {
          setActiveTab("details")
        }, 500)
      }, 2000)
    } catch (error) {
      console.error("Error identifying pest:", error)
      setError("Có lỗi xảy ra khi nhận diện. Vui lòng thử lại sau.")
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="identify" className="data-[state=active]:bg-lime-100 data-[state=active]:text-lime-800">
            <CameraIcon className="w-4 h-4 mr-2" />
            Nhận diện
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-lime-100 data-[state=active]:text-lime-800" disabled={!identifiedDisease}>
            <Info className="w-4 h-4 mr-2" />
            Thông tin chi tiết
          </TabsTrigger>
          <TabsTrigger value="library" className="data-[state=active]:bg-lime-100 data-[state=active]:text-lime-800">
            <Leaf className="w-4 h-4 mr-2" />
            Thư viện bệnh
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="identify" className="m-0">
          <Card className="shadow-md border border-lime-100">
            <CardHeader className="bg-lime-50 border-b border-lime-100">
              <CardTitle className="text-xl font-bold text-lime-800 flex items-center gap-2">
                <CameraIcon className="w-5 h-5" />
                Nhận Diện Sâu Bệnh
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-lime-300 rounded-lg cursor-pointer hover:border-lime-500 transition bg-lime-50/50">
                    {image ? (
                      <img src={image || "/placeholder.svg"} alt="Uploaded" className="object-contain w-full h-full rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center p-6 text-center">
                        <CameraIcon className="w-16 h-16 text-lime-400 mb-2" />
                        <p className="text-lime-700 font-medium mb-1">Tải lên hình ảnh lá cây</p>
                        <p className="text-lime-600 text-sm">Nhấp hoặc kéo thả hình ảnh vào đây</p>
                      </div>
                    )}
                    <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={!image || isLoading} 
                  className="w-full flex items-center justify-center bg-lime-600 hover:bg-lime-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <motion.svg
                        className="animate-spin h-5 w-5 mr-3 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </motion.svg>
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Phân tích
                    </>
                  )}
                </Button>
              </form>

              {/* Hiển thị kết quả */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="mt-6 p-4 bg-lime-100 border border-lime-400 text-lime-700 rounded-lg"
                  >
                    <CheckCircle className="w-6 h-6 inline mr-2" />
                    <span>{result}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hiển thị lỗi */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center"
                  >
                    <ShieldAlertIcon className="w-6 h-6 mr-2" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="m-0">
          {identifiedDisease ? (
            <Card className="shadow-md border border-lime-100">
              <CardHeader className="bg-lime-50 border-b border-lime-100">
                <CardTitle className="text-xl font-bold text-lime-800 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Thông tin chi tiết về bệnh
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img 
                      src={identifiedDisease.image || "/placeholder.svg"} 
                      alt={identifiedDisease.name} 
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-lime-800">{identifiedDisease.name}</h3>
                      <p className="text-gray-500 italic">{identifiedDisease.scientificName}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-semibold text-lime-700 flex items-center gap-1">
                        <Info className="w-4 h-4" /> Mô tả
                      </h4>
                      <p className="text-gray-700">{identifiedDisease.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-semibold text-lime-700 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Triệu chứng
                      </h4>
                      <p className="text-gray-700">{identifiedDisease.symptoms}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-semibold text-lime-700 flex items-center gap-1">
                        <Leaf className="w-4 h-4" /> Phương pháp điều trị
                      </h4>
                      <p className="text-gray-700">{identifiedDisease.treatment}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md border border-lime-100">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-700">Chưa có kết quả nhận diện</h3>
                <p className="text-gray-500">Vui lòng tải lên hình ảnh và thực hiện nhận diện trước</p>
                <Button 
                  className="mt-4"
                  onClick={() => setActiveTab("identify")}
                >
                  Quay lại trang nhận diện
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="library" className="m-0">
          <Card className="shadow-md border border-lime-100">
            <CardHeader className="bg-lime-50 border-b border-lime-100">
              <CardTitle className="text-xl font-bold text-lime-800 flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Thư viện bệnh hại
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SAMPLE_DISEASES.map((disease) => (
                  <motion.div
                    key={disease.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-lime-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={disease.image || "/placeholder.svg"} 
                        alt={disease.name} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-lime-800">{disease.name}</h3>
                      <p className="text-sm text-gray-500 italic mb-2">{disease.scientificName}</p>
                      <p className="text-sm text-gray-700 line-clamp-3">{disease.description}</p>
                      <Button 
                        variant="outline" 
                        className="mt-3 w-full border-lime-200 text-lime-700 hover:bg-lime-50"
                        onClick={() => {
                          setIdentifiedDisease(disease)
                          setActiveTab("details")
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
