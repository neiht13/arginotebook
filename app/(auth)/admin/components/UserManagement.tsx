"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, ExternalLink, WifiOff, AlertTriangle, Users } from "lucide-react";
import Spinner from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/use-toast";
import { useUserStore } from "@/lib/stores/user-store";
import { useNetworkStore } from "@/lib/network-status";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string[];
  xId: string;
  status: boolean;
  _pendingCreation?: boolean;
  _pendingUpdate?: boolean;
  _pendingDeletion?: boolean;
}

interface Unit {
  _id: string;
  tendonvi: string;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const isOnline = useNetworkStore((state) => state.isOnline);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { users, units, isLoadingUsers, isLoadingUnits, fetchUsers, fetchUnits, addUser, updateUser, deleteUser, getUnitName } = useUserStore();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: ["USER"] as string[],
    xId: "",
    status: "true",
  });

  useEffect(() => {
    fetchUsers();
    fetchUnits();
  }, [fetchUsers, fetchUnits]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = [user.name, user.username, user.email].some((field) =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesUnit = selectedUnit === "all" || user.xId === selectedUnit;
    return matchesSearch && matchesUnit && (isOnline || !user._pendingDeletion);
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "role" ? (value === "ADMIN" ? ["USER", "ADMIN"] : ["USER"]) : value,
    }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.name || !formData.email || !formData.password) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng điền đầy đủ các trường bắt buộc" });
      return;
    }
    try {
      await addUser(formData);
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Thành công",
        description: isOnline ? "Thêm người dùng thành công" : "Đã lưu người dùng mới (chế độ ngoại tuyến)",
      });
    } catch (error) {
      console.error("Lỗi khi thêm người dùng:", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể thêm người dùng" });
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !formData.username || !formData.name || !formData.email) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng điền đầy đủ các trường bắt buộc" });
      return;
    }
    try {
      const dataToSend = { ...formData };
      if (!dataToSend.password) delete dataToSend.password;
      await updateUser(currentUser._id, dataToSend);
      setIsEditDialogOpen(false);
      toast({
        title: "Thành công",
        description: isOnline ? "Cập nhật người dùng thành công" : "Đã lưu thay đổi (chế độ ngoại tuyến)",
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể cập nhật người dùng" });
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;
    try {
      await deleteUser(currentUser._id);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Thành công",
        description: isOnline ? "Xóa người dùng thành công" : "Đã đánh dấu xóa người dùng (chế độ ngoại tuyến)",
      });
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể xóa người dùng" });
    }
  };

  const openEditDialog = (user: User) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      password: "",
      name: user.name,
      email: user.email,
      role: user.role,
      xId: user.xId,
      status: user.status.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ username: "", password: "", name: "", email: "", role: ["USER"], xId: "", status: "true" });
  };

  const FormFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username">Tên đăng nhập <span className="text-red-500">*</span></Label>
          <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="password">{currentUser ? "Mật khẩu (để trống nếu không đổi)" : "Mật khẩu"} <span className="text-red-500">*</span></Label>
          <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required={!currentUser} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Họ tên <span className="text-red-500">*</span></Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Vai trò</Label>
          <Select value={formData.role?.includes("ADMIN") ? "ADMIN" : "USER"} onValueChange={(value) => handleSelectChange("role", value)}>
            <SelectTrigger><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">Người dùng</SelectItem>
              <SelectItem value="ADMIN">Quản trị viên</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="xId">Đơn vị</Label>
          <Select value={formData.xId} onValueChange={(value) => handleSelectChange("xId", value)}>
            <SelectTrigger><SelectValue placeholder="Chọn đơn vị" /></SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit._id} value={unit._id}>{unit.tendonvi}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="status">Trạng thái</Label>
        <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
          <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Hoạt động</SelectItem>
            <SelectItem value="false">Không hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Quản lý người dùng</CardTitle>
          <CardDescription>Thêm, sửa, xóa người dùng trong hệ thống</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {!isOnline && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
            <div className="flex items-start">
              <WifiOff className="h-5 w-5 text-amber-500" />
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  Bạn đang ở chế độ ngoại tuyến. Các thay đổi sẽ được lưu cục bộ và đồng bộ khi có kết nối mạng.
                </p>
              </div>
            </div>
          </div>
        )}
        {isOnline && users.some((user) => user._pendingCreation || user._pendingUpdate || user._pendingDeletion) && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Có thay đổi chưa được đồng bộ với máy chủ. Vui lòng đồng bộ dữ liệu khi có thể.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lime-600" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
              />
            </div>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-full md:w-64 border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500">
                <SelectValue placeholder="Lọc theo đơn vị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đơn vị</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit._id} value={unit._id}>{unit.tendonvi}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-lime-600 hover:bg-lime-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
          </Button>
        </div>

        {isLoadingUsers || isLoadingUnits ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">
              {searchTerm ? "Không tìm thấy người dùng phù hợp" : "Chưa có người dùng nào"}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {searchTerm ? "Không tìm thấy người dùng nào phù hợp với tìm kiếm của bạn." : "Bạn chưa thêm người dùng nào vào hệ thống."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800">
                      {user.name}
                      {user._pendingCreation && <span className="ml-2 text-xs text-blue-600">(Chưa đồng bộ)</span>}
                      {user._pendingUpdate && <span className="ml-2 text-xs text-amber-600">(Đã chỉnh sửa)</span>}
                    </h3>
                    <p className="text-sm text-slate-500">{user.username}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <p className="text-sm text-slate-500">{getUnitName(user.xId) || "Chưa có đơn vị"}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {user.status ? "Hoạt động" : "Không hoạt động"}
                      </span>
                      <span className="text-xs text-slate-500">{user.role?.includes("ADMIN") ? "Quản trị viên" : "Người dùng"}</span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} className="h-8 w-8 text-slate-500 hover:text-lime-600" disabled={user._pendingDeletion}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(user)} className="h-8 w-8 text-slate-500 hover:text-red-600" disabled={user._pendingDeletion}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <a href={`/timeline?user=${user.username}`} target="_blank" rel="noopener noreferrer" className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-blue-600">
                      <ExternalLink className="h-4 w-4" />
                    </a>
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
              <DialogHeader><DialogTitle>Thêm người dùng mới</DialogTitle></DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
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
                <DrawerTitle>Thêm người dùng mới</DrawerTitle>
                <DrawerDescription>Điền thông tin người dùng mới vào hệ thống</DrawerDescription>
              </DrawerHeader>
              <form onSubmit={handleAddUser} className="space-y-4 p-4">
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
              <DialogHeader><DialogTitle>Chỉnh sửa người dùng</DialogTitle></DialogHeader>
              <form onSubmit={handleEditUser} className="space-y-4">
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
                <DrawerTitle>Chỉnh sửa người dùng</DrawerTitle>
                <DrawerDescription>Cập nhật thông tin người dùng</DrawerDescription>
              </DrawerHeader>
              <form onSubmit={handleEditUser} className="space-y-4 p-4">
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
                <p>Bạn có chắc chắn muốn xóa người dùng <span className="font-semibold">{currentUser?.name}</span> không?</p>
                <p className="text-sm text-red-500 mt-2">Lưu ý: Hành động này không thể hoàn tác.</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
                <Button type="button" variant="destructive" onClick={handleDeleteUser}>Xóa</Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Xác nhận xóa</DrawerTitle>
                <DrawerDescription>Bạn có chắc chắn muốn xóa người dùng <span className="font-semibold">{currentUser?.name}</span> không?</DrawerDescription>
              </DrawerHeader>
              <div className="p-4">
                <p className="text-sm text-red-500">Lưu ý: Hành động này không thể hoàn tác.</p>
              </div>
              <DrawerFooter>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
                  <Button type="button" variant="destructive" onClick={handleDeleteUser}>Xóa</Button>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </CardContent>
    </Card>
  );
}