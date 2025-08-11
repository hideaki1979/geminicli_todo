'use server'

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

async function getUserIdFromSession() {
  const session = await auth();
  if (!session || !session.user?.id || !ObjectId.isValid(session.user.id)) {
    throw new Error('ユーザーが認証されていません。');
  }
  return new ObjectId(session.user.id);
}

const listSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'タイトルは必須です。'),
  tasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
  })).optional(),
});

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession();
    const { id, title } = await request.json();

    const newList = listSchema.pick({ id: true, title: true }).parse({ id, title });
    newList.tasks = []; // 新しいリストにはタスクがない

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    await boardsCollection.updateOne(
      { userId },
      { $push: { lists: newList } }
    );

    return NextResponse.json({ message: 'リストが作成されました。' }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'データ形式が正しくありません', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    console.error('リストの作成に失敗しました:', error);
    return NextResponse.json({ message: 'リストの作成に失敗しました' }, { status: 500 });
  }
}
