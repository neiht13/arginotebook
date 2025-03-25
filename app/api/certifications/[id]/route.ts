import { ObjectId } from "mongodb"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOption"
import { connectToDatabase } from "@/lib/mongodb"

// Lấy thông tin một chứng nhận cụ thể
export const GET = async (request, { params }) => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { db } = await connectToDatabase()
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const collection = db.collection("certifications")
    const certification = await collection.findOne({ _id: new ObjectId(id) })

    if (!certification) {
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }

    // Kiểm tra quyền: Admin có thể xem tất cả, người dùng chỉ có thể xem của chính họ
    if (!session.user.role?.includes("ADMIN") && certification.userId !== session.user.uId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(certification, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Xóa một chứng nhận
export const DELETE = async (request, { params }) => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { db } = await connectToDatabase()
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const collection = db.collection("certifications")

    // Kiểm tra quyền
    const certification = await collection.findOne({ _id: new ObjectId(id) })
    if (!certification) {
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }

    if (!session.user.role?.includes("ADMIN") && certification.userId !== session.user.uId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Xóa chứng nhận
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true, result }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

