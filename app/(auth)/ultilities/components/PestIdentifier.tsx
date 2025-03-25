"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CameraIcon, CheckCircle, ShieldAlertIcon, Leaf, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Vietnamese disease labels with detailed information
const DISEASE_INFO = {
  "Anthracnose": {
    name: "Bệnh thán thư",
    scientificName: "Colletotrichum spp.",
    description: "Bệnh thán thư là một bệnh phổ biến do nấm gây ra, thường xuất hiện trên lá, thân và quả.",
    symptoms: "Vết bệnh màu nâu đen, lõm xuống, có thể có vòng đồng tâm, thường xuất hiện trên lá và quả.",
    treatment: "Sử dụng thuốc trừ nấm (Benomyl, Mancozeb), loại bỏ lá bị bệnh, giữ vệ sinh vườn.",
    image: "/images/anthracnose.jpg" // Update with actual image path
  },
  "Bacterial Canker": {
    name: "Bệnh loét vi khuẩn",
    scientificName: "Xanthomonas spp.",
    description: "Bệnh do vi khuẩn gây ra, thường tấn công thân cây và cành, gây thối và chết cây.",
    symptoms: "Vết loét trên thân, chảy nhựa, lá vàng và rụng sớm.",
    treatment: "Cắt bỏ phần bị bệnh, sử dụng thuốc chứa đồng (Copper-based), quản lý tưới nước.",
    image: "/images/bacterial-canker.jpg"
  },
  "Cutting Weevil": {
    name: "Sâu đục thân",
    scientificName: "Cosmopolites sordidus",
    description: "Loài côn trùng gây hại nghiêm trọng cho cây trồng, đặc biệt là cây chuối.",
    symptoms: "Lỗ đục trên thân, lá vàng úa, cây dễ gãy đổ.",
    treatment: "Sử dụng bẫy sinh học, thuốc trừ sâu (Imidacloprid), vệ sinh vườn.",
    image: "/images/cutting-weevil.jpg"
  },
  "Die Back": {
    name: "Bệnh chết ngược",
    scientificName: "Nhiều loại nấm (Phytophthora, Botryosphaeria)",
    description: "Bệnh gây chết cành từ ngọn xuống, do nấm hoặc điều kiện môi trường bất lợi.",
    symptoms: "Cành khô từ ngọn, lá rụng, vỏ cây nứt nẻ.",
    treatment: "Cắt tỉa cành bệnh, phun thuốc trừ nấm (Carbendazim), cải thiện điều kiện đất.",
    image: "/images/die-back.jpg"
  },
  "Gall Midge": {
    name: "Rầy bướu",
    scientificName: "Orseolia oryzae",
    description: "Côn trùng nhỏ gây hại phổ biến trên lúa, tạo bướu trên lá và thân.",
    symptoms: "Lá biến dạng, xuất hiện bướu bạc, cây còi cọc.",
    treatment: "Sử dụng giống kháng, thuốc trừ sâu (Cartap), kiểm soát mật độ côn trùng.",
    image: "/images/gall-midge.jpg"
  },
  "Healthy": {
    name: "Khỏe mạnh",
    scientificName: "Không có",
    description: "Cây không có dấu hiệu bệnh hoặc sâu hại, phát triển bình thường.",
    symptoms: "Lá xanh đều, không có vết bệnh hay biến dạng.",
    treatment: "Duy trì chăm sóc tốt, bón phân cân đối, tưới nước hợp lý.",
    image: "/images/healthy.jpg"
  },
  "Powdery Mildew": {
    name: "Bệnh phấn trắng",
    scientificName: "Erysiphe spp.",
    description: "Bệnh do nấm gây ra, thường xuất hiện trong điều kiện ẩm ướt.",
    symptoms: "Lớp phấn trắng trên mặt lá, lá vàng và rụng sớm.",
    treatment: "Phun thuốc trừ nấm (Sulfur, Triadimefon), giữ thoáng vườn.",
    image: "/images/powdery-mildew.jpg"
  },
  "Sooty Mould": {
    name: "Bệnh muội đen",
    scientificName: "Capnodium spp.",
    description: "Nấm phát triển trên chất tiết của côn trùng, làm đen bề mặt lá.",
    symptoms: "Lớp muội đen trên lá, cản trở quang hợp.",
    treatment: "Kiểm soát côn trùng (rệp, rầy), rửa lá, sử dụng thuốc trừ nấm.",
    image: "/images/sooty-mould.jpg"
  }
};

