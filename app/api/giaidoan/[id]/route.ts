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
    const collection = db.collection("giaidoan")

    const stage = await collection.findOne({
      _id: new ObjectId(id),
      $or: [{ uId: session.user.uId }, { xId: session.user.xId }],
    })

    if (!stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 })
    }

    return NextResponse.json(stage)
  } catch (error) {
    console.error("Error in GET /api/giaidoan/[id]:", error)
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
    const collection = db.collection("giaidoan")

    // Check if the user is authorized to update this stage
    const stage = await collection.findOne({ _id: new ObjectId(id) })
    if (!stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 })
    }

    // Only allow users to update their own stages or if they are ADMIN
    if (stage.uId !== session.user.uId && stage.xId !== session.user.xId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized to update this stage" }, { status: 403 })
    }

    // Remove _id from data to avoid MongoDB error
    const { _id, ...updateData } = data

    // Update timestamp
    updateData.updatedAt = new Date().toISOString()

    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Stage updated successfully" })
  } catch (error) {
    console.error("Error in PUT /api/giaidoan/[id]:", error)
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
    const collection = db.collection("giaidoan")

    // Check if the user is authorized to delete this stage
    const stage = await collection.findOne({ _id: new ObjectId(id) })
    if (!stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 })
    }

    // Only allow users to delete their own stages or if they are ADMIN
    if (stage.uId !== session.user.uId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized to delete this stage" }, { status: 403 })
    }

    // Check if this is a default stage (has xId but no uId)
    if (stage.xId && !stage.uId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Cannot delete default stage" }, { status: 403 })
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Stage deleted successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/giaidoan/[id]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

