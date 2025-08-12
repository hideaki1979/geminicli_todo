import { test, expect } from '@playwright/test';
import { SignInPage } from './pages/SignInPage';
import { TEST_USER } from './test-data';

test.describe('User Signin', () => {
  test('should allow a user to sign in successfully', async ({ page }) => {
    // Arrange
    const signInPage = new SignInPage(page);

    // Act
    await signInPage.goto();
    await signInPage.signIn(TEST_USER.email, TEST_USER.password);

    // Assert
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
    await expect(page.locator(`text=${TEST_USER.name}`)).toBeVisible();
  });

  test('should show an error message with invalid credentials', async ({ page }) => {
    // Arrange
    const signInPage = new SignInPage(page);
    const password = 'wrongpassword';

    // Act
    await signInPage.goto();
    await signInPage.signIn(TEST_USER.email, password);

    // Assert
    await expect(signInPage.errorMessage).toBeVisible();
    await expect(signInPage.errorMessage).toHaveText('無効なユーザー名またはパスワードです。');
    await expect(page).toHaveURL('/auth/signin');
  });
});
