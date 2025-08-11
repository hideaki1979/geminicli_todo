import { type Page, type Locator } from '@playwright/test';

export class SignUpPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId('username-input');
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.signUpButton = page.getByTestId('signup-button');
    this.successMessage = page.locator('p:text("登録が成功しました")'); // Assuming success message appears in a <p>
    this.errorMessage = page.locator('[data-testid="error-message"]'); // Assuming you add a data-testid for errors
  }

  async goto() {
    await this.page.goto('/auth/signup');
  }

  async signUp(username: string, email: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signUpButton.click();
  }

  async getSuccessMessage(): Promise<string | null> {
    return this.successMessage.textContent();
  }
}
