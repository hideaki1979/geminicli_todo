import { test, expect } from '@playwright/test';
import { SignUpPage } from './pages/SignUpPage';

test.describe('User Signup', () => {
  test('should allow a user to sign up successfully', async ({ page }) => {
    // Arrange
    const signUpPage = new SignUpPage(page);
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const username = `testuser_${Date.now()}`;
    const password = 'password123';

    // Act
    await signUpPage.goto();
    await signUpPage.signUp(username, uniqueEmail, password);

    // Assert
    // The form redirects to the sign-in page after a successful sign-up.
    await page.waitForURL('/auth/signin');
    await expect(page).toHaveURL('/auth/signin');
  });
});
