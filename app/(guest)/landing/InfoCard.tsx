"use client ";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";


// @ts-ignore
export default function InfoCard({user}) {
  return (
    <div id="info" className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center mb-6">Thông tin nông hộ</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Các thông tin liên hệ của nông hộ.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={"https://gaochauthanhdt.vn/api/images/download?filename=" + user?.image}
                alt="User avatar"
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-sm text-gray-500">Địa chỉ: {user?.diaChi}</p>
              <p className="text-sm text-gray-500">Diện tích canh tác: {user?.dientich}</p>
              <p className="text-sm text-gray-500">HXT nông nghiệp: {user?.donvihtx}</p>
              <div className="mt-2">
                <Badge variant="secondary">{user?.phone}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <div className="flex flex-col md:flex-row">
            <CardContent className="flex-1 p-6 md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4">
              <h1 className="font-semibold mb-8">Thông tin chứng nhận</h1>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  Chứng nhận nông sản
                </h3>
                <p className="text-sm text-muted-foreground">
                  Từ ngày: 20/09/2023
                </p>
                <p className="text-sm text-muted-foreground">
                  Đến ngày: 20/09/2025
                </p>
                <p className="text-sm mt-2">
                  Chứng nhận nông sản sạch, an toàn theo tiêu chuẩn của tổ chức.
                </p>
                <div className="mt-2">
                  <Badge variant="secondary" className="ml-2">
                    ST25
                  </Badge>
                  <Badge variant="secondary" className="ml-2">
                    IR504
                  </Badge>
                  <Badge variant="secondary" className="ml-2">
                    OM18  
                  </Badge>
                </div>
              </div>
              
            </CardContent>
            <div className="md:w-1/3">
              <img
                src="https://th.bing.com/th/id/OIP.BYccsyj9oZY7vl6XQvvHGAHaKY?rs=1&pid=ImgDetMain"
                alt="Card image"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
