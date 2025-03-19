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

    // Lấy danh sách người dùng thuộc đơn vị (nếu có)
    let userIds = []
    if (unitId) {
      const users = await db.collection("user").find({ xId: unitId }).toArray()
      userIds = users.map((user) => user._id.toString())
    }

    // Xây dựng query dựa trên unitId
    const query = unitId ? { uId: { $in: userIds } } : {}

    // Lấy tất cả công việc theo query
    const tasks = await db.collection("nhatky").find(query).toArray()

    // Tính toán thống kê
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.status === "completed").length
    const pendingTasks = totalTasks - completedTasks

    // Nhóm công việc theo loại
    const tasksByTypeMap = {}
    tasks.forEach((task) => {
      const type = task.loai || "Không xác định"
      if (!tasksByTypeMap[type]) {
        tasksByTypeMap[type] = 0
      }
      tasksByTypeMap[type]++
    })

    // Chuyển đổi thành mảng để trả về
    const tasksByType = Object.entries(tasksByTypeMap).map(([type, count]) => ({
      type,
      count,
    }))

    // Nhóm công việc theo tháng
    const tasksByMonthMap = {}
    const months = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ]

    tasks.forEach((task) => {
      if (!task.ngaybatdau) return

      const date = new Date(task.ngaybatdau)
      const monthIndex = date.getMonth()
      const monthName = months[monthIndex]

      if (!tasksByMonthMap[monthName]) {
        tasksByMonthMap[monthName] = 0
      }
      tasksByMonthMap[monthName]++
    })

    // Sắp xếp theo thứ tự tháng
    const tasksByMonth = months
      .filter((month) => tasksByMonthMap[month])
      .map((month) => ({
        month,
        count: tasksByMonthMap[month] || 0,
      }))

    return NextResponse.json(
      {
        totalTasks,
        completedTasks,
        pendingTasks,
        tasksByType,
        tasksByMonth,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Lỗi khi lấy thống kê công việc:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

