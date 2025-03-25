// app/complete-profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useUserStore } from "@/lib/stores/user-store";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";

export default function CompleteProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    phone: "",
    xId: "",
  });
  const { units, fetchUnits } = useUserStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.xId) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn đơn vị",
      });
      return;
    }

    try {
      const { db } = await connectToDatabase();
      const unit = await db.collection('donvi').findOne({ _id: new ObjectId(form.xId) });

      // Lấy accountId từ user
      const user = await db.collection('user').findOne({ email: session?.user.email });
      if (!user) throw new Error("User not found");

      // Cập nhật account
      await axios.put(`/api/account/${user.accountId}`, {
        xId: form.xId,
      });

      // Cập nhật user
      await axios.put(`/api/user/${user._id}`, {
        phone: form.phone,
        xId: form.xId,
        diachi: unit?.diachi || '',
        donvihtx: unit?.tendonvi || '',
      });

      toast({
        title: "Thành công",
        description: "Thông tin đã được cập nhật, chờ admin kích hoạt tài khoản",
      });
      router.push("/auth");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật thông tin",
      });
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Hoàn thiện thông tin</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="xId">Đơn vị</Label>
            <Select
              value={form.xId}
              onValueChange={(value) => setForm({ ...form, xId: value })}
              required
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
          <Button type="submit" className="w-full">
            Hoàn tất
          </Button>
        </form>
      </div>
    </div>
  );
}