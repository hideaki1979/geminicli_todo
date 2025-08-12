import { test, expect } from '@playwright/test';
import { SignUpPage } from './pages/SignUpPage';
import { MongoClient, ObjectId } from 'mongodb';

test.describe('User Signup', () => {
  let uniqueEmail: string;
  const password = 'password123';

  test.beforeEach(() => {
    uniqueEmail = `testuser_${Date.now()}@example.com`;
  });

  test.afterEach(async () => {
    // クリーンアップ処理（ユーザーと関連ボードの削除）
    const client = new MongoClient(process.env.MONGODB_TEST_URI!);
    try {
      await client.connect();
      const db = client.db(process.env.MONGODB_DB_NAME || 'test');
      const users = db.collection('users');
      const boards = db.collection('boards');
      const user = await users.findOne({ email: uniqueEmail });
      if (user?._id) {
        await boards.deleteMany({ userId: user._id as ObjectId });
        await users.deleteOne({ _id: user._id });
      } else {
        await users.deleteOne({ email: uniqueEmail });
      }
    } finally {
      await client.close();
    }
  });

  test('should allow a user to sign up successfully', async ({ page }) => {
    // Arrange
    const signUpPage = new SignUpPage(page);
    const username = `testuser_${Date.now()}`;

    // Act
    await signUpPage.goto();
    await signUpPage.signUp(username, uniqueEmail, password);

    // Assert
    await page.waitForURL('/auth/signin');
    await expect(page).toHaveURL('/auth/signin');
  });
});
