import { ObjectId } from "mongodb"
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
  if (!session.user.role?.includes("ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const idQuery = searchParams.get("id")

    const collection = db.collection("donvi")
    let result

    if (idQuery) {
      const objectId = new ObjectId(idQuery)
      result = await collection.findOne({ _id: objectId })
      if (!result) {
        return NextResponse.json({ error: "Đơn vị không tồn tại" }, { status: 404 })
      }
    } else {
      result = await collection.find({}).sort({ tendonvi: 1 }).toArray()
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu đơn vị:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Kiểm tra quyền ADMIN
  if (!session.user.role?.includes("ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { db } = await connectToDatabase()
    const data = await request.json()

    // Kiểm tra dữ liệu đầu vào
    if (!data.tendonvi) {
      return NextResponse.json({ error: "Tên đơn vị là bắt buộc" }, { status: 400 })
    }

    // Thêm thông tin thời gian
    const now = new Date()
    const donviData = {
      ...data,
      createdAt: now,
      updatedAt: now
    }

    const collection = db.collection("donvi")
    const result = await collection.insertOne(donviData)

    return NextResponse.json(
      { _id: result.insertedId, ...donviData },
      { status: 201 }
    )
  } catch (error) {
    console.error("Lỗi khi thêm đơn vị:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
