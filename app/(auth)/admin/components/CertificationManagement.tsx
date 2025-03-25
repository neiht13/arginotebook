// CertificationManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Plus, Pencil, Trash2, Search, Award, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";
import axios from "axios";
import { motion } from "framer-motion";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

interface Certification {
  _id?: string;
  userId: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  description?: string;
  imageUrl?: string;
  status: "active" | "expired" | "revoked";
}

interface User {
  _id: string;
  accountId: string;
  name: string;
  email: string;
  role: string[];
}

export default function CertificationManagement() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCertification, setCurrentCertification] = useState<Certification | null>(null);
  const [formData, setFormData] = useState<Certification>({
    userId: "",
    name: "",
    issuer: "",
    issueDate: format(new Date(), "yyyy-MM-dd"),
    expiryDate: "",
    description: "",
    imageUrl: "",
    status: "active",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchCertifications(selectedUserId);
    } else {
      fetchCertifications();
    }
  }, [selectedUserId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const usersResponse = await axios.get("/api/users");
      setUsers(usersResponse.data);
      await fetchCertifications();
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCertifications = async (userId?: string) => {
    try {
      const url = userId ? `/api/certifications?userId=${userId}` : "/api/certifications";
      const response = await axios.get(url);
      setCertifications(response.data);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách chứng nhận.",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setCurrentCertification(null);
    setFormData({
      userId: selectedUserId || "",
      name: "",
      issuer: "",
      issueDate: format(new Date(), "yyyy-MM-dd"),
      expiryDate: "",
      description: "",
      imageUrl: "",
      status: "active",
    });
    setPreviewImage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (certification: Certification) => {
    setCurrentCertification(certification);
    setFormData({
      ...certification,
      issueDate: certification.issueDate
        ? format(new Date(certification.issueDate), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      expiryDate: certification.expiryDate ? format(new Date(certification.expiryDate), "yyyy-MM-dd") : "",
    });
    setPreviewImage(certification.imageUrl || null);
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, [name]: format(date, "yyyy-MM-dd") }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("image", file);
      uploadData.append("userId", selectedUserId || session?.user.uId || "");

      const response = await axios.post("/api/certifications/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: response.data.url }));
        toast({ title: "Thành công", description: "Đã tải lên hình ảnh chứng nhận." });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên hình ảnh. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.issuer || !formData.issueDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentCertification?._id) {
        await axios.put("/api/certifications", { _id: currentCertification._id, ...formData });
        toast({ title: "Thành công", description: "Đã cập nhật thông tin chứng nhận." });
      } else {
        await axios.post("/api/certifications", formData);
        toast({ title: "Thành công", description: "Đã thêm chứng nhận mới." });
      }
      setIsModalOpen(false);
      fetchCertifications(selectedUserId);
    } catch (error) {
      console.error("Error saving certification:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu thông tin chứng nhận. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chứng nhận này không?")) return;

    try {
      await axios.delete(`/api/certifications/${id}`);
      toast({ title: "Thành công", description: "Đã xóa chứng nhận." });
      fetchCertifications(selectedUserId);
    } catch (error) {
      console.error("Error deleting certification:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa chứng nhận. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const filteredCertifications = certifications.filter((cert) =>
    [cert.name, cert.issuer, cert.description || ""].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.accountId === userId);
    return user ? user.name : "Không xác định";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Quản lý chứng nhận/chứng chỉ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lime-600" />
              <Input
                placeholder="Tìm kiếm chứng nhận..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
              />
            </div>
          </div>
          <Button onClick={handleAddNew} className="bg-lime-600 hover:bg-lime-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Thêm chứng nhận
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : filteredCertifications.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <Award className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">
              {searchTerm ? "Không tìm thấy chứng nhận phù hợp" : "Chưa có chứng nhận nào"}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {searchTerm
                ? "Không tìm thấy chứng nhận nào phù hợp với tìm kiếm của bạn."
                : "Bạn chưa thêm chứng nhận nào vào hệ thống."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCertifications.map((certification) => (
              <motion.div
                key={certification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800">{certification.name}</h3>
                    <p className="text-sm text-slate-500">{certification.issuer}</p>
                    <p className="text-sm text-slate-500">{getUserName(certification.userId)}</p>
                    <p className="text-sm text-slate-500">
                      Ngày cấp: {new Date(certification.issueDate).toLocaleDateString("vi-VN")}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          certification.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {certification.status === "active" ? "Còn hiệu lực" : "Hết hiệu lực"}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(certification)}
                      className="h-8 w-8 text-slate-500 hover:text-lime-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(certification._id!)}
                      className="h-8 w-8 text-slate-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {isDesktop ? (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{currentCertification ? "Cập nhật chứng nhận" : "Thêm chứng nhận mới"}</DialogTitle>
                <DialogDescription>Điền thông tin chứng nhận/chứng chỉ của người dùng.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Tên chứng nhận <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="issuer" className="text-right">
                      Đơn vị cấp <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="issuer"
                      name="issuer"
                      value={formData.issuer}
                      onChange={handleChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="issueDate" className="text-right">
                      Ngày cấp <span className="text-red-500">*</span>
                    </Label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full justify-start text-left font-normal", !formData.issueDate && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.issueDate ? format(new Date(formData.issueDate), "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.issueDate ? new Date(formData.issueDate) : undefined}
                            onSelect={(date) => handleDateChange("issueDate", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isUploading} className="bg-lime-500 hover:bg-lime-600">
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" /> Đang lưu...
                      </>
                    ) : currentCertification ? (
                      "Cập nhật"
                    ) : (
                      "Thêm mới"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{currentCertification ? "Cập nhật chứng nhận" : "Thêm chứng nhận mới"}</DrawerTitle>
                <DrawerDescription>Điền thông tin chứng nhận/chứng chỉ của người dùng.</DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Tên chứng nhận <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="issuer" className="text-right">
                      Đơn vị cấp <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="issuer"
                      name="issuer"
                      value={formData.issuer}
                      onChange={handleChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="issueDate" className="text-right">
                      Ngày cấp <span className="text-red-500">*</span>
                    </Label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full justify-start text-left font-normal", !formData.issueDate && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.issueDate ? format(new Date(formData.issueDate), "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.issueDate ? new Date(formData.issueDate) : undefined}
                            onSelect={(date) => handleDateChange("issueDate", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </form>
                <DrawerFooter>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                      Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isUploading} className="bg-lime-500 hover:bg-lime-600">
                      {isSubmitting ? (
                        <>
                          <Spinner size="sm" className="mr-2" /> Đang lưu...
                        </>
                      ) : currentCertification ? (
                        "Cập nhật"
                      ) : (
                        "Thêm mới"
                      )}
                    </Button>
                  </div>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </CardContent>
    </Card>
  );
}