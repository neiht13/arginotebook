import { ObjectId } from "mongodb"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOption"
import { connectToDatabase } from "@/lib/mongodb"

// Lấy danh sách chứng nhận
export const GET = async (request) => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    const collection = db.collection("certifications")
    let result

    if (userId) {
      // Lấy chứng nhận của một người dùng cụ thể
      result = await collection.find({ userId }).toArray()
    } else if (session.user.role?.includes("ADMIN")) {
      // Admin có thể xem tất cả chứng nhận
      result = await collection.find({}).toArray()
    } else {
      // Người dùng thường chỉ có thể xem chứng nhận của họ
      result = await collection.find({ userId: session.user.uId }).toArray()
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Thêm chứng nhận mới
export const POST = async (request) => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { db } = await connectToDatabase()
    const data = await request.json()
    
    // Kiểm tra quyền: Admin có thể thêm cho bất kỳ ai, người dùng chỉ có thể thêm cho chính họ
    if (!session.user.role?.includes("ADMIN") && data.userId !== session.user.uId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const collection = db.collection("certifications")
    
    // Thêm thời gian tạo và cập nhật
    const certificationData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: new ObjectId()
    }
    
    const result = await collection.insertOne(certificationData)
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      certification: certificationData
    }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Cập nhật chứng nhận
export const PUT = async (request) => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { db } = await connectToDatabase()
    const data = await request.json()
    const { _id, ...updateData } = data
    
    if (!_id) {
      return NextResponse.json({ error: "Certification ID is required" }, { status: 400 })
    }
    
    const collection = db.collection("certifications")
    
    // Kiểm tra quyền
    const certification = await collection.findOne({ _id: new ObjectId(_id) })
    if (!certification) {
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }
    
    if (!session.user.role?.includes("ADMIN") && certification.userId !== session.user.uId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    // Cập nhật dữ liệu
    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        } 
      }
    )
    
    return NextResponse.json({ success: true, result }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
