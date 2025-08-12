import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import clientPromise from '@/lib/mongodb';
import { userValidationSchema } from '@/validation/userValidation';
import { ZodError } from 'zod';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = userValidationSchema.parse(body);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'このメールアドレスは既に使用されています。' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userInsert = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    // 追加: 登録と同時に空ボードを作成
    const boardsCollection = db.collection('boards');
    const userId = userInsert.insertedId as ObjectId;
    const now = new Date();
    await boardsCollection.insertOne({
      userId,
      title: 'My Board',
      lists: [],
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ message: 'ユーザー登録が成功しました。' }, { status: 201 });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: '入力データが無効です。', errors: error.errors }, { status: 400 });
    }
    console.error('ユーザー登録エラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
