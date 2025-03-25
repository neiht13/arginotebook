"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import PersonalInfoForm from "./components/PersonalInfoForm";
import ChangePasswordForm from "./components/ChangePasswordForm";
import ProductInfoForm from "./components/ProductInfoForm";
import CertificationsTab from "./components/CertificationsTab";
import { LogOut, User, Lock, Package, Camera, Award, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import axios from "axios";
import { useUserStore } from "@/lib/stores/user-store";

export default function ProfilePage() {
  const [user, setUser] = useState({
    _id: "",
    email: "",
    username: "",
    name: "",
    image: "",
    phone: "",
    diachi: "",
    location: { lat: 10.452992, lng: 105.6178176 },
    mota: "",
    dientich: 0,
    accountId: "",
    donvihtx: "",
    xId: "",
    masovungtrong: "",
    avatar: "",
    address: "",
    cultivationArea: "",
    status: false,
    role: ["USER"],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { getUnitName } = useUserStore();

  // Fetch user data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (status === "authenticated" && session?.user?.uId) {
        const response = await axios.get(`/api/user?id=${session.user.uId}`);
        const data = response.data;
        setUser({
          ...data,
          avatar: data.avatar || "/placeholder.svg?height=100&width=100",
          location: data.location || { lat: 10.452992, lng: 105.6178176 },
          role: data.role || ["USER"],
          status: data.status || false,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin người dùng",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "loading") {
      fetchData();
    }
  }, [status]);

  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, avatar: previewUrl }));

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post("/api/compress-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.url) {
        await axios.put(`/api/user/${session?.user?.uId}`, { avatar: response.data.url });
        setUser((prev) => ({ ...prev, avatar: response.data.url }));
        URL.revokeObjectURL(previewUrl);
        toast({ title: "Thành công", description: "Ảnh đại diện đã được cập nhật" });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên ảnh đại diện",
        variant: "destructive",
      });
      setUser((prev) => ({ ...prev, avatar: prev.avatar }));
    }
  };

  // Handle logout
  const handleLogout = () => {
    signOut({ callbackUrl: "/auth" }).then(() =>
      toast({ title: "Đã đăng xuất", description: "Bạn đã đăng xuất khỏi hệ thống" })
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-full max-w-5xl h-[600px] rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-green-50 p-4 md:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-5xl mx-auto">
        <Card className="border-none bg-white shadow-lg overflow-hidden">
          <CardHeader className="relative p-6 pb-4 bg-gradient-to-r from-lime-100 to-green-100">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="absolute top-4 right-4 text-slate-600 hover:text-red-500 hover:bg-red-100"
              title="Đăng xuất"
            >
              <LogOut className="h-5 w-5" />
            </Button>

            <motion.div className="flex flex-col items-center space-y-4" variants={itemVariants}>
              <div className="relative group">
                <Avatar className="h-28 w-28 border-4 border-white shadow-md transition-transform group-hover:scale-105">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-lime-200 text-lime-800 text-2xl">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-lime-500 text-white rounded-full p-2 cursor-pointer hover:bg-lime-600 transition-all shadow-md"
                  title="Thay đổi ảnh đại diện"
                >
                  <Camera className="w-4 h-4" />
                </label>
                <Input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  onChange={handleAvatarChange}
                  accept="image/*"
                />
              </div>

              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-slate-800">{user.name || "Người dùng"}</h1>
                <p className="text-sm text-slate-600">{user.email || "Email chưa cập nhật"}</p>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {user.donvihtx || getUnitName(user.xId) || "Chưa có đơn vị"}
                  </Badge>
                  <Badge variant={user.status ? "default" : "destructive"}>
                    {user.status ? "Hoạt động" : "Chờ kích hoạt"}
                  </Badge>
                </div>
                {session?.user?.uId && (
                  <a
                    href={`https://htxtanphuoc.vercel.app/farmer/${session.user.uId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-lime-600 hover:text-lime-700 hover:underline"
                  >
                    Xem trang cá nhân nông dân
                  </a>
                )}
              </div>
            </motion.div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white border-b border-slate-200 p-0">
                <TabsTrigger
                  value="personal"
                  className="py-3 flex items-center justify-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700 data-[state=active]:border-b-2 data-[state=active]:border-lime-500 hover:bg-lime-50 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Cá nhân</span>
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="py-3 flex items-center justify-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700 data-[state=active]:border-b-2 data-[state=active]:border-lime-500 hover:bg-lime-50 transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Mật khẩu</span>
                </TabsTrigger>
                <TabsTrigger
                  value="product"
                  className="py-3 flex items-center justify-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700 data-[state=active]:border-b-2 data-[state=active]:border-lime-500 hover:bg-lime-50 transition-all"
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Sản phẩm</span>
                </TabsTrigger>
                <TabsTrigger
                  value="certifications"
                  className="py-3 flex items-center justify-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700 data-[state=active]:border-b-2 data-[state=active]:border-lime-500 hover:bg-lime-50 transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span className="hidden sm:inline">Chứng nhận</span>
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  <TabsContent value="personal" className="mt-0">
                    <PersonalInfoForm user={user} setUser={setUser} />
                  </TabsContent>
                  <TabsContent value="password" className="mt-0">
                    <ChangePasswordForm />
                  </TabsContent>
                  <TabsContent value="product" className="mt-0">
                    <ProductInfoForm />
                  </TabsContent>
                  <TabsContent value="certifications" className="mt-0">
                    <CertificationsTab />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}