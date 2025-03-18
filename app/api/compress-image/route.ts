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
      .resize(800, 800, { fit: "inside", withoutEnlargement: true }) // Resize to max dimensions
      .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
      .toBuffer()

    // Convert to base64
    const base64Image = `data:image/jpeg;base64,${processedImageBuffer.toString("base64")}`

    return NextResponse.json({
      success: true,
      base64: base64Image,
      size: processedImageBuffer.length,
    })
  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}

