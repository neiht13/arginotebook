import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/mongo/client"
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
    const collection = db.collection("nhatky")

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const muaVuId = searchParams.get("muaVuId")
    const uId = searchParams.get("uId") || session.user.uId

    if (id) {
      const log = await collection.findOne({ _id: new ObjectId(id) })
      if (!log) {
        return NextResponse.json({ error: "Log not found" }, { status: 404 })
      }
      return NextResponse.json(log)
    } else if (muaVuId) {
      const logs = await collection.find({ muaVuId }).toArray()
      return NextResponse.json(logs)
    } else {
      const logs = await collection.find({ uId }).sort({ ngayThucHien: -1 }).toArray()
      return NextResponse.json(logs)
    }
  } catch (error) {
    console.error("Error in GET /api/nhatky:", error)
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
    const collection = db.collection("nhatky")

    if (!data.uId) {
      data.uId = session.user.uId
    }

    const result = await collection.insertOne(data)
    return NextResponse.json({ success: true, message: "Log added successfully", id: result.insertedId })
  } catch (error) {
    console.error("Error in POST /api/nhatky:", error)
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
      return NextResponse.json({ error: "Log ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("nhatky")

    const result = await collection.updateOne({ _id: new ObjectId(_id), uId: session.user.uId }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Log not found or not authorized to update" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Log updated successfully" })
  } catch (error) {
    console.error("Error in PUT /api/nhatky:", error)
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
      return NextResponse.json({ error: "Log ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("nhatky")

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      uId: session.user.uId,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Log not found or not authorized to delete" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Log deleted successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/nhatky:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

