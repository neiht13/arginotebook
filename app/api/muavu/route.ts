import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOption";
import { connectToDatabase } from "@/lib/mongodb";
import { log } from "node:console";

export const POST = async (request) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { db } = await connectToDatabase();
        const data = await request.json();
        log("data", data);
        const { _id } = data;
        delete data._id;

        const collection = db.collection("muavunew");
        let result;

        if (!_id) {
            result = await collection.insertOne({ ...data, _id: new ObjectId() });
            return NextResponse.json(result, { status: 201 });
        } else {
            const objectId = ObjectId.createFromHexString(_id);
            console.log("objectId", objectId);
            
            result = await collection.updateOne({ _id: objectId }, { $set: data });
            return NextResponse.json(result, { status: 200 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

export const GET = async (request) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { db } = await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const idQuery = searchParams.get("id");
        const uId = session?.user.uId;
        console.log("uId", session?.user.uId);

        const collection = db.collection("muavunew");
        let result;

        if (idQuery) {
            result = await collection.findOne({ _id: new ObjectId(idQuery) });
        } else {
            result = await collection.find({ uId: uId }).toArray();
        }

        

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

export const DELETE = async (request) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { db } = await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const idQuery = searchParams.get("id");

        if (!idQuery) {
            return NextResponse.json({ error: "Provide id" }, { status: 400 });
        }

        const objectId = ObjectId.createFromHexString(idQuery);
        const collection = db.collection("muavunew");
        const result = await collection.deleteOne({ _id: objectId });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};
