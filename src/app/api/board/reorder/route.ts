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

const reorderSchema = z.object({
  lists: z.array(z.object({
    id: z.string(),
    title: z.string(),
    tasks: z.array(z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
    })),
  })),
});

export async function PUT(request: Request) {
  try {
    const userId = await getUserIdFromSession();
    const { lists } = await request.json();

    const updatedBoard = reorderSchema.parse({ lists });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    await boardsCollection.updateOne(
      { userId },
      { $set: { lists: updatedBoard.lists } }
    );

    return NextResponse.json({ message: 'ボードの並び順が更新されました。' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'データ形式が正しくありません', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    console.error('ボードの並び順の更新に失敗しました:', error);
    return NextResponse.json({ message: 'ボードの並び順の更新に失敗しました' }, { status: 500 });
  }
}
