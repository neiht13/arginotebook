"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Search, Building2 } from "lucide-react";
import Spinner from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

interface Unit {
  _id: string;
  tendonvi: string;
  mota: string;
  diachi: string;
  sodienthoai: string;
  email: string;
  dientich: number;
  createdAt: string;
  updatedAt: string;
}

export default function UnitManagement() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [formData, setFormData] = useState({
    tendonvi: "",
    mota: "",
    diachi: "",
    sodienthoai: "",
    email: "",
    dientich: 0,
  });

  const fetchUnits = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/donvi");
      setUnits(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn vị:", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải danh sách đơn vị" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const filteredUnits = units.filter((unit) => unit.tendonvi.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "dientich" ? Math.max(0, parseFloat(value) || 0) : value,
    }));
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tendonvi) {
      toast({ variant: "destructive", title: "Lỗi", description: "Tên đơn vị là bắt buộc" });
      return;
    }
    try {
      const response = await axios.post("/api/donvi", formData);
      setUnits([...units, response.data]);
      setIsAddDialogOpen(false);
      resetForm();
      toast({ title: "Thành công", description: "Thêm đơn vị thành công" });
    } catch (error) {
      console.error("Lỗi khi thêm đơn vị:", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể thêm đơn vị" });
    }
  };

  const handleEditUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUnit || !formData.tendonvi) {
      toast({ variant: "destructive", title: "Lỗi", description: "Tên đơn vị là bắt buộc" });
      return;
    }
    try {
      const response = await axios.put(`/api/donvi/${currentUnit._id}`, formData);
      setUnits(units.map((unit) => (unit._id === currentUnit._id ? response.data : unit)));
      setIsEditDialogOpen(false);
      toast({ title: "Thành công", description: "Cập nhật đơn vị thành công" });
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn vị:", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể cập nhật đơn vị" });
    }
  };

  const handleDeleteUnit = async () => {
    if (!currentUnit) return;
    try {
      await axios.delete(`/api/donvi/${currentUnit._id}`);
      setUnits(units.filter((unit) => unit._id !== currentUnit._id));
      setIsDeleteDialogOpen(false);
      toast({ title: "Thành công", description: "Xóa đơn vị thành công" });
    } catch (error) {
      console.error("Lỗi khi xóa đơn vị:", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể xóa đơn vị" });
    }
  };

  const openEditDialog = (unit: Unit) => {
    setCurrentUnit(unit);
    setFormData({ ...unit });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (unit: Unit) => {
    setCurrentUnit(unit);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ tendonvi: "", mota: "", diachi: "", sodienthoai: "", email: "", dientich: 0 });
  };

  const FormFields = () => (
    <>
      <div>
        <Label htmlFor="tendonvi">Tên đơn vị <span className="text-red-500">*</span></Label>
        <Input id="tendonvi" name="tendonvi" value={formData.tendonvi} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="mota">Mô tả</Label>
        <Textarea id="mota" name="mota" value={formData.mota} onChange={handleChange} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="diachi">Địa chỉ</Label>
          <Input id="diachi" name="diachi" value={formData.diachi} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="sodienthoai">Số điện thoại</Label>
          <Input id="sodienthoai" name="sodienthoai" value={formData.sodienthoai} onChange={handleChange} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="dientich">Diện tích (ha)</Label>
          <Input
            id="dientich"
            name="dientich"
            type="number"
            step="0.01"
            min="0"
            value={formData.dientich}
            onChange={handleChange}
          />
        </div>
      </div>
    </>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Quản lý đơn vị</CardTitle>
          <CardDescription>Thêm, sửa, xóa các đơn vị trong hệ thống</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lime-700" />
            <Input
              placeholder="Tìm kiếm đơn vị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
            />
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-lime-600 hover:bg-lime-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Thêm đơn vị
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : filteredUnits.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <Building2 className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">
              {searchTerm ? "Không tìm thấy đơn vị phù hợp" : "Chưa có đơn vị nào"}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {searchTerm ? "Không tìm thấy đơn vị nào phù hợp với tìm kiếm của bạn." : "Bạn chưa thêm đơn vị nào vào hệ thống."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnits.map((unit) => (
              <motion.div
                key={unit._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800">{unit.tendonvi}</h3>
                    <p className="text-sm text-slate-500">{unit.diachi || "Chưa có địa chỉ"}</p>
                    <p className="text-sm text-slate-500">{unit.sodienthoai || "Chưa có số điện thoại"}</p>
                    <p className="text-sm text-slate-500">{unit.email || "Chưa có email"}</p>
                    <p className="text-sm text-slate-500 mt-2">Diện tích: {unit.dientich?.toFixed(2)} ha</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(unit)} className="h-8 w-8 text-slate-500 hover:text-lime-700">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(unit)} className="h-8 w-8 text-slate-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Dialog/Drawer */}
        {isDesktop ? (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Thêm đơn vị mới</DialogTitle></DialogHeader>
              <form onSubmit={handleAddUnit} className="space-y-4">
                <FormFields />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
                  <Button type="submit" className="bg-lime-600 hover:bg-lime-700">Thêm</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Thêm đơn vị mới</DrawerTitle>
                <DrawerDescription>Điền thông tin đơn vị mới vào hệ thống</DrawerDescription>
              </DrawerHeader>
              <form onSubmit={handleAddUnit} className="space-y-4 p-4">
                <FormFields />
                <DrawerFooter>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
                    <Button type="submit" className="bg-lime-600 hover:bg-lime-700">Thêm</Button>
                  </div>
                </DrawerFooter>
              </form>
            </DrawerContent>
          </Drawer>
        )}

        {/* Edit Dialog/Drawer */}
        {isDesktop ? (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Chỉnh sửa đơn vị</DialogTitle></DialogHeader>
              <form onSubmit={handleEditUnit} className="space-y-4">
                <FormFields />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
                  <Button type="submit" className="bg-lime-600 hover:bg-lime-700">Cập nhật</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Chỉnh sửa đơn vị</DrawerTitle>
                <DrawerDescription>Cập nhật thông tin đơn vị</DrawerDescription>
              </DrawerHeader>
              <form onSubmit={handleEditUnit} className="space-y-4 p-4">
                <FormFields />
                <DrawerFooter>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
                    <Button type="submit" className="bg-lime-600 hover:bg-lime-700">Cập nhật</Button>
                  </div>
                </DrawerFooter>
              </form>
            </DrawerContent>
          </Drawer>
        )}

        {/* Delete Dialog/Drawer */}
        {isDesktop ? (
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Xác nhận xóa</DialogTitle></DialogHeader>
              <div className="py-4">
                <p>Bạn có chắc chắn muốn xóa đơn vị <span className="font-semibold">{currentUnit?.tendonvi}</span> không?</p>
                <p className="text-sm text-red-500 mt-2">Lưu ý: Hành động này không thể hoàn tác.</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
                <Button type="button" variant="destructive" onClick={handleDeleteUnit}>Xóa</Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Xác nhận xóa</DrawerTitle>
                <DrawerDescription>Bạn có chắc chắn muốn xóa đơn vị <span className="font-semibold">{currentUnit?.tendonvi}</span> không?</DrawerDescription>
              </DrawerHeader>
              <div className="p-4">
                <p className="text-sm text-red-500">Lưu ý: Hành động này không thể hoàn tác.</p>
              </div>
              <DrawerFooter>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
                  <Button type="button" variant="destructive" onClick={handleDeleteUnit}>Xóa</Button>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </CardContent>
    </Card>
  );
}