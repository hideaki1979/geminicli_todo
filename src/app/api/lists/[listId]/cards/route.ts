import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { type UpdateFilter, type Document } from 'mongodb';
import { z } from 'zod';
import { taskSchema as baseTaskSchema } from '@/validation/boardValidation';
import { getUserIdFromSession } from '@/lib/auth-utils';

const taskSchema = baseTaskSchema
.pick({id: true,title: true,content: true,})
.extend({
  title: z.string().min(1, 'タイトルは必須です').max(255),
  id: z.string().min(1).max(200),
  content: z.string().max(2000)
}).strict();


export async function POST(request: Request, context: unknown) {
  console.log('POST /api/lists/[listId]/cards called');
  try {
    const userId = await getUserIdFromSession();
    const { listId } = await (context as { params: { listId: string } }).params;
    const { id, title, content } = await request.json();
    console.log(`Attempting to create card ${title} in list ${listId} for user ${userId}`);

    const newTask = taskSchema.parse({ id, title, content });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    const filter = { userId, 'lists.id': listId } as unknown as Document;
    const update = ({
      $push: { 'lists.$.tasks': newTask as unknown as Document },
    } as unknown) as UpdateFilter<Document>;
    const result = await boardsCollection.updateOne(filter, update);

    if (result.matchedCount === 0 || result.modifiedCount === 0) {
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
