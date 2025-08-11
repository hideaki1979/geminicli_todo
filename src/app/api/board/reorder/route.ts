import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUserIdFromSession } from '@/lib/auth-utils';
import { Board, List, Task } from '@/types';

// スキーマ定義（順序情報のみ）
const reorderSchema = z.object({
  lists: z.array(z.object({
    id: z.string().min(1).max(200),
    taskIds: z.array(z.string().min(1).max(200).max(1000)),
  }).strict()).max(100),
}).strict();

export async function PUT(request: Request) {
  try {
    const userId = await getUserIdFromSession();
    let lists: unknown;
    try {
      const body = await request.json();
      ({ lists } = body);
    } catch {
      return NextResponse.json({ message: '不正なJSONです' }, { status: 400 });
    }

    // バリデーション
    const updatedBoard = reorderSchema.parse({ lists });

    // MongoDB接続
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    // 既存のボードデータを取得（型付き）
    const current = await boardsCollection.findOne<Board>(
      { userId },
      { projection: { lists: 1, _id: 0 } }
    );

    if (!current || !current.lists) {
      return NextResponse.json({ message: '対象のボードが見つかりませんでした。' }, { status: 404 });
    }

    // 既存データをMapに格納
    const listById = new Map<string, List>(current.lists.map(l => [l.id, l]));

    // クライアントから送られた順序情報に基づいて並び替え
    const reorderedLists: List[] = updatedBoard.lists.map(reorderInfo => {
      const original = listById.get(reorderInfo.id);
      if (!original) {
        throw new Error(`不正なリストIDが含まれています: ${reorderInfo.id}`);
      }

      // タスクをMapに格納
      const taskById = new Map<string, Task>(original.tasks.map(t => [t.id, t]));

      // タスクを指定された順序で並び替え
      const reorderedTasks: Task[] = reorderInfo.taskIds.map(tid => {
        const task = taskById.get(tid);
        if (!task) throw new Error(`不正なタスクIDが含まれています: ${tid}`);
        return task;
      });
      return { ...original, tasks: reorderedTasks };
    });

    const result = await boardsCollection.updateOne(
      { userId },
      { $set: { lists: reorderedLists, updatedAt: new Date() } },
      // { upsert: true }
    );

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return NextResponse.json({ message: '対象のボードが見つかりませんでした。' }, { status: 404 });
    }

    return NextResponse.json({ message: 'ボードの並び順が更新されました。' }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'データ形式が正しくありません', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('不正な')) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    console.error('ボードの並び順の更新に失敗しました:', error);
    return NextResponse.json({ message: 'ボードの並び順の更新に失敗しました' }, { status: 500 });
  }
}
