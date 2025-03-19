import { ObjectId } from "mongodb"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOption"
import { connectToDatabase } from "@/lib/mongodb"

export async function PUT(request, { params }) {
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
    const { id } = params
    const data = await request.json()

    // Kiểm tra dữ liệu đầu vào
    if (!data.tendonvi) {
      return NextResponse.json({ error: "Tên đơn vị là bắt buộc" }, { status: 400 })
    }

    // Cập nhật thời gian
    const updateData = {
      ...data,
      updatedAt: new Date()
    }

    const collection = db.collection("donvi")
    const objectId = new ObjectId(id)
    
    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: "Đơn vị không tồn tại" }, { status: 404 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Lỗi khi cập nhật đơn vị:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
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
    const { id } = params
    const objectId = new ObjectId(id)

    const collection = db.collection("donvi")
    const result = await collection.findOneAndDelete({ _id: objectId })

    if (!result) {
      return NextResponse.json({ error: "Đơn vị không tồn tại" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Đã xóa đơn vị thành công" }, { status: 200 })
  } catch (error) {
    console.error("Lỗi khi xóa đơn vị:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
