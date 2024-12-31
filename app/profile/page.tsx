"use client"

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import PersonalInfoForm from './PersonalInfoForm'
import ChangePasswordForm from './ChangePasswordForm'
import ProductInfoForm from './ProductInfoForm'
import { Edit2, Lock, ClipboardList, User, Key, Package } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ProfilePage() {
    const [user, setUser] = useState({
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        avatar: '/placeholder.svg?height=100&width=100',
        phone: '',
        address: '',
        location: { lat: 10.452992, lng: 105.6178176 }
    })

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setUser(prev => ({ ...prev, avatar: reader.result }))
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                <Card className="w-full bg-white shadow-lg rounded-lg">
                    <CardHeader className="flex flex-col items-center space-y-4 p-6 border-b">
                        <div className="relative">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-cyan-500 text-white rounded-full p-2 cursor-pointer hover:bg-cyan-600 transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </label>
                            <Input
                                id="avatar-upload"
                                type="file"
                                className="hidden"
                                onChange={handleAvatarChange}
                                accept="image/*"
                            />
                        </div>
                        <div className="text-center">
                            <CardTitle className="text-2xl font-semibold text-gray-800">{user.name}</CardTitle>
                            <CardDescription className="text-gray-500">{user.email}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Tabs defaultValue="personal" className="w-full">
                            <TabsList className="flex h-auto space-x-2 mb-6 bg-gray-200 p-1 rounded-md">
                                <TabsTrigger
                                    value="personal"
                                    className="flex h-full whitespace-normal items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Thông Tin Cá Nhân</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="password"
                                    className="flex h-full whitespace-normal items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>Đổi Mật Khẩu</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="product"
                                    className="flex h-full whitespace-normal items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <Package className="w-4 h-4" />
                                    <span>Thông Tin Sản Phẩm</span>
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="personal" className="mt-4">
                                <PersonalInfoForm user={user} setUser={setUser} />
                            </TabsContent>
                            <TabsContent value="password" className="mt-4">
                                <ChangePasswordForm />
                            </TabsContent>
                            <TabsContent value="product" className="mt-4">
                                <ProductInfoForm />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
