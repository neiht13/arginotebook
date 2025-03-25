"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, ImagePlus, Info, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Progress } from "@/components/ui/progress";

export default function ProductInfoForm() {
  const [formData, setFormData] = useState({ name: "", description: "", images: [] });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    fetchProductInfo();
    return () => {
      formData.images.forEach((image) => image.startsWith("blob:") && URL.revokeObjectURL(image));
    };
  }, []);

  const fetchProductInfo = async () => {
    setIsLoading(true);
    try {
      if (session?.user?.uId) {
        const response = await axios.get(`/api/product?userId=${session.user.uId}`);
        const productData = response.data || {};
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          images: productData.images || [],
        });
      }
    } catch (error) {
      console.error("Error fetching product info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - formData.images.length;
    if (files.length > remainingSlots) {
      setError(`Chỉ có thể tải lên tối đa ${remainingSlots} ảnh nữa`);
      return;
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setError("Kích thước ảnh tối đa là 5MB");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...newPreviews] }));

    try {
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadForm = new FormData();
        uploadForm.append("image", file);

        const response = await axios.post("/api/compress-image", uploadForm, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          },
        });

        if (response.data.url) {
          uploadedUrls.push(response.data.url);
        }
      }

      setFormData((prev) => {
        const updatedImages = prev.images.filter((img) => !newPreviews.includes(img)).concat(uploadedUrls);
        newPreviews.forEach((url) => URL.revokeObjectURL(url));
        return { ...prev, images: updatedImages };
      });
      setUploadProgress(0);
      toast({ description: "Tải ảnh thành công" });
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("Không thể tải ảnh lên");
    }
    e.target.value = null;
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const updatedImages = [...prev.images];
      if (updatedImages[index].startsWith("blob:")) URL.revokeObjectURL(updatedImages[index]);
      updatedImages.splice(index, 1);
      return { ...prev, images: updatedImages };
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Tên sản phẩm là bắt buộc");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/product", {
        userId: session?.user?.uId,
        name: formData.name,
        description: formData.description,
        images: formData.images.filter((img) => !img.startsWith("blob:")),
      });
      setSuccess("Lưu thông tin sản phẩm thành công!");
      toast({ description: "Lưu thông tin sản phẩm thành công" });
    } catch (error) {
      console.error("Error saving product info:", error);
      setError("Không thể lưu thông tin sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><svg className="animate-spin h-8 w-8 text-lime-700" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg></div>;
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
        <Label htmlFor="name" className="flex items-center text-slate-700">
          <Info className="w-4 h-4 mr-2 text-lime-700" />
          Tên sản phẩm <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nhập tên sản phẩm"
          className="border-lime-200 focus:border-lime-500"
          required
        />
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="description" className="flex items-center text-slate-700">
          <Info className="w-4 h-4 mr-2 text-lime-700" />
          Mô tả sản phẩm
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Nhập mô tả sản phẩm"
          className="border-lime-200 focus:border-lime-500 min-h-[100px]"
        />
      </motion.div>

      <motion.div className="space-y-4" variants={itemVariants}>
        <Label className="flex items-center text-slate-700">
          <ImagePlus className="w-4 h-4 mr-2 text-lime-700" />
          Hình ảnh sản phẩm (tối đa 5)
        </Label>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={formData.images.length >= 5 || uploadProgress > 0}
            className="border-lime-200 hover:border-lime-500"
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            Tải lên
          </Button>
          <Input
            ref={fileInputRef}
            id="image-upload"
            type="file"
            multiple
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <span className="text-sm text-slate-600">{formData.images.length}/5</span>
        </div>
        {uploadProgress > 0 && (
          <Progress value={uploadProgress} className="w-full h-2 bg-lime-100" />
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-lime-700" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.images.map((image, index) => (
              <motion.div
                key={index}
                className="relative rounded-md overflow-hidden border border-lime-200 shadow-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Sản phẩm ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white hover:bg-red-50"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div className="flex justify-end" variants={itemVariants}>
        <Button
          type="submit"
          disabled={isSubmitting || uploadProgress > 0}
          className="bg-lime-500 hover:bg-lime-600 text-white"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Đang lưu...
            </>
          ) : (
            "Lưu thông tin"
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}