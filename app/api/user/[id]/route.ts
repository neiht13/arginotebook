// app/api/user/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { phone, xId, diachi, donvihtx } = await request.json();
    const { db } = await connectToDatabase();

    const result = await db.collection('user').updateOne(
      { _id: ObjectId.createFromHexString(params.id) },
      { $set: { phone, xId: xId, diachi, donvihtx } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Không tìm thấy user' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 });
  }
}