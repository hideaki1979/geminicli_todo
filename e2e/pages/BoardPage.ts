import { Page, Locator } from '@playwright/test';

export class BoardPage {
  readonly page: Page;

  // List locators
  readonly addListButton: Locator;
  readonly listTitleInput: Locator;
  readonly submitListButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // List related locators
    this.addListButton = page.locator('[data-testid="add-list-button"]');
    this.listTitleInput = page.locator('[data-testid="list-title-input"]');
    this.submitListButton = page.locator('[data-testid="submit-list-button"]');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle'); // ページが完全にロードされるまで待機
    await this.addListButton.waitFor({ state: 'visible' }); // リスト追加ボタンが表示されるまで待機
  }

  // --- List Actions ---

  async createList(title: string) {
    console.log('Attempting to click addListButton...');
    await this.addListButton.click();
    console.log('addListButton clicked. Waiting for list title input...');
    await this.listTitleInput.waitFor({ state: 'visible' }); // Wait for modal to appear
    await this.listTitleInput.fill(title);
    console.log(`List title '${title}' filled. Attempting to click submitListButton...`);
    await this.submitListButton.click();
    await this.page.waitForResponse(response => response.url().includes('/api/lists') && response.request().method() === 'POST'); // POST /api/lists のレスポンスを待機
    console.log('submitListButton clicked and API response received.');
  }

  getList(title: string): Locator {
    return this.page.locator(`[data-testid="list-${title}"]`);
  }

  async editListTitle(currentTitle: string, newTitle: string) {
    const list = this.getList(currentTitle);
    await list.locator('[data-testid="list-title"]').click();
    const input = this.page.locator('[data-testid="edit-list-title-input"]');
    await input.fill(newTitle);
    await this.page.locator('[data-testid="submit-edit-list-button"]').click();
    await this.page.waitForResponse(response => response.url().includes('/api/lists/') && response.request().method() === 'PUT'); // PUT /api/lists/[listId] のレスポンスを待機
  }

  async deleteList(title: string) {
    console.log(`Attempting to delete list: ${title}`);
    const list = this.getList(title);
    await list.locator('[data-testid="delete-list-button"]').click();
    console.log('Delete list button clicked. Waiting for confirm delete button...');
    await this.page.locator('[data-testid="confirm-delete-list-button"]').waitFor({ state: 'visible' });
    await this.page.locator('[data-testid="confirm-delete-list-button"]').click();
    console.log('Confirm delete list button clicked. Waiting for API response...');
    await this.page.waitForResponse(response => response.url().includes('/api/lists/') && response.request().method() === 'DELETE'); // DELETE /api/lists/[listId] のレスポンスを待機
    await list.waitFor({ state: 'hidden' }); // リストが画面から消えるまで待機
    console.log(`List '${title}' delete confirmed and not visible.`);
  }

  // --- Card Actions ---

  async createCard(listTitle: string, cardTitle: string) {
    const list = this.getList(listTitle);
    await list.locator('[data-testid="add-card-button"]').click();
    await this.page.locator('[data-testid="card-title-input"]').fill(cardTitle);
    await this.page.locator('[data-testid="submit-card-button"]').click();
    await this.page.waitForResponse(response => response.url().includes('/api/lists/') && response.request().method() === 'POST'); // POST /api/lists/[listId]/cards のレスポンスを待機
  }

  getCard(title: string): Locator {
    return this.page.locator(`[data-testid="card-${title}"]`);
  }

  async editCardTitle(currentTitle: string, newTitle: string) {
    const card = this.getCard(currentTitle);
    await card.locator('[data-testid="edit-card-button"]').click();
    const input = this.page.locator('[data-testid="edit-card-title-input"]');
    await input.fill(newTitle);
    await this.page.locator('[data-testid="submit-edit-card-button"]').click();
    await this.page.waitForResponse(response => response.url().includes('/api/cards/') && response.request().method() === 'PUT'); // PUT /api/cards/[cardId] のレスポンスを待機
  }

  async deleteCard(title: string) {
    const card = this.getCard(title);
    await card.locator('[data-testid="delete-card-button"]').click();
    await this.page.locator('[data-testid="confirm-delete-card-button"]').click();
    console.log('Confirm delete card button clicked. Waiting for API response...');
    await this.page.waitForResponse(response => response.url().includes('/api/cards/') && response.request().method() === 'DELETE'); // DELETE /api/cards/[cardId] のレスポンスを待機
    await card.waitFor({ state: 'hidden' }); // カードが画面から消えるまで待機
  }

  async deleteAllLists() {
    // まずUIが表示されるのを待つ
    await this.page.waitForLoadState('networkidle');
    await this.addListButton.waitFor({ state: 'visible' });

    // API経由で確実に全リストを削除（UIの不安定要因を避ける）
    const res = await this.page.request.get('/api/board');
    if (res.ok()) {
      const board = await res.json();
      if (board?.lists?.length) {
        for (const list of board.lists) {
          const del = await this.page.request.delete(`/api/lists/${list.id}`);
          if (!del.ok()) {
            console.warn(`Failed to delete list via API: ${list.id}`);
          }
        }
      }
    } else {
      console.warn('Failed to fetch board via API for cleanup');
    }

    // 画面も最新状態に同期
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    await this.addListButton.waitFor({ state: 'visible' });
    await this.page.waitForFunction(() => document.querySelectorAll('[data-list-container="true"]').length === 0);
  }

  // --- Drag and Drop Actions ---

  async moveCardToList(cardTitle: string, targetListTitle: string) {
    const card = this.getCard(cardTitle);
    const handle = card.locator('[data-testid="drag-handle"]');
    const targetList = this.getList(targetListTitle);
    await handle.dragTo(targetList);
    await this.page.waitForResponse(response => response.url().includes('/api/board/reorder') && response.request().method() === 'PUT'); // PUT /api/board/reorder のレスポンスを待機
  }

  async moveCardToAnotherCard(cardToMoveTitle: string, targetCardTitle: string) {
    const cardToMove = this.getCard(cardToMoveTitle);
    const handle = cardToMove.locator('[data-testid="drag-handle"]');
    const targetCard = this.getCard(targetCardTitle);
    await handle.dragTo(targetCard);
    await this.page.waitForResponse(response => response.url().includes('/api/board/reorder') && response.request().method() === 'PUT'); // PUT /api/board/reorder のレスポンスを待機
  }

  // --- API cleanup helpers ---
  async apiDeleteListsByTitles(titles: string[]) {
    if (!titles.length) return;
    const res = await this.page.request.get('/api/board');
    if (!res.ok()) return;
    const board = (await res.json()) as { lists?: Array<{ id: string; title: string }> };
    const lists: Array<{ id: string; title: string }> = Array.isArray(board?.lists) ? board.lists : [];
    for (const title of titles) {
      const list = lists.find((l) => l.title === title);
      if (!list?.id) continue;
      await this.page.request.delete(`/api/lists/${list.id}`);
    }
  }
}
