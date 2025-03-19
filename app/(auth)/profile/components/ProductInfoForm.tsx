"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, ImagePlus, Info, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { toast } from "react-toastify"
import axios from "axios"

export default function ProductInfoForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    images: [],
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef(null)
  const { data: session } = useSession()

  useEffect(() => {
    fetchProductInfo()
  }, [])

  const fetchProductInfo = async () => {
    setIsLoading(true)
    try {
      if (session?.user?.uId) {
        const response = await axios.get(`/api/product?userId=${session.user.uId}`)
        const productData = response.data

        if (productData) {
          setFormData({
            name: productData.name || "",
            description: productData.description || "",
            images: productData.images || [],
          })
        }
      }
    } catch (error) {
      console.error("Error fetching product info:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Giải phóng Object URLs khi component unmount hoặc images thay đổi
  useEffect(() => {
    return () => {
      formData.images.forEach((image) => {
        if (image.startsWith("blob:")) {
          URL.revokeObjectURL(image)
        }
      })
    }
  }, [formData.images])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
    setSuccess("")
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    const remainingSlots = 5 - formData.images.length

    if (files.length > remainingSlots) {
      setError(`Bạn chỉ có thể tải lên tối đa ${remainingSlots} hình ảnh.`)
      return
    }

    // Create previews
    const newImagePreviews = files.map((file) => URL.createObjectURL(file))
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImagePreviews] }))

    // Upload images
    try {
      const uploadedImageUrls = []

      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await axios.post("/api/compress-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        if (response.data && response.data.url) {
          uploadedImageUrls.push(response.data.url)
        }
      }

      // Replace blob URLs with actual URLs
      setFormData((prev) => {
        const updatedImages = [...prev.images]

        // Remove the blob URLs
        newImagePreviews.forEach((blobUrl) => {
          const index = updatedImages.indexOf(blobUrl)
          if (index !== -1) {
            updatedImages.splice(index, 1)
            URL.revokeObjectURL(blobUrl)
          }
        })

        // Add the actual URLs
        return {
          ...prev,
          images: [...updatedImages, ...uploadedImageUrls],
        }
      })

      toast.success("Tải lên hình ảnh thành công")
    } catch (error) {
      console.error("Error uploading images:", error)
      toast.error("Không thể tải lên hình ảnh")
    }

    // Reset giá trị của input file để có thể tải lên cùng một file nhiều lần
    e.target.value = null
  }

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const updatedImages = [...prev.images]

      // If it's a blob URL, revoke it
      if (updatedImages[index].startsWith("blob:")) {
        URL.revokeObjectURL(updatedImages[index])
      }

      updatedImages.splice(index, 1)
      return { ...prev, images: updatedImages }
    })

    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name) {
      setError("Vui lòng nhập tên sản phẩm.")
      return
    }

    setIsSubmitting(true)

    try {
      await axios.post("/api/product", {
        userId: session?.user?.uId,
        name: formData.name,
        description: formData.description,
        images: formData.images.filter((img) => !img.startsWith("blob:")),
      })

      setSuccess("Thông tin sản phẩm đã được lưu thành công!")
      toast.success("Lưu thông tin sản phẩm thành công!")
    } catch (error) {
      console.error("Error saving product info:", error)
      setError("Không thể lưu thông tin sản phẩm. Vui lòng thử lại.")
      toast.error("Không thể lưu thông tin sản phẩm")
    } finally {
      setIsSubmitting(false)
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
      </div>
    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center">
          <Info className="w-4 h-4 mr-2 text-slate-500" />
          Tên Sản Phẩm <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Nhập tên sản phẩm"
          className="border-slate-300 focus:border-lime-500 focus:ring-lime-500"
        />
      </motion.div>

      {/* Mô tả sản phẩm */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="description" className="text-sm font-medium text-slate-700 flex items-center">
          <Info className="w-4 h-4 mr-2 text-slate-500" />
          Mô Tả Sản Phẩm
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Nhập mô tả sản phẩm"
          className="border-slate-300 focus:border-lime-500 focus:ring-lime-500 min-h-[100px]"
        />
      </motion.div>

      {/* Tải lên hình ảnh */}
      <motion.div className="space-y-4" variants={itemVariants}>
        <Label htmlFor="image-upload" className="text-sm font-medium text-slate-700 flex items-center">
          <ImagePlus className="w-4 h-4 mr-2 text-slate-500" />
          Hình Ảnh Sản Phẩm (tối đa 5 ảnh)
        </Label>

        <div className="flex items-center space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileInput}
            className="flex items-center space-x-2 border-dashed border-slate-300 hover:bg-slate-50 hover:border-lime-500"
            disabled={formData.images.length >= 5}
          >
            <ImagePlus className="w-4 h-4" />
            <span>Tải Lên Hình Ảnh</span>
          </Button>
          <Input
            ref={fileInputRef}
            id="image-upload"
            name="images"
            type="file"
            multiple
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <span className="text-sm text-slate-500">{formData.images.length}/5 đã tải lên</span>
        </div>

        {/* Thông báo lỗi hoặc thành công */}
        {error && (
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Hiển thị hình ảnh đã tải lên */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {formData.images.map((image, index) => (
              <motion.div
                key={index}
                className="relative rounded-md overflow-hidden border border-slate-200 aspect-square"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Sản phẩm ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white hover:bg-red-50 border border-slate-200"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-3 w-3 text-red-500" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Nút Lưu */}
      <motion.div className="flex justify-end pt-4" variants={itemVariants}>
        <Button type="submit" disabled={isSubmitting} className="bg-lime-500 hover:bg-lime-600 text-white px-6">
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang lưu...
            </>
          ) : (
            "Lưu Thông Tin Sản Phẩm"
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}

