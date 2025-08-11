import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUserIdFromSession } from '@/lib/auth-utils';

const reorderSchema = z.object({
  lists: z.array(z.object({
    id: z.string().min(1).max(200),
    title: z.string().min(1).max(255),
    tasks: z.array(z.object({
      id: z.string().min(1).max(2000),
      title: z.string().min(1).max(1000),
      content: z.string().min(1).max(2000),
    }).strict()),
  }).strict()),
}).strict();

export async function PUT(request: Request) {
  try {
    const userId = await getUserIdFromSession();
    const { lists } = await request.json();

    const updatedBoard = reorderSchema.parse({ lists });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    const result = await boardsCollection.updateOne(
      { userId },
      { $set: { lists: updatedBoard.lists } },
      { upsert: true }
    );

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return NextResponse.json({ message: '対象のボードが見つかりませんでした。' }, { status: 404 });
    }

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
