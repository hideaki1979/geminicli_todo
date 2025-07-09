import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { Board } from '@/types';
import { boardSchema } from '@/validation/boardValidation';
import z from 'zod';
import { auth } from '@/auth';

export async function GET() {
  try {
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'board.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const board: Board = JSON.parse(jsonData);
    return NextResponse.json(board);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error reading board data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const board = await request.json();

    // データ検証
    boardSchema.parse(board)
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'board.json');
    await fs.writeFile(jsonPath, JSON.stringify(board, null, 2));
    return NextResponse.json({ message: 'Board data saved successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'JSONのバリデーションエラー', errors: error.errors }, { status: 400 })
    }
    console.error(error);
    return NextResponse.json({ message: 'Error saving board data' }, { status: 500 });
  }
}
