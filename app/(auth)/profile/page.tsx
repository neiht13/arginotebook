"use client"

import { use, useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import PersonalInfoForm from './PersonalInfoForm'
import ChangePasswordForm from './ChangePasswordForm'
import ProductInfoForm from './ProductInfoForm'
import {Edit2, Lock, ClipboardList, User, Key, Package, LogOutIcon} from 'lucide-react'
import { motion } from 'framer-motion'
import {router} from "next/client";
import {useRouter} from "next/navigation";
import {signOut, useSession} from "next-auth/react";
import {toast} from "react-toastify";
import axios from 'axios'

export default function ProfilePage() {
    const [user, setUser] = useState({
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        avatar: '/placeholder.svg?height=100&width=100',
        phone: '',
        address: '',
        location: { lat: 10.452992, lng: 105.6178176 }
    })
    const { data: session, status } = useSession()
    const fetchData = async () => {
        const response = status === 'authenticated' && await axios.get('/api/user?id=' + session?.user?.uId) || {data: user}
        const data = await response.data
        setUser(data)
    }
    useEffect(() => {
        fetchData()
    }, [status])


    const router = useRouter()
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
    const handleLogout = () => {
        signOut({ callbackUrl: "/auth" }).then(()=>
        toast.success("Đã đăng xuất")
        )
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                <Card className="w-full bg-white shadow-lg rounded-lg">
                    <CardHeader className="relative flex flex-col items-center space-y-4 p-6 border-b">
                        <LogOutIcon onClick={handleLogout} className="absolute top-2 right-2 text-slate-700"/>

                        <div className="relative">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={user?.avatar} alt={user?.name} />
                                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-lime-500 text-white rounded-full p-2 cursor-pointer hover:bg-lime-600 transition-colors">
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
                            <CardTitle className="text-2xl font-semibold text-slate-800">{user?.name}</CardTitle>
                            <CardDescription className="text-slate-500">{user?.email}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Tabs defaultValue="personal" className="w-full">
                            <TabsList className="flex h-auto space-x-2 mb-6 bg-slate-200 p-1 rounded-md">
                                <TabsTrigger
                                    value="personal"
                                    className="flex h-full whitespace-normal items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-lime-500"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Thông Tin Cá Nhân</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="password"
                                    className="flex h-full whitespace-normal items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-lime-500"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>Đổi Mật Khẩu</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="product"
                                    className="flex h-full whitespace-normal items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-lime-500"
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