export default function PestIdentifier() {
  const [image, setImage] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("identify");
  const [selectedDisease, setSelectedDisease] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setPredictions(null);
        setError("");
        setSelectedDisease(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError("Vui lòng tải lên hình ảnh!");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", dataURLtoFile(image, "uploaded-image.jpg"));

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Không thể thực hiện dự đoán!");
      }

      const data = await response.json();
      const mappedPredictions = data.predictions.map(pred => ({
        ...pred,
        label: DISEASE_INFO[pred.label].name,
        info: DISEASE_INFO[pred.label]
      }));
      setPredictions(mappedPredictions);
      setSelectedDisease(mappedPredictions[0].info); // Default to top prediction
      setActiveTab("details");
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi nhận diện!");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert data URL to File object
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div className="p-6 bg-white">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-0">
          <TabsTrigger value="identify" className="w-full h-full text-balance py-4 flex flex-col items-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700 rounded-none border-b-2 border-transparent data-[state=active]:border-lime-500 transition-all">
            <CameraIcon className="w-4 h-4 mr-2" />
            Nhận diện
          </TabsTrigger>
          <TabsTrigger value="details" className="w-full text-balance h-auto py-4 flex flex-col items-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700 rounded-none border-b-2 border-transparent data-[state=active]:border-lime-500 transition-all">
            <Info className="w-4 h-4 mr-2" />
            Thông tin chi tiết
          </TabsTrigger>
          <TabsTrigger value="library" className="w-full text-balance h-auto py-4 flex flex-col items-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700 rounded-none border-b-2 border-transparent data-[state=active]:border-lime-500 transition-all">
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
                      <img src={image} alt="Uploaded" className="object-contain w-full h-full rounded-lg" />
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

                <Button type="submit" disabled={!image || isLoading} className="w-full flex items-center justify-center bg-lime-600 hover:bg-lime-700 text-white">
                  {isLoading ? (
                    <>
                      <motion.svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }} className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                    <ShieldAlertIcon className="w-6 h-6 mr-2" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="m-0">
          {selectedDisease ? (
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
                    <img src={selectedDisease.image || "/placeholder.svg"} alt={selectedDisease.name} className="w-full h-auto rounded-lg shadow-md" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-lime-800">{selectedDisease.name}</h3>
                      <p className="text-gray-500 italic">{selectedDisease.scientificName}</p>
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-lime-700 flex items-center gap-1">
                        <Info className="w-4 h-4" /> Mô tả
                      </h4>
                      <p className="text-gray-700">{selectedDisease.description}</p>
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-lime-700 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Triệu chứng
                      </h4>
                      <p className="text-gray-700">{selectedDisease.symptoms}</p>
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-lime-700 flex items-center gap-1">
                        <Leaf className="w-4 h-4" /> Phương pháp điều trị
                      </h4>
                      <p className="text-gray-700">{selectedDisease.treatment}</p>
                    </div>
                    {predictions && (
                      <div>
                        <h4 className="text-md font-semibold text-lime-700">Dự đoán hàng đầu:</h4>
                        {predictions.map((pred, index) => (
                          <div key={index} className="mt-2">
                            <p className="text-gray-700">
                              {index + 1}. {pred.label}: {(pred.value).toFixed(1)}% độ tin cậy
                            </p>
                            <Button variant="link" className="p-0 h-auto text-lime-600" onClick={() => setSelectedDisease(pred.info)}>
                              Xem chi tiết
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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
                <Button className="mt-4" onClick={() => setActiveTab("identify")}>
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
                {Object.values(DISEASE_INFO).map((disease) => (
                  <motion.div key={disease.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="border border-lime-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-48 overflow-hidden">
                      <img src={disease.image || "/placeholder.svg"} alt={disease.name} className="w-full h-full object-cover transition-transform hover:scale-105" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-lime-800">{disease.name}</h3>
                      <p className="text-sm text-gray-500 italic mb-2">{disease.scientificName}</p>
                      <p className="text-sm text-gray-700 line-clamp-3">{disease.description}</p>
                      <Button variant="outline" className="mt-3 w-full border-lime-200 text-lime-700 hover:bg-lime-50" onClick={() => {
                        setSelectedDisease(disease);
                        setActiveTab("details");
                      }}>
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
  );
}