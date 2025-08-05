'use server'

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { boardSchema } from '@/validation/boardValidation';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

async function getUserIdFromSession() {
  const session = await auth();
  if (!session || !session.user?.id || !ObjectId.isValid(session.user.id)) {
    throw new Error('ユーザーが認証されていません。');
  }
  return new ObjectId(session.user.id);
}

export async function GET() {
  try {
    const userId = await getUserIdFromSession();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    let board = await boardsCollection.findOne({ userId });

    if (!board) {
      const initialBoard = {
        userId,
        title: 'My First Board',
        lists: [],
      };
      const result = await boardsCollection.insertOne(initialBoard);
      board = { ...initialBoard, _id: result.insertedId };
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error('ボードデータの取得に失敗しました:', error);
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'ボードデータの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession();
    const boardData = await request.json();

    // Zodスキーマから_idとuserIdを除外して検証
    const validationSchema = boardSchema.omit({ _id: true, userId: true });
    validationSchema.parse(boardData);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const boardsCollection = db.collection('boards');

    await boardsCollection.updateOne(
      { userId },
      { $set: { title: boardData.title, lists: boardData.lists, updatedAt: new Date() } },
      { upsert: true } // データがなければ新規作成
    );

    return NextResponse.json({ message: 'ボードデータをMongoDBに保存しました。' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'データ形式が正しくありません', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    console.error('ボードデータの保存に失敗しました:', error);
    return NextResponse.json({ message: 'ボードデータの保存に失敗しました' }, { status: 500 });
  }
}