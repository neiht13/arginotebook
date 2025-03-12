"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, UserPlus, Search, X, Upload, Link } from "lucide-react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Thay đổi 'units' thành 'cooperatives'
const cooperatives = [
  { id: 1, name: "Hợp tác xã A", color: "bg-red-500" },
  { id: 2, name: "Hợp tác xã B", color: "bg-blue-500" },
  { id: 3, name: "Hợp tác xã C", color: "bg-green-500" },
  { id: 4, name: "Hợp tác xã D", color: "bg-yellow-500" },
  { id: 5, name: "Hợp tác xã E", color: "bg-purple-500" },
]

const mockUsers = [
  { id: 1, name: "Nguyễn Văn Mẫn", username: "nguyenvanman", role: "Người dùng", images: [], cooperativeId: 1 },
  { id: 2, name: "Trần Thị B", username: "tranthib", role: "Quản trị viên", images: [], cooperativeId: 2 },
  { id: 3, name: "Lê Văn C", username: "levanc", role: "Người dùng", images: [], cooperativeId: 3 },
  { id: 4, name: "Phạm Thị D", username: "phamthid", role: "Người dùng", images: [], cooperativeId: 1 },
  { id: 5, name: "Hoàng Văn E", username: "hoangvane", role: "Quản trị viên", images: [], cooperativeId: 4 },
]

