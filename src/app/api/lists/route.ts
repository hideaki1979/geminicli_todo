import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { type UpdateFilter, type Document } from 'mongodb';
import { z } from 'zod';
import { getUserIdFromSession } from '@/lib/auth-utils';
import { listSchema } from '@/validation/boardValidation';

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession();
    const { id, title } = await request.json();

    const newList = listSchema.parse({ id, title, tasks: [] });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    // 同一IDのリストが存在しない場合のみpushするfilter
    const filter = { userId, 'lists.id': { $ne: newList.id } } as unknown as Document;

    const now = new Date();
    const update = ({
      $setOnInsert: {
        title: 'My Board',
        createdAt: now,
      },
      $set: { updatedAt: now },
      $push: { lists: newList as unknown as Document }
    } as unknown) as UpdateFilter<Document>;

    // await boardsCollection.updateOne(filter, update, { upsert: true });
    const result = await boardsCollection.updateOne(filter, update, { upsert: true });
    // matchedCount/upsertedCountともに0なら既に同IDのリストが存在
    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return NextResponse.json(
        { message: '同じIDのリストが既に存在してます。' },
        { status: 409 }
      );
    }

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