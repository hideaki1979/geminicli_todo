import { NextResponse } from 'next/server';
import { Board } from '@/types';
import { boardSchema } from '@/validation/boardValidation';
import z from 'zod';
import { auth } from '@/auth';
import { kv } from '@vercel/kv';

const BOARD_KEY = 'board';

export async function GET() {
  try {
    const board = await kv.get<Board>(BOARD_KEY);

    if (!board) {
      // KVにデータがない場合、jsonファイルから読み込んでKVにセットする
      const initialBoard: Board = {
        id: '1',
        title: 'New Board',
        lists: [],
      }
      return NextResponse.json(initialBoard);
    }
    return NextResponse.json(board);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error reading board data from KV' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const board = await request.json();

    // データ検証
    boardSchema.parse(board);
    await kv.set(BOARD_KEY, board);
    return NextResponse.json({ message: 'Board data saved successfully to KV' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'JSONのバリデーションエラー', errors: error.errors }, { status: 400 })
    }
    console.error(error);
    return NextResponse.json({ message: 'Error saving board data to KV' }, { status: 500 });
  }
}
