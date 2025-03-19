import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOption"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("muavu")

    const season = await collection.findOne({
      _id: new ObjectId(id),
      $or: [{ uId: session.user.uId }, { xId: session.user.xId }],
    })

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    return NextResponse.json(season)
  } catch (error) {
    console.error("Error in GET /api/muavu/[id]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const data = await request.json()
    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("muavu")

    // Validate tenmuavu is one of the allowed values
    const allowedSeasonTypes = ["Đông Xuân", "Hè Thu", "Thu Đông"]
    if (data.tenmuavu && !allowedSeasonTypes.includes(data.tenmuavu)) {
      return NextResponse.json(
        { error: "Tên mùa vụ không hợp lệ. Chỉ chấp nhận: Đông Xuân, Hè Thu, hoặc Thu Đông" },
        { status: 400 },
      )
    }

    // Check if the user is authorized to update this season
    const season = await collection.findOne({ _id: new ObjectId(id) })
    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    // Only allow users to update their own seasons or if they are ADMIN
    if (season.uId !== session.user.uId && season.xId !== session.user.xId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized to update this season" }, { status: 403 })
    }

    // Remove _id from data to avoid MongoDB error
    const { _id, ...updateData } = data

    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Season updated successfully" })
  } catch (error) {
    console.error("Error in PUT /api/muavu/[id]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("muavu")

    // Check if the user is authorized to delete this season
    const season = await collection.findOne({ _id: new ObjectId(id) })
    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    // Only allow users to delete their own seasons or if they are ADMIN
    if (season.uId !== session.user.uId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized to delete this season" }, { status: 403 })
    }

    // Check if this is a default season (has xId but no uId)
    if (season.xId && !season.uId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Cannot delete default season" }, { status: 403 })
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Season deleted successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/muavu/[id]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

