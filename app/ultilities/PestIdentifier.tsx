"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CameraIcon, CheckCircle, ShieldAlertIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HF_API_TOKEN = process.env.NEXT_PUBLIC_HF_API_TOKEN; 
// Token lấy từ Hugging Face (Access Token)

const MODEL_ID = "KaraAgroAI/CADI-AI"; 
// Thay username/plant-disease-model bằng mô hình cụ thể bạn muốn dùng

export default function PestIdentifier() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setResult('');
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    setIsLoading(true);
    setResult('');
    setError('');

    try {
      // 1. Bỏ prefix dataURL để lấy phần base64
      const base64Image = image.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');

      // 2. Gửi request tới Hugging Face Inference API
      const response = await fetch(
        `http://10.93.30.39:3003/predict`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Lỗi khi gọi API Hugging Face: ${response.status}`);
      }

      const data = await response.json();
      // Tuỳ vào cấu trúc JSON trả về của mô hình để parse kết quả
      // Ví dụ: data có thể là mảng gồm nhiều đối tượng, 
      // hoặc 1 object { label: "...", score: 0.99 } ...
      // Ở đây minh hoạ kiểu data = [{ label: 'Corn Leaf Blight', score: 0.95 }, ...]
      const { predictions } = data; // Lấy ra mảng "predictions"

      // Kiểm tra mảng predictions
      if (Array.isArray(predictions) && predictions.length > 0) {
        // Tạo 1 chuỗi để hiển thị 3 dự đoán
        // Ví dụ: "1) Tên_nhãn_1 (75.00%), 2) Tên_nhãn_2 (15.00%), 3) Tên_nhãn_3 (10.00%)"
        const resultString = predictions
          .map((item, index) => `${index + 1}) ${item.label}: ${(item.probability * 100).toFixed(2)}%`)
          .join('\n');
    
        // Hoặc bạn cũng có thể hiển thị từng dòng một
        // const resultString = predictions
        //   .map((item, index) => `${index + 1}) ${item.label} - ${(item.probability * 100).toFixed(2)}%`)
        //   .join('\n');
    
        setResult(`Dự đoán top 3: \n${resultString}`);
        
      } else {
        // Không có kết quả hoặc trả về rỗng
        setError('Không thể xác định bệnh. Vui lòng thử lại với ảnh khác.');
      }
    } catch (error) {
      console.error('Error identifying pest:', error);
      setError('Có lỗi xảy ra khi nhận diện. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-auto bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg rounded-lg bg-white">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-extrabold text-gray-800 flex items-center">
            🐞 Nhận Diện Sâu Bệnh
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-400 transition">
                {image ? (
                  <img src={image} alt="Uploaded" className="object-cover w-full h-full rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center">
                    <CameraIcon className="w-12 h-12 text-gray-400" />
                    <p className="text-gray-400">Nhấp hoặc kéo thả hình ảnh vào đây</p>
                  </div>
                )}
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            <Button type="submit" disabled={!image || isLoading} className="w-full flex items-center justify-center">
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
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
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
                <span
                  dangerouslySetInnerHTML={{
                    __html: result
                      .replace(/\n/g, '<br/>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                  }}
                ></span>
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
    </div>
  );
}
