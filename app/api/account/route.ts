// app/api/account/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { xId } = await request.json();
    const { db } = await connectToDatabase();

    const result = await db.collection('account').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { xId: new ObjectId(xId) } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Không tìm thấy account' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 });
  }
}