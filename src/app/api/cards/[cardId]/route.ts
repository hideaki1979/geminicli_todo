import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { type UpdateFilter, type Document } from 'mongodb';
import { z } from 'zod';
import { taskSchema as baseTaskSchema } from '@/validation/boardValidation';
import { getUserIdFromSession } from '@/lib/auth-utils';

const taskSchema = baseTaskSchema.extend({
  title: z.string().min(1, 'タイトルは必須です。'),
  content: z.string().optional(),
});

export async function PUT(request: Request, context: unknown) {
  try {
    const userId = await getUserIdFromSession();
    const { cardId } = (context as { params: { cardId: string } }).params;
    const { title, content, listId } = await request.json(); // listIdも必要

    const updatedTask = taskSchema.parse({ id: cardId, title, content });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    const filter = { userId, 'lists.id': listId, 'lists.tasks.id': cardId } as unknown as Document;
    const updateSet: UpdateFilter<Document> = {
      $set: {
        'lists.$.tasks.$[task].title': updatedTask.title,
        'lists.$.tasks.$[task].content': updatedTask.content,
      },
    } as unknown as UpdateFilter<Document>;
    const result = await boardsCollection.updateOne(
      filter,
      updateSet,
      { arrayFilters: [{ 'task.id': cardId }] }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'タスクが見つかりませんでした。' }, { status: 404 });
    }

    return NextResponse.json({ message: 'タスクが更新されました。' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'データ形式が正しくありません', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    console.error('タスクの更新に失敗しました:', error);
    return NextResponse.json({ message: 'タスクの更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: unknown) {
  console.log('DELETE /api/cards/[cardId] called');
  try {
    const userId = await getUserIdFromSession();
    const { cardId } = (context as { params: { cardId: string } }).params;
    const { listId } = await request.json(); // listIdも必要
    console.log(`Attempting to delete card ${cardId} from list ${listId} for user ${userId}`);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    const filter = { userId, 'lists.id': listId } as unknown as Document;
    const updatePull: UpdateFilter<Document> = {
      $pull: { 'lists.$[listElem].tasks': { id: cardId } },
    } as unknown as UpdateFilter<Document>;
    const result = await boardsCollection.updateOne(
      filter,
      updatePull,
      { arrayFilters: [{ 'listElem.id': listId }] }
    );

    if (result.matchedCount === 0) {
      console.log('Card not found or not deleted.');
      return NextResponse.json({ message: 'タスクが見つかりませんでした。' }, { status: 404 });
    }

    console.log('Card deleted successfully.');
    return NextResponse.json({ message: 'タスクが削除されました。' });

  } catch (error) {
    console.error('タスクの削除に失敗しました:', error);
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'タスクの削除に失敗しました' }, { status: 500 });
  }
}
