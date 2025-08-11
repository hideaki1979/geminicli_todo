import { test, expect } from '@playwright/test';
import { SignInPage } from './pages/SignInPage';

// このテストは、指定されたテストユーザーがデータベースに事前に存在することを前提としています。
// ユーザー: test1@example.com
// パスワード: password

test.describe('User Signin', () => {
  test('should allow a user to sign in successfully', async ({ page }) => {
    // Arrange
    const signInPage = new SignInPage(page);
    const email = 'test1@example.com';
    const password = 'password';

    // Act
    await signInPage.goto();
    await signInPage.signIn(email, password);

    // Assert
    // ログイン後、ホームページにリダイレクトされるのを待つ
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
    // ヘッダーにログインユーザー名が表示されることを確認（ユーザー名は 'testuser' と仮定）
    // await expect(page.locator('text=testuser')).toBeVisible();
  });

  test('should show an error message with invalid credentials', async ({ page }) => {
    // Arrange
    const signInPage = new SignInPage(page);
    const email = 'test1@example.com';
    const password = 'wrongpassword';

    // Act
    await signInPage.goto();
    await signInPage.signIn(email, password);

    // Assert
    await expect(signInPage.errorMessage).toBeVisible();
    await expect(signInPage.errorMessage).toHaveText('無効なユーザー名またはパスワードです。');
    await expect(page).toHaveURL('/auth/signin'); // ページが遷移していないことを確認
  });
});