export default function UserManagementPage() {
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCooperative, setSelectedCooperative] = useState("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState("list")
  const [selectedCooperativeCard, setSelectedCooperativeCard] = useState(null)

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768)
    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCooperative === "all" || user.cooperativeId === Number.parseInt(selectedCooperative)),
  )

  const handleEditUser = (user) => {
    setCurrentUser(user)
    setIsEditUserOpen(true)
  }

  const handleAddUser = (newUser) => {
    setUsers([...users, { ...newUser, id: users.length + 1 }])
    setIsAddUserOpen(false)
  }

  const handleUpdateUser = (updatedUser) => {
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    setIsEditUserOpen(false)
  }

  const handleCooperativeCardClick = (cooperativeId) => {
    setSelectedCooperativeCard(cooperativeId === selectedCooperativeCard ? null : cooperativeId)
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <Card className="w-full bg-white shadow-lg rounded-lg">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Quản lý người dùng</CardTitle>
              <CardDescription>Quản lý người dùng trong hệ thống</CardDescription>
            </div>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="bg-lime-500 hover:bg-lime-600">
                  <UserPlus className="mr-2 h-4 w-4" /> Thêm người dùng
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm người dùng mới</DialogTitle>
                </DialogHeader>
                <UserForm
                  onSubmit={handleAddUser}
                  onCancel={() => setIsAddUserOpen(false)}
                  cooperatives={cooperatives}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">Danh sách người dùng</TabsTrigger>
                <TabsTrigger value="cooperatives">Hợp tác xã</TabsTrigger>
              </TabsList>
              <TabsContent value="list">
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Search className="text-slate-500" />
                    <Input
                      placeholder="Tìm kiếm người dùng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-grow"
                    />
                  </div>
                  <Select value={selectedCooperative} onValueChange={setSelectedCooperative}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Chọn hợp tác xã" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả hợp tác xã</SelectItem>
                      {cooperatives.map((coop) => (
                        <SelectItem key={coop.id} value={coop.id.toString()}>
                          {coop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isMobile ? (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <Card key={user.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.username}</p>
                            <p className="text-sm text-gray-500">{user.role}</p>
                            <p className="text-sm text-gray-500">
                              {cooperatives.find((u) => u.id === user.cooperativeId)?.name}
                            </p>
                          </div>
                          <Button onClick={() => handleEditUser(user)} variant="ghost" className="h-8 w-8 p-0">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên</TableHead>
                        <TableHead>Tên đăng nhập</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead>Hợp tác xã</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>{cooperatives.find((u) => u.id === user.cooperativeId)?.name}</TableCell>
                          <TableCell>
                            <Button onClick={() => handleEditUser(user)} variant="ghost" className="h-8 w-8 p-0">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
              <TabsContent value="cooperatives">
                <div className="grid grid-cols-3 gap-4">
                  {cooperatives.map((coop) => (
                    <Card
                      key={coop.id}
                      className={`cursor-pointer ${selectedCooperativeCard === coop.id ? "ring-2 ring-lime-500" : ""}`}
                      onClick={() => handleCooperativeCardClick(coop.id)}
                    >
                      <CardHeader className={`${coop.color} text-white p-4`}>
                        <CardTitle className="text-lg">{coop.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">
                          Số lượng người dùng: {users.filter((u) => u.cooperativeId === coop.id).length}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {selectedCooperativeCard && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Người dùng trong {cooperatives.find((c) => c.id === selectedCooperativeCard)?.name}
                    </h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tên</TableHead>
                            <TableHead>Tên đăng nhập</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead>Đường dẫn</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users
                            .filter((u) => u.cooperativeId === selectedCooperativeCard)
                            .map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell><a href={"/tl?user=" +user.username}><Link></Link></a></TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          </DialogHeader>
          <UserForm
            user={currentUser}
            onSubmit={handleUpdateUser}
            onCancel={() => setIsEditUserOpen(false)}
            cooperatives={cooperatives}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UserForm({ user, onSubmit, onCancel, cooperatives }) {
  const [name, setName] = useState(user ? user.name : "")
  const [username, setUsername] = useState(user ? user.username : "")
  const [password, setPassword] = useState("")
  const [ngaybatdau, setNgaybatdau] = useState(user ? user.ngaybatdau : "")
  const [ngayketthuc, setNgayketthuc] = useState(user ? user.ngayketthuc : "")  
  const [role, setRole] = useState(user ? user.role : "Người dùng")
  const [cooperativeId, setCooperativeId] = useState(user ? user.cooperativeId : "")
  const [images, setImages] = useState(user ? user.images : [])
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      id: user ? user.id : null,
      name,
      username,
      password,
      role,
      cooperativeId: Number.parseInt(cooperativeId),
      images,
    })
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map((file) => URL.createObjectURL(file))
    setImages([...images, ...newImages])
  }

  const removeImage = (index) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Tên</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="username">Tên đăng nhập</Label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!user}
          />
        </div>
        <div>
          <Label htmlFor="role">Vai trò</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Người dùng">Người dùng</SelectItem>
              <SelectItem value="Quản trị viên">Quản trị viên</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="cooperative">Hợp tác xã</Label>
        <Select value={cooperativeId.toString()} onValueChange={setCooperativeId}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn hợp tác xã" />
          </SelectTrigger>
          <SelectContent>
            {cooperatives.map((coop) => (
              <SelectItem key={coop.id} value={coop.id.toString()}>
                {coop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ngaybatdau">Ngày bắt đầu</Label>
          <Input id="ngaybatdau" type="date" value={ngaybatdau} onChange={(e) => setNgaybatdau(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="ngayketthuc">Ngày kết thúc</Label>
          <Input id="ngayketthuc" type="date" value={ngayketthuc} onChange={(e) => setNgayketthuc(e.target.value)} required />
        </div>
      </div>
      <div>
        <Label>Hình ảnh</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image || "/placeholder.svg"}
                alt={`User image ${index + 1}`}
                className="w-20 h-20 object-cover rounded"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-20 h-20 flex flex-col items-center justify-center"
            onClick={() => fileInputRef.current.click()}
          >
            <Upload className="h-6 w-6" />
            <span className="text-xs mt-1">Thêm ảnh</span>
          </Button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageUpload}
          multiple
          accept="image/*"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" className="bg-lime-500 hover:bg-lime-600">
          {user ? "Cập nhật" : "Thêm"}
        </Button>
      </div>
    </form>
  )
}

