import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOption"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get user ID from query params
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()
    const productsCollection = db.collection("products")

    // Find product by user ID
    const product = await productsCollection.findOne({ userId: userId })

    return NextResponse.json(product || {}, { status: 200 })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const { userId, name, description, images } = await req.json()

    // Validate input
    if (!userId || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()
    const productsCollection = db.collection("products")

    // Check if product already exists for this user
    const existingProduct = await productsCollection.findOne({ userId: userId })

    if (existingProduct) {
      // Update existing product
      await productsCollection.updateOne(
        { userId: userId },
        {
          $set: {
            name,
            description,
            images,
            updatedAt: new Date(),
          },
        },
      )
    } else {
      // Create new product
      await productsCollection.insertOne({
        userId,
        name,
        description,
        images,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ message: "Product saved successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error saving product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

