import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserIdFromSession } from '@/lib/auth-utils';

export async function GET() {
  try {
    const userId = await getUserIdFromSession();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    // 既存ボードを取得
    const existing = await boardsCollection.findOne({ userId });
    if (existing) {
      return NextResponse.json(existing);
    }

    // 無ければ空ボードを作成
    const now = new Date();
    const newBoard = {
      userId,
      title: 'My Board',
      lists: [],
      createdAt: now,
      updatedAt: now,
    };
    const result = await boardsCollection.insertOne(newBoard);
    return NextResponse.json({ ...newBoard, _id: result.insertedId });
  } catch (error) {
    console.error('ボードデータの取得に失敗しました:', error);
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'ボードデータの取得に失敗しました' }, { status: 500 });
  }
}