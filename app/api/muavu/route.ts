import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOption"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("muavu")

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const uId = searchParams.get("uId") || session.user.uId
    const xId = searchParams.get("xId") || session.user.xId

    if (id) {
      const season = await collection.findOne({ _id: new ObjectId(id) })
      if (!season) {
        return NextResponse.json({ error: "Season not found" }, { status: 404 })
      }
      return NextResponse.json(season)
    } else {
      const query = { $or: [{ xId }, { uId }] }
      const seasons = await collection.find(query).toArray()
      return NextResponse.json(seasons)
    }
  } catch (error) {
    console.error("Error in GET /api/muavu:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("muavu")

    // Validate tenmuavu is one of the allowed values
    const allowedSeasonTypes = ["Đông Xuân", "Hè Thu", "Thu Đông"]
    if (!allowedSeasonTypes.includes(data.tenmuavu)) {
      return NextResponse.json(
        { error: "Tên mùa vụ không hợp lệ. Chỉ chấp nhận: Đông Xuân, Hè Thu, hoặc Thu Đông" },
        { status: 400 },
      )
    }

    if (!data.uId) {
      data.uId = session.user.uId
    }

    // Add timestamps
    data.createdAt = new Date().toISOString()
    data.updatedAt = new Date().toISOString()

    const result = await collection.insertOne(data)
    return NextResponse.json({ success: true, message: "Season added successfully", id: result.insertedId })
  } catch (error) {
    console.error("Error in POST /api/muavu:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { _id, ...updateData } = data

    if (!_id) {
      return NextResponse.json({ error: "Season ID is required" }, { status: 400 })
    }

    // Validate tenmuavu is one of the allowed values
    const allowedSeasonTypes = ["Đông Xuân", "Hè Thu", "Thu Đông"]
    if (updateData.tenmuavu && !allowedSeasonTypes.includes(updateData.tenmuavu)) {
      return NextResponse.json(
        { error: "Tên mùa vụ không hợp lệ. Chỉ chấp nhận: Đông Xuân, Hè Thu, hoặc Thu Đông" },
        { status: 400 },
      )
    }

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("muavu")

    // Update timestamp
    updateData.updatedAt = new Date().toISOString()

    const result = await collection.updateOne(
      { _id: new ObjectId(_id), $or: [{ uId: session.user.uId }, { xId: session.user.xId }] },
      { $set: updateData },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Season not found or not authorized to update" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Season updated successfully" })
  } catch (error) {
    console.error("Error in PUT /api/muavu:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Season ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("muavu")

    // Only allow users to delete their own seasons
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      uId: session.user.uId,
      xId: { $exists: false },
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Season not found, not authorized to delete, or is a default season" },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, message: "Season deleted successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/muavu:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

