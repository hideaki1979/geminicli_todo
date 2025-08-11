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

const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'タイトルは必須です。'),
  content: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: { listId: string } }) {
  console.log('POST /api/lists/[listId]/cards called');
  try {
    const userId = await getUserIdFromSession();
    const { listId } = await params;
    const { id, title, content } = await request.json();
    console.log(`Attempting to create card ${title} in list ${listId} for user ${userId}`);

    const newTask = taskSchema.parse({ id, title, content });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    const result = await boardsCollection.updateOne(
      { userId, 'lists.id': listId },
      { $push: { 'lists.$.tasks': newTask } }
    );

    if (result.matchedCount === 0) {
      console.log('List not found for card creation.');
      return NextResponse.json({ message: 'リストが見つかりませんでした。' }, { status: 404 });
    }

    console.log('Card created successfully.');
    return NextResponse.json({ message: 'タスクが作成されました。' }, { status: 201 });

  } catch (error) {
    console.error('タスクの作成に失敗しました:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'データ形式が正しくありません', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'タスクの作成に失敗しました' }, { status: 500 });
  }
}
