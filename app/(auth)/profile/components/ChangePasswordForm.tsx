"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const { data: session } = useSession();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận không khớp");
      return;
    }
    if (newPassword.length < 8 || !/[!@#$%^&*]/.test(newPassword)) {
      setError("Mật khẩu mới phải dài ít nhất 8 ký tự và chứa ký tự đặc biệt");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/user/change-password", {
        userId: session?.user?.uId,
        currentPassword,
        newPassword,
      });
      setSuccess("Đổi mật khẩu thành công!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ description: "Đổi mật khẩu thành công" });
    } catch (error) {
      const message = error.response?.data?.message || "Đổi mật khẩu thất bại";
      setError(message);
      toast({ variant: "destructive", description: message });
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

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="currentPassword" className="flex items-center text-slate-700">
          <Lock className="w-4 h-4 mr-2 text-lime-600" />
          Mật khẩu hiện tại <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="currentPassword"
            name="currentPassword"
            type={showPasswords.current ? "text" : "password"}
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="Nhập mật khẩu hiện tại"
            className="border-lime-200 focus:border-lime-500 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
          >
            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="newPassword" className="flex items-center text-slate-700">
          <Key className="w-4 h-4 mr-2 text-lime-600" />
          Mật khẩu mới <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            name="newPassword"
            type={showPasswords.new ? "text" : "password"}
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Nhập mật khẩu mới"
            className="border-lime-200 focus:border-lime-500 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
          >
            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="confirmPassword" className="flex items-center text-slate-700">
          <Key className="w-4 h-4 mr-2 text-lime-600" />
          Xác nhận mật khẩu <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPasswords.confirm ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Xác nhận mật khẩu"
            className="border-lime-200 focus:border-lime-500 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
          >
            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}
      {success && (
        <motion.div variants={itemVariants}>
          <Alert>
            <CheckCircle className="h-4 w-4 text-lime-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div className="flex justify-end" variants={itemVariants}>
        <Button
          type="submit"
          disabled={isSubmitting}
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
              Đang xử lý...
            </>
          ) : (
            "Đổi mật khẩu"
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}