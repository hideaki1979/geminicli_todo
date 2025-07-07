import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { Board } from '@/types';

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
