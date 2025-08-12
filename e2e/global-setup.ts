import 'dotenv/config';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import { TEST_USER } from './test-data';

async function globalSetup() {
  const client = new MongoClient(process.env.MONGODB_TEST_URI!);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const usersCollection = db.collection('users');

    // 既存のテストユーザーがいれば削除
    await usersCollection.deleteOne({ email: TEST_USER.email });

    // テストユーザーを新規作成
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
    const insert = await usersCollection.insertOne({
      name: TEST_USER.name,
      email: TEST_USER.email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    console.log('Test user created successfully.');

    // 念のため、古いボードが残っていれば削除してクリーンにしておく
    const boardsCollection = db.collection('boards');
    await boardsCollection.deleteMany({ userId: insert.insertedId });

  } catch (error) {
    console.error('Failed to create test user:', error);
    process.exit(1); // エラーがあればテストを中止
  } finally {
    await client.close();
  }
}

export default globalSetup;
