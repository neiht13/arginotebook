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

    // Validate file existence
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large, maximum 10MB allowed" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Get image metadata to determine orientation
    const metadata = await sharp(buffer).metadata()
    const isVertical = (metadata.height || 0) > (metadata.width || 0)

    // Process the image with sharp
    const processedImageBuffer = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF orientation
      .resize({
        width: isVertical ? 1280 : undefined,
        height: isVertical ? undefined : 1280,
        fit: "inside", // Maintain aspect ratio
        withoutEnlargement: true // Don't upscale smaller images
      })
      .avif({
        quality: 50,           // Quality from 0-100 (lower = smaller file)
        speed: 5,             // Compression speed 0-8 (higher = faster)
        chromaSubsampling: '4:2:0', // Good for web compression
        effort: 4             // Compression effort 0-9 (higher = better compression)
      })
      .toBuffer()

    // Convert to base64
    const base64Image = `data:image/avif;base64,${processedImageBuffer.toString("base64")}`

    // Return response with additional metadata
    return NextResponse.json({
      success: true,
      base64: base64Image,
      size: processedImageBuffer.length,
      originalDimensions: {
        width: metadata.width,
        height: metadata.height
      },
      processedDimensions: {
        width: isVertical ? Math.min(metadata.width || 1280, 1280) : await sharp(processedImageBuffer).metadata().then(m => m.width),
        height: isVertical ? await sharp(processedImageBuffer).metadata().then(m => m.height) : Math.min(metadata.height || 1280, 1280)
      }
    })
  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json({ 
      error: "Failed to process image",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// Configuration for the API route
export const config = {
  api: {
    bodyParser: false // Required for handling multipart/form-data
  }
}