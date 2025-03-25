"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Award, CalendarIcon, Building, FileImage, Plus, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Spinner from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

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

export default function CertificationsTab() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.uId) fetchCertifications();
  }, [session?.user?.uId]);

  const fetchCertifications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/certifications?userId=${session.user.uId}`);
      setCertifications(response.data);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      toast({ variant: "destructive", description: "Không thể tải chứng nhận" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setCurrentCertification(null);
    setFormData({
      userId: session?.user?.uId || "",
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
      issueDate: format(new Date(certification.issueDate), "yyyy-MM-dd"),
      expiryDate: certification.expiryDate ? format(new Date(certification.expiryDate), "yyyy-MM-dd") : "",
    });
    setPreviewImage(certification.imageUrl || null);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, [name]: format(date, "yyyy-MM-dd") }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", description: "Ảnh không được lớn hơn 5MB" });
      return;
    }

    const preview = URL.createObjectURL(file);
    setPreviewImage(preview);

    try {
      const uploadForm = new FormData();
      uploadForm.append("image", file);
      uploadForm.append("userId", session?.user?.uId || "");

      const response = await axios.post("/api/certifications/upload", uploadForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: response.data.url }));
        URL.revokeObjectURL(preview);
        toast({ description: "Tải ảnh thành công" });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({ variant: "destructive", description: "Không thể tải ảnh" });
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.issuer || !formData.issueDate) {
      toast({ variant: "destructive", description: "Vui lòng điền đầy đủ thông tin bắt buộc" });
      return;
    }
    if (formData.expiryDate && new Date(formData.expiryDate) < new Date(formData.issueDate)) {
      toast({ variant: "destructive", description: "Ngày hết hạn phải sau ngày cấp" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentCertification?._id) {
        await axios.put("/api/certifications", { _id: currentCertification._id, ...formData });
        toast({ description: "Cập nhật chứng nhận thành công" });
      } else {
        await axios.post("/api/certifications", formData);
        toast({ description: "Thêm chứng nhận thành công" });
      }
      setIsModalOpen(false);
      fetchCertifications();
    } catch (error) {
      console.error("Error saving certification:", error);
      toast({ variant: "destructive", description: "Không thể lưu chứng nhận" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa chứng nhận này?")) return;
    try {
      await axios.delete(`/api/certifications/${id}`);
      toast({ description: "Xóa chứng nhận thành công" });
      fetchCertifications();
    } catch (error) {
      console.error("Error deleting certification:", error);
      toast({ variant: "destructive", description: "Không thể xóa chứng nhận" });
    }
  };

  const getStatusText = (status: string) => ({
    active: "Còn hiệu lực",
    expired: "Hết hạn",
    revoked: "Đã thu hồi",
  }[status] || "Không xác định");

  const getStatusColor = (status: string) => ({
    active: "bg-lime-100 text-lime-800",
    expired: "bg-yellow-100 text-yellow-800",
    revoked: "bg-red-100 text-red-800",
  }[status] || "bg-slate-100 text-slate-800");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Chứng nhận</h2>
        <Button onClick={handleAddNew} className="bg-lime-500 hover:bg-lime-600">
          <Plus className="mr-2 h-4 w-4" />
          Thêm chứng nhận
        </Button>
      </div>

      {certifications.length === 0 ? (
        <EmptyState
          icon={<Award className="h-12 w-12 text-lime-400" />}
          title="Chưa có chứng nhận"
          description="Thêm chứng nhận để hiển thị tại đây."
          action={<Button onClick={handleAddNew} className="bg-lime-500 hover:bg-lime-600"><Plus className="mr-2 h-4 w-4" />Thêm chứng nhận</Button>}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {certifications.map((cert) => (
            <motion.div key={cert._id} variants={itemVariants}>
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2 bg-lime-50">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-slate-800">{cert.name}</CardTitle>
                    <Badge className={getStatusColor(cert.status)}>{getStatusText(cert.status)}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 flex items-center">
                    <Building className="h-4 w-4 mr-1 text-lime-700" />
                    {cert.issuer}
                  </p>
                </CardHeader>
                <CardContent className="flex-grow p-4">
                  <div className="space-y-2 text-sm text-slate-600">
                    <p><CalendarIcon className="h-4 w-4 mr-2 inline text-lime-700" />Ngày cấp: {format(new Date(cert.issueDate), "dd/MM/yyyy", { locale: vi })}</p>
                    {cert.expiryDate && (
                      <p><CalendarIcon className="h-4 w-4 mr-2 inline text-lime-700" />Hết hạn: {format(new Date(cert.expiryDate), "dd/MM/yyyy", { locale: vi })}</p>
                    )}
                    {cert.description && <p className="line-clamp-2 mt-2">{cert.description}</p>}
                  </div>
                </CardContent>
                <CardFooter className="p-4 flex justify-between">
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(cert)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Sửa</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(cert._id!)} className="text-red-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xóa</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {cert.imageUrl && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <FileImage className="h-4 w-4 mr-1" />
                          Xem ảnh
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <img src={cert.imageUrl} alt={cert.name} className="w-full h-auto object-contain rounded-md" />
                        <p className="text-center text-sm text-slate-600 mt-2">{cert.issuer} - {format(new Date(cert.issueDate), "dd/MM/yyyy", { locale: vi })}</p>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentCertification ? "Cập nhật chứng nhận" : "Thêm chứng nhận mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="name" className="text-right">Tên chứng nhận <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="issuer" className="text-right">Đơn vị cấp <span className="text-red-500">*</span></Label>
              <Input id="issuer" name="issuer" value={formData.issuer} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="issueDate" className="text-right">Ngày cấp <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("col-span-3 justify-start text-left font-normal", !formData.issueDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.issueDate ? format(new Date(formData.issueDate), "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
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
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="expiryDate" className="text-right">Ngày hết hạn</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("col-span-3 justify-start text-left font-normal", !formData.expiryDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiryDate ? format(new Date(formData.expiryDate), "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expiryDate ? new Date(formData.expiryDate) : undefined}
                    onSelect={(date) => handleDateChange("expiryDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="status" className="text-right">Trạng thái</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} className="col-span-3">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Còn hiệu lực</SelectItem>
                  <SelectItem value="expired">Hết hạn</SelectItem>
                  <SelectItem value="revoked">Đã thu hồi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 gap-4 items-start">
              <Label htmlFor="description" className="text-right">Mô tả</Label>
              <Textarea id="description" name="description" value={formData.description || ""} onChange={handleChange} className="col-span-3" rows={3} />
            </div>
            <div className="grid grid-cols-4 gap-4 items-start">
              <Label htmlFor="imageUpload" className="text-right">Hình ảnh</Label>
              <div className="col-span-3 space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("imageUpload")?.click()}
                  disabled={isSubmitting}
                >
                  <FileImage className="mr-2 h-4 w-4" />
                  Chọn ảnh
                </Button>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isSubmitting}
                />
                {previewImage && (
                  <div className="relative mt-2">
                    <img src={previewImage} alt="Preview" className="max-h-[200px] rounded-md border border-lime-200" />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 bg-white hover:bg-red-50"
                      onClick={() => { setPreviewImage(null); setFormData((prev) => ({ ...prev, imageUrl: "" })); }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Hủy</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-lime-500 hover:bg-lime-600">
                {isSubmitting ? <><Spinner size="sm" className="mr-2" />Đang lưu...</> : currentCertification ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}