import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOption"

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the multipart form data
    const formData = await req.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process the image with sharp
    const processedImageBuffer = await sharp(buffer)
      .resize(300, 300, { fit: "cover" }) // Resize to avatar dimensions
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
    console.error("Error processing avatar:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}

