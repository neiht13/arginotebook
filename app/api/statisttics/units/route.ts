import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOption"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Kiểm tra quyền ADMIN
  if (!session.user.role.includes("ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { db } = await connectToDatabase()

    // Lấy tất cả đơn vị
    const units = await db.collection("donvi").find({}).toArray()

    // Tính tổng diện tích
    const totalArea = units.reduce((sum, unit) => sum + (unit.dientich || 0), 0)

    // Giả định: 30% diện tích là hữu cơ (có thể thay đổi logic này)
    const organicArea = totalArea * 0.3

    // Chuẩn bị dữ liệu đơn vị
    const unitAreas = units.map((unit) => ({
      unitId: unit._id.toString(),
      unitName: unit.tendonvi,
      area: unit.dientich || 0,
    }))

    return NextResponse.json(
      {
        totalArea,
        organicArea,
        unitAreas,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Lỗi khi lấy thống kê đơn vị:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

