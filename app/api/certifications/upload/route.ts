import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOption"
import sharp from "sharp"

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Parse the multipart form data
    const formData = await req.formData()
    const file = formData.get("image") as File
    const userId = formData.get("userId") as string

    // Kiểm tra quyền: Admin có thể upload cho bất kỳ ai, người dùng chỉ có thể upload cho chính họ
    if (!session.user.role?.includes("ADMIN") && userId !== session.user.uId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process the image with sharp
    const processedImageBuffer = await sharp(buffer)
      .resize(1200, 1200, { fit: "inside" }) // Resize to reasonable dimensions
      .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
      .toBuffer()

    // Convert to base64
    const base64Image = `data:image/jpeg;base64,${processedImageBuffer.toString("base64")}`

    // In a real implementation, you would upload this to a storage service
    // For now, we'll just return the base64 data
    return NextResponse.json({
      success: true,
      url: base64Image,
    })
  } catch (error) {
    console.error("Error processing certification image:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}
