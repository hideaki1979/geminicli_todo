import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { TEST_USER } from './test-data';

async function globalSetup() {
  const client = new MongoClient(process.env.MONGODB_TEST_URI!);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const usersCollection = db.collection('users');

    // 既存のテストユーザーと関連ボードをクリア
    const existingUser = await usersCollection.findOne({email: TEST_USER.email});
    if (existingUser?._id) {
      await db.collection('boards').deleteMany({userId: existingUser._id as ObjectId});
      await usersCollection.deleteOne({_id: existingUser._id});
    } else {
      await usersCollection.deleteOne({email: TEST_USER.email});
    }

    // テストユーザーを新規作成
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
    await usersCollection.insertOne({
      name: TEST_USER.name,
      email: TEST_USER.email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    console.log('Test user created successfully.');


  } catch (error) {
    console.error('Failed to create test user:', error);
    process.exit(1); // エラーがあればテストを中止
  } finally {
    await client.close();
  }
}

export default globalSetup;
