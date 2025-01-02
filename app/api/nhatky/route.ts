// File: /app/api/nhatkynew/route.js

import clientPromise from "../../../mongo/client";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"

const upsertAgrochemicals = async (agrochemical, farmingLogId) => {
    const { db } = await clientPromise;

    const collectionAgrochemicals = db.collection("agrochemicals");
    const id = agrochemical.id;
    delete agrochemical.id;
    let result = {};

    if (id) {
        result = await collectionAgrochemicals.updateOne(
            { _id: ObjectId.createFromHexString(id) },
            { $set: { ...agrochemical, farmingLogId } }
        );
    } else {
        result = await collectionAgrochemicals.insertOne({
            ...agrochemical,
            farmingLogId,
        });
    }

    return result;
};

const syncAgrochemicals = async (incomingAgrochemicals, farmingLogId) => {
    const { db } = await clientPromise;
    const collectionAgrochemicals = db.collection("agrochemicals");
    const incomingIds = incomingAgrochemicals
        .filter((agro) => agro.id)
        .map((agro) => ObjectId.createFromHexString(agro.id));

    const existingAgrochemicals = await collectionAgrochemicals.find({ farmingLogId }).toArray();
    const existingIds = existingAgrochemicals.map((agro) => agro._id);
    const toDelete = existingIds.filter((id) => !incomingIds.includes(id));

    // Delete agrochemicals not present in incoming data
    if (toDelete.length > 0) {
        await collectionAgrochemicals.deleteMany({ _id: { $in: toDelete } });
    }
    for (const agro of incomingAgrochemicals) {
        await upsertAgrochemicals(agro, farmingLogId);
    }
};

export const POST = async (request: Request) => {
    // Kiểm tra session trước
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { db } = await clientPromise
        const data = await request.json()
        const { id } = data
        delete data.id

        const collection = db.collection("nhatkynew")
        let result

        if (!id) {
            const iid = new ObjectId()
            result = await collection.insertOne({ ...data, _id: iid })
            await syncAgrochemicals(data.agrochemicals || [], iid)
            return NextResponse.json(result, { status: 201 })
        } else {
            const objectId = ObjectId.createFromHexString(id)
            result = await collection.updateOne({ _id: objectId }, { $set: data })
            await syncAgrochemicals(data.agrochemicals || [], objectId)
            return NextResponse.json(result, { status: 200 })
        }
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export const GET = async (request: Request) => {
    // Kiểm tra session trước
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { db } = await clientPromise
        const { searchParams } = new URL(request.url)

        const idQuery = searchParams.get("id")
        const uId = searchParams.get("uId")
        const xId = searchParams.get("xId")

        const collection = db.collection("nhatkynew")
        let result

        if (!idQuery && uId) {
            // Fetch by uId
            result = await collection.find({ uId: uId }).toArray()
            return NextResponse.json(result, { status: 200 })
        } else if (xId) {
            // Fetch by xId
            result = await collection.find({ xId: xId }).toArray()
            return NextResponse.json(result, { status: 200 })
        } else if (idQuery) {
            // Fetch by specific ID
            result = await collection.findOne({
                _id: ObjectId.createFromHexString(idQuery),
            })
            return NextResponse.json(result, { status: 200 })
        } else {
            return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 })
        }
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export const DELETE = async (request: Request) => {
    // Kiểm tra session trước
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { db } = await clientPromise
        const { searchParams } = new URL(request.url)
        const idQuery = searchParams.get("id")

        if (!idQuery) {
            return NextResponse.json({ error: "Provide id" }, { status: 400 })
        }

        const objectId = ObjectId.createFromHexString(idQuery)
        const collection = db.collection("nhatkynew")
        const result = await collection.deleteOne({ _id: objectId })
        await db.collection("agrochemicals").deleteMany({ farmingLogId: objectId })

        return NextResponse.json(result, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}