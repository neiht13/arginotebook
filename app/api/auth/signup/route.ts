// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { email, username, password, name, xId } = await request.json();
    const { db } = await connectToDatabase();

    // Kiểm tra username hoặc email đã tồn tại
    const existingAccount = await db.collection('account').findOne({
      $or: [{ username }, { email }],
    });
    if (existingAccount) {
      return NextResponse.json(
        { error: 'Username hoặc email đã tồn tại' },
        { status: 400 }
      );
    }

    // Tạo account
    const accountData = {
      username,
      password,
      role: ['USER'],
      xId: new ObjectId(xId),
      status: false,
      createdBy: 'self',
      createAt: new Date(),
      lastlogAt: null,
    };
    const accountResult = await db.collection('account').insertOne(accountData);

    // Tạo user
    const unit = await db.collection('donvi').findOne({ _id: new ObjectId(xId) });
    const userData = {
      email,
      username,
      name,
      image: '',
      phone: '',
      diachi: unit?.diachi || '',
      location: { lat: 0, lng: 0 },
      mota: '',
      dientich: 0,
      accountId: accountResult.insertedId,
      donvihtx: unit?.tendonvi || '',
      xId: new ObjectId(xId),
      masovungtrong: '',
      avatar: '',
      status: false,
      createdAt: new Date(),
    };
    await db.collection('user').insertOne(userData);

    return NextResponse.json(
      { message: 'Đăng ký thành công, chờ admin kích hoạt' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Đăng ký thất bại' },
      { status: 500 }
    );
  }
}