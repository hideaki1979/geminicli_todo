import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import { TEST_USER } from './test-data';

async function globalTeardown() {
  const client = new MongoClient(process.env.MONGODB_TEST_URI!);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'test');
    const usersCollection = db.collection('users');

    // テストユーザーを削除（関連ボードも削除）
    const user = await usersCollection.findOne({ email: TEST_USER.email });
    if (user?._id) {
      await db.collection('boards').deleteMany({ userId: user._id as ObjectId });
      await usersCollection.deleteOne({ _id: user._id });
    } else {
      await usersCollection.deleteOne({ email: TEST_USER.email });
    }

    console.log('Test user deleted successfully.');

  } catch (error) {
    console.error('Failed to delete test user:', error);
  } finally {
    await client.close();
  }
}

export default globalTeardown;
