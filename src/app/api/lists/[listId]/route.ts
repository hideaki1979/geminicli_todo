import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { type UpdateFilter, type Document } from 'mongodb';
import { z } from 'zod';
import { getUserIdFromSession } from '@/lib/auth-utils';
import { listSchema } from '@/validation/boardValidation';

export async function PUT(request: Request, context: unknown) {
  try {
    const userId = await getUserIdFromSession();
    const { listId } = (context as { params: { listId: string } }).params;
    const { title } = await request.json();

    const updatedList = listSchema.pick({ title: true }).parse({ title });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    const result = await boardsCollection.updateOne(
      { userId, 'lists.id': listId },
      { $set: { 'lists.$.title': updatedList.title } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'リストが見つかりませんでした。' }, { status: 404 });
    }

    return NextResponse.json({ message: 'リストが更新されました。' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'データ形式が正しくありません', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    console.error('リストの更新に失敗しました:', error);
    return NextResponse.json({ message: 'リストの更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: unknown) {
  console.log('DELETE /api/lists/[listId] called');
  try {
    const userId = await getUserIdFromSession();
    const { listId } = (context as { params: { listId: string } }).params;
    console.log(`Attempting to delete list ${listId} for user ${userId}`);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    const filter = { userId, 'lists.id': listId } as unknown as Document;
    const update = ({
      $pull: { lists: { id: listId } as unknown as Document },
    } as unknown) as UpdateFilter<Document>;
    const result = await boardsCollection.updateOne(filter, update);

    if (result.matchedCount === 0 || result.modifiedCount === 0) {
      console.log('List not found or not deleted.');
      return NextResponse.json({ message: 'リストが見つかりませんでした。' }, { status: 404 });
    }

    console.log('List deleted successfully.');
    return NextResponse.json({ message: 'リストが削除されました。' });

  } catch (error) {
    console.error('リストの削除に失敗しました:', error);
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'リストの削除に失敗しました' }, { status: 500 });
  }
}
