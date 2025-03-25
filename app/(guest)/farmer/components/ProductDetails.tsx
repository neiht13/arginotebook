"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Leaf, Award, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductDetailsProps {
  product: any
  user: any
}

export default function ProductDetails({ product, user }: ProductDetailsProps) {
  const [currentImage, setCurrentImage] = useState(0)

  // If no product data, use user data as fallback
  const productData = product || {
    name: user.tensp || "Sản phẩm nông nghiệp",
    description: user.details || "Sản phẩm chất lượng cao từ nông hộ",
    images: [],
  }

  // Use product images if available, otherwise use placeholder
  const images =
    productData.images?.length > 0
      ? productData.images.map((img) =>
          img.startsWith("http") ? img : `https://gaochauthanhdt.vn/api/images/download?filename=${img}`,
        )
      : ["/placeholder.svg?height=400&width=600"]

  const nextImage = () => {
    if (images.length <= 1) return
    setCurrentImage((prevImage) => (prevImage + 1) % images.length)
  }

  const prevImage = () => {
    if (images.length <= 1) return
    setCurrentImage((prevImage) => (prevImage - 1 + images.length) % images.length)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.h2
        variants={itemVariants}
        className="text-2xl font-bold text-green-800 mb-6 pb-2 border-b border-green-100"
      >
        Thông tin sản phẩm
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <motion.div variants={itemVariants} className="relative rounded-lg overflow-hidden shadow-lg">
          <div className="relative aspect-[4/3] bg-gray-100">
            {images.map((src, index) => (
              <img
                key={index}
                src={src || "/placeholder.svg"}
                alt={`${productData.name} - Hình ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  index === currentImage ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}

            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/50 hover:bg-white/80 backdrop-blur-sm border-0 z-10"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/50 hover:bg-white/80 backdrop-blur-sm border-0 z-10"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                {/* Image indicators */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${index === currentImage ? "bg-white" : "bg-white/50"}`}
                      onClick={() => setCurrentImage(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Product Details */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md h-full">
            <CardHeader className="bg-green-50 pb-4">
              <CardTitle className="text-2xl text-green-800">{productData.name}</CardTitle>
              <CardDescription>Chi tiết về sản phẩm</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Product Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-green-600" />
                  Mô tả sản phẩm
                </h3>
                <p className="text-gray-700 whitespace-pre-line">{productData.description}</p>
              </div>

              {/* Product Features */}
              {productData.features && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-green-600" />
                    Đặc điểm nổi bật
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {productData.features.split(",").map((feature, index) => (
                      <li key={index}>{feature.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Product Categories/Tags */}
              {(productData.categories || user.loaiCayTrong) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-green-600" />
                    Phân loại
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(productData.categories || user.loaiCayTrong || "").split(",").map((category, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {category.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

