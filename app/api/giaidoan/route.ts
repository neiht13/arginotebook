import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/mongo/client";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("giaidoan");

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const uId = searchParams.get("uId") || session.user.uId;
    const xId = searchParams.get("xId") || session.user.xId;

    if (id) {
      const stage = await collection.findOne({ _id: new ObjectId(id) });
      if (!stage) {
        return NextResponse.json({ error: "Stage not found" }, { status: 404 });
      }
      return NextResponse.json(stage);
    } else {
      const query = { $or: [{ xId }, { uId }] };
      const stages = await collection.find(query).toArray();
      return NextResponse.json(stages);
    }
  } catch (error) {
    console.error("Error in GET /api/giaidoan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("giaidoan");

    if (!data.uId) {
      data.uId = session.user.uId;
    }

    const result = await collection.insertOne(data);
    return NextResponse.json({ success: true, message: "Stage added successfully", id: result.insertedId });
  } catch (error) {
    console.error("Error in POST /api/giaidoan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { _id, ...updateData } = data;

    if (!_id) {
      return NextResponse.json({ error: "Stage ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("giaidoan");

    const result = await collection.updateOne(
      { _id: new ObjectId(_id), $or: [{ uId: session.user.uId }, { xId: session.user.xId }] },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Stage not found or not authorized to update" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Stage updated successfully" });
  } catch (error) {
    console.error("Error in PUT /api/giaidoan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Stage ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("giaidoan");

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      uId: session.user.uId,
      xId: { $exists: false }
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Stage not found, not authorized to delete, or is a default stage" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Stage deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/giaidoan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
