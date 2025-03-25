"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, User, Home, LocateFixed, AreaChart, Building2 } from "lucide-react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { useUserStore } from "@/lib/stores/user-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Map = dynamic(() => import("./Map"), { ssr: false });

export default function PersonalInfoForm({ user, setUser }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    cultivationArea: "",
    location: { lat: 10.452992, lng: 105.6178176 },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const { getUnitName } = useUserStore();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || user.diachi || "",
        cultivationArea: user.cultivationArea || user.dientich || "",
        location: user.location || { lat: 10.452992, lng: 105.6178176 },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast({ variant: "destructive", description: "Họ tên và email là bắt buộc" });
      return;
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      toast({ variant: "destructive", description: "Số điện thoại phải là 10 chữ số" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.put(`/api/user/${session?.user?.uId}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        cultivationArea: formData.cultivationArea,
        location: formData.location,
      });

      setUser((prev) => ({ ...prev, ...response.data }));
      await update({ ...session, user: { ...session.user, name: formData.name, email: formData.email } });
      toast({ description: "Cập nhật thông tin thành công" });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({ variant: "destructive", description: "Không thể cập nhật thông tin" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({ ...prev, location }));
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = { lat: position.coords.latitude, lng: position.coords.longitude };
          setFormData((prev) => ({ ...prev, location }));
          toast({ description: "Đã lấy vị trí hiện tại" });
        },
        () => toast({ variant: "destructive", description: "Không thể lấy vị trí hiện tại" })
      );
    } else {
      toast({ variant: "destructive", description: "Trình duyệt không hỗ trợ định vị" });
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

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={itemVariants}>
        <div className="space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="name" className="flex items-center text-slate-700">
                  <User className="w-4 h-4 mr-2 text-lime-600" />
                  Họ tên <span className="text-red-500">*</span>
                </Label>
              </TooltipTrigger>
              <TooltipContent>Tên đầy đủ của bạn</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập họ tên"
            className="border-lime-200 focus:border-lime-500"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center text-slate-700">
            <Mail className="w-4 h-4 mr-2 text-lime-600" />
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email"
            className="border-lime-200 focus:border-lime-500"
            required
          />
        </div>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={itemVariants}>
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center text-slate-700">
            <Phone className="w-4 h-4 mr-2 text-lime-600" />
            Số điện thoại
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại (10 số)"
            className="border-lime-200 focus:border-lime-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center text-slate-700">
            <Building2 className="w-4 h-4 mr-2 text-lime-600" />
            Đơn vị
          </Label>
          <Badge variant="outline" className="w-full py-2 justify-start">
            {user.donvihtx || getUnitName(user.xId) || "Chưa có đơn vị"}
          </Badge>
        </div>
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="address" className="flex items-center text-slate-700">
          <Home className="w-4 h-4 mr-2 text-lime-600" />
          Địa chỉ
        </Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Nhập địa chỉ"
          className="border-lime-200 focus:border-lime-500 min-h-[80px]"
        />
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="cultivationArea" className="flex items-center text-slate-700">
          <AreaChart className="w-4 h-4 mr-2 text-lime-600" />
          Diện tích canh tác (ha)
        </Label>
        <Input
          id="cultivationArea"
          name="cultivationArea"
          type="number"
          value={formData.cultivationArea}
          onChange={handleChange}
          placeholder="Nhập diện tích (ha)"
          className="border-lime-200 focus:border-lime-500"
          min="0"
          step="0.01"
        />
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <Label className="flex items-center text-slate-700">
          <LocateFixed className="w-4 h-4 mr-2 text-lime-600" />
          Vị trí trên bản đồ
        </Label>
        <div className="relative h-[300px] rounded-md overflow-hidden border border-lime-200 shadow-sm">
          <Map location={formData.location} onLocationSelect={handleLocationSelect} />
          <Button
            type="button"
            onClick={handleGetCurrentLocation}
            size="sm"
            className="absolute top-2 right-2 bg-lime-500 text-white hover:bg-lime-600"
          >
            <LocateFixed className="w-4 h-4 mr-2" />
            Vị trí hiện tại
          </Button>
        </div>
      </motion.div>

      <motion.div className="flex justify-end" variants={itemVariants}>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-lime-500 hover:bg-lime-600 text-white"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
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
            "Lưu thay đổi"
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}