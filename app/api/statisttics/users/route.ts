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
    const { searchParams } = new URL(request.url)
    const unitId = searchParams.get("unitId")

    const userCollection = db.collection("user")
    const donviCollection = db.collection("donvi")

    // Lấy tất cả đơn vị để hiển thị tên
    const units = await donviCollection.find({}).toArray()
    const unitsMap = units.reduce((acc, unit) => {
      acc[unit._id.toString()] = unit.tendonvi
      return acc
    }, {})

    // Xây dựng query dựa trên unitId
    const query = unitId ? { xId: unitId } : {}

    // Lấy tất cả người dùng theo query
    const users = await userCollection.find(query).toArray() || []

    // Tính toán thống kê
    const totalUsers = users.length
    const activeUsers = users.filter((user) => user.status === "active").length
    const adminUsers = users.filter((user) => user.role && user.role.includes("ADMIN")).length

    // Nhóm người dùng theo đơn vị
    const usersByUnitMap = {}
    users.forEach((user) => {
      const unitId = user.xId
      if (!unitId) return

      if (!usersByUnitMap[unitId]) {
        usersByUnitMap[unitId] = 0
      }
      usersByUnitMap[unitId]++
    })

    // Chuyển đổi thành mảng để trả về
    const usersByUnit = Object.entries(usersByUnitMap).map(([unitId, count]) => ({
      unitId,
      unitName: unitsMap[unitId] || "Không xác định",
      count,
    }))

    return NextResponse.json(
      {
        totalUsers,
        activeUsers,
        adminUsers,
        usersByUnit,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Lỗi khi lấy thống kê người dùng:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

