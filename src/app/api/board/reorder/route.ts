import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUserIdFromSession } from '@/lib/auth-utils';
import { Board, List, Task } from '@/types';

// スキーマ定義（順序情報のみ）
const reorderSchema = z.object({
  lists: z.array(z.object({
    id: z.string().min(1).max(200),
    taskIds: z.array(z.string().min(1).max(200)).max(1000),
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
    const validatedData = reorderSchema.parse({ lists });

    // MongoDB接続
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    // 既存のボードデータを取得（型付き）
    const currentBoard = await boardsCollection.findOne<Board>({ userId });

    if (!currentBoard) {
      return NextResponse.json({ message: '対象のボードが見つかりませんでした。' }, { status: 404 });
    }

    // ボード全体のタスクをMapに格納
    const allTasks = new Map<string, Task>();
    currentBoard.lists.forEach(list => {
      list.tasks.forEach(task => {
        allTasks.set(task.id, task);
      });
    });

    // クライアントから送られた順序情報に基づいて新しいリスト配列を構築
    const reorderedLists: List[] = validatedData.lists.map(listInfo => {
      // 元のリスト情報（タイトルなど）を維持するために使用
      const originalList = currentBoard.lists.find(l => l.id === listInfo.id);
      const listTitle = originalList ? originalList.title : "Untitled"; // フォールバック

      const reorderedTasks: Task[] = listInfo.taskIds.map(taskId => {
        const task = allTasks.get(taskId);
        if (!task) {
          // このエラーは、クライアントがDBに存在しないタスクIDを送った場合に発生
          throw new Error(`不正なタスクIDが含まれています: ${taskId}`);
        }
        return task;
      });

      return { id: listInfo.id, title: listTitle, tasks: reorderedTasks };
    });

    const result = await boardsCollection.updateOne(
      { userId },
      { $set: { lists: reorderedLists, updatedAt: new Date() } },
      // { upsert: true }
    );

    if(!result.acknowledged) {
      return NextResponse.json({message: 'ボードの並び順の更新に失敗しました。'}, {status: 500});
    }

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: '対象のボードが見つかりませんでした。' }, { status: 404 });
    }

    return NextResponse.json({ message: 'ボードの並び順が更新されました。' }, { status: 200 });

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
