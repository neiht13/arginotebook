"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pencil, Trash2, Search, Link, ExternalLink } from 'lucide-react'
import Spinner from "@/components/ui/spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"

interface Unit {
  _id: string
  tendonvi: string
}

interface User {
  _id: string
  username: string
  name: string
  email: string
  role: string[]
  xId: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUnit, setSelectedUnit] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: ["USER"],
    xId: "",
    status: "active",
  })

  // Lấy danh sách người dùng và đơn vị
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [usersResponse, unitsResponse] = await Promise.all([
        axios.get("/api/user"),
        axios.get("/api/donvi")
      ])
      setUsers(usersResponse.data)
      setUnits(unitsResponse.data)
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải dữ liệu người dùng và đơn vị"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Lọc người dùng theo từ khóa tìm kiếm và đơn vị
  const filteredUsers = users.length > 0 && users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesUnit = selectedUnit === "all" || user.xId === selectedUnit
    
    return matchesSearch && matchesUnit
  })

  // Xử lý thay đổi dữ liệu form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Xử lý thay đổi select
  const handleSelectChange = (name: string, value: string) => {
    if (name === "role") {
      // Xử lý role đặc biệt vì nó là mảng
      const roles = value === "ADMIN" ? ["USER", "ADMIN"] : ["USER"]
      setFormData((prev) => ({
        ...prev,
        role: roles,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Xử lý thêm người dùng mới
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post("/api/user", formData)
      setUsers([...users, response.data])
      setIsAddDialogOpen(false)
      setFormData({
        username: "",
        password: "",
        name: "",
        email: "",
        role: ["USER"],
        xId: "",
        status: "active",
      })
      toast({
        title: "Thành công",
        description: "Thêm người dùng thành công"
      })
    } catch (error) {
      console.error("Lỗi khi thêm người dùng:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm người dùng"
      })
    }
  }

  // Xử lý cập nhật người dùng
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    try {
      // Nếu password trống, không gửi lên server
      const dataToSend = {...formData}
      if (!dataToSend.password) {
        delete dataToSend.password
      }

      const response = await axios.put(`/api/user/${currentUser._id}`, dataToSend)
      setUsers(users.map((user) => (user._id === currentUser._id ? response.data : user)))
      setIsEditDialogOpen(false)
      toast({
        title: "Thành công",
        description: "Cập nhật người dùng thành công"
      })
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật người dùng"
      })
    }
  }

  // Xử lý xóa người dùng
  const handleDeleteUser = async () => {
    if (!currentUser) return

    try {
      await axios.delete(`/api/user?id=${currentUser._id}`)
      setUsers(users.filter((user) => user._id !== currentUser._id))
      setIsDeleteDialogOpen(false)
      toast({
        title: "Thành công",
        description: "Xóa người dùng thành công"
      })
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa người dùng"
      })
    }
  }

  // Mở dialog chỉnh sửa và điền dữ liệu
  const openEditDialog = (user: User) => {
    setCurrentUser(user)
    setFormData({
      username: user.username,
      password: "", // Không hiển thị mật khẩu cũ
      name: user.name,
      email: user.email,
      role: user.role,
      xId: user.xId,
      status: user.status,
    })
    setIsEditDialogOpen(true)
  }

  // Mở dialog xóa
  const openDeleteDialog = (user: User) => {
    setCurrentUser(user)
    setIsDeleteDialogOpen(true)
  }

  // Lấy tên đơn vị từ ID
  const getUnitName = (xId: string) => {
    const unit = units.find((u) => u._id === xId)
    return unit ? unit.tendonvi : "Không có đơn vị"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Quản lý người dùng</CardTitle>
          <CardDescription>Thêm, sửa, xóa người dùng trong hệ thống</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-lime-600 hover:bg-lime-700">
              <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm người dùng mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Họ tên</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Vai trò</Label>
                  <Select
                    value={formData.role.includes("ADMIN") ? "ADMIN" : "USER"}
                    onValueChange={(value) => handleSelectChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Người dùng</SelectItem>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="xId">Đơn vị</Label>
                  <Select
                    value={formData.xId}
                    onValueChange={(value) => handleSelectChange("xId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đơn vị" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit._id} value={unit._id}>
                          {unit.tendonvi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-lime-600 hover:bg-lime-700">
                  Thêm
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Lọc theo đơn vị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đơn vị</SelectItem>
              {units.map((unit) => (
                <SelectItem key={unit._id} value={unit._id}>
                  {unit.tendonvi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : filteredUsers && filteredUsers.length === 0 ? (
          <EmptyState
            title="Không có người dùng nào"
            description="Không tìm thấy người dùng phù hợp với điều kiện tìm kiếm."
            icon={<Search className="h-10 w-10" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Tên đăng nhập</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Trang cá nhân</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers && filteredUsers.length > 0 && filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getUnitName(user.xId)}</TableCell>
                    <TableCell>
                      {user.role?.includes("ADMIN") ? "Quản trị viên" : "Người dùng"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`/timeline?user=${user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Xem
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                        className="text-slate-500 hover:text-lime-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(user)}
                        className="text-slate-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Dialog chỉnh sửa người dùng */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-username">Tên đăng nhập</Label>
                  <Input
                    id="edit-username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-password">Mật khẩu (để trống nếu không đổi)</Label>
                  <Input
                    id="edit-password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Họ tên</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Vai trò</Label>
                  <Select
                    value={formData.role.includes("ADMIN") ? "ADMIN" : "USER"}
                    onValueChange={(value) => handleSelectChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Người dùng</SelectItem>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-xId">Đơn vị</Label>
                  <Select
                    value={formData.xId}
                    onValueChange={(value) => handleSelectChange("xId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đơn vị" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit._id} value={unit._id}>
                          {unit.tendonvi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-lime-600 hover:bg-lime-700">
                  Cập nhật
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog xác nhận xóa người dùng */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Bạn có chắc chắn muốn xóa người dùng{" "}
                <span className="font-semibold">{currentUser?.name}</span> không?
              </p>
              <p className="text-sm text-red-500 mt-2">
                Lưu ý: Tất cả dữ liệu liên quan đến người dùng này sẽ bị xóa và không thể khôi phục.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteUser}
              >
                Xóa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
