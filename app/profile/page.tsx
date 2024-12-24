"use client"

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import PersonalInfoForm from './PersonalInfoForm'
import ChangePasswordForm from './ChangePassswordForm'
import ProductInfoForm from './ProductInfoForm'

export default function ProfilePage() {
    const [user, setUser] = useState({
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        avatar: '/placeholder.svg?height=100&width=100'
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
        <div className="container mx-auto p-4">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                            </svg>
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
                        <CardTitle className="text-2xl">{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="h-auto grid w-full grid-cols-3 mb-4">
                            <TabsTrigger
                                className="flex flex-col items-center justify-center h-full whitespace-normal text-center"
                                value="personal"
                            >
                                Thông tin cá nhân
                            </TabsTrigger>
                            <TabsTrigger
                                className="flex flex-col items-center justify-center h-full  whitespace-normal text-center"
                                value="password"
                            >
                                Đổi mật khẩu
                            </TabsTrigger>
                            <TabsTrigger
                                className="flex flex-col items-center justify-center h-full  whitespace-normal text-center"
                                value="product"
                            >
                                Thông tin sản phẩm
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="personal">
                            <PersonalInfoForm user={user} setUser={setUser} />
                        </TabsContent>
                        <TabsContent value="password">
                            <ChangePasswordForm />
                        </TabsContent>
                        <TabsContent value="product">
                            <ProductInfoForm />
                        </TabsContent>
                    </Tabs>

                </CardContent>
            </Card>
        </div>
    )
}

