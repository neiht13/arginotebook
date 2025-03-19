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
    const collection = db.collection("vattu")

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (id) {
      // Get a specific supply by ID
      const vattu = await collection.findOne({ _id: new ObjectId(id) })
      if (!vattu) {
        return NextResponse.json({ error: "Supply not found" }, { status: 404 })
      }
      return NextResponse.json(vattu)
    } else {
      // Get all supplies for the user
      const vattuList = await collection.find({ uId: session.user.uId }).sort({ ten: 1 }).toArray()
      return NextResponse.json(vattuList)
    }
  } catch (error) {
    console.error("Error in GET /api/vattu:", error)
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
    const collection = db.collection("vattu")

    // Add user ID to the data
    data.uId = session.user.uId
    data.xId = session.user.xId

    if (data._id) {
      // Update existing supply
      const id = data._id
      delete data._id
      await collection.updateOne({ _id: new ObjectId(id) }, { $set: data })
      return NextResponse.json({ success: true, message: "Supply updated successfully" })
    } else {
      // Create new supply
      const result = await collection.insertOne(data)
      return NextResponse.json({ success: true, message: "Supply added successfully", id: result.insertedId })
    }
  } catch (error) {
    console.error("Error in POST /api/vattu:", error)
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
      return NextResponse.json({ error: "Supply ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("vattu")

    // Delete the supply
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      uId: session.user.uId,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Supply not found or not authorized to delete" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Supply deleted successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/vattu:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { vattuId, soLuongSuDung } = data

    if (!vattuId || !soLuongSuDung) {
      return NextResponse.json({ error: "Supply ID and usage amount are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("vattu")

    // Get current supply
    const vattu = await collection.findOne({ _id: new ObjectId(vattuId) })
    if (!vattu) {
      return NextResponse.json({ error: "Supply not found" }, { status: 404 })
    }

    // Check if there's enough quantity
    if (vattu.soLuong < soLuongSuDung) {
      return NextResponse.json({ error: "Not enough quantity available" }, { status: 400 })
    }

    // Update the quantity
    const result = await collection.updateOne({ _id: new ObjectId(vattuId) }, { $inc: { soLuong: -soLuongSuDung } })

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update supply quantity" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Supply quantity updated successfully" })
  } catch (error) {
    console.error("Error in PATCH /api/vattu:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

