import { test, expect } from '@playwright/test';
import { SignInPage } from './pages/SignInPage';
import { BoardPage } from './pages/BoardPage';
import { TEST_USER } from './test-data';

test.describe.serial('Board, List, and Card CRUD Operations', () => {
  let boardPage: BoardPage;
  let createdListTitles: string[] = []; // テストで作成されたリストのタイトルを追跡

  // 各テストの前にログイン処理を実行
  test.beforeEach(async ({ page }) => {
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.signIn(TEST_USER.email, TEST_USER.password);
    await page.waitForURL('/');
    boardPage = new BoardPage(page);
    createdListTitles = []; // 各テストの開始時にリセット
    await boardPage.deleteAllLists(); // テスト開始前にすべてのリストを削除してクリーンな状態にする
  });

  // 各テストの後にクリーンアップ処理を実行
  test.afterEach(async () => {
    // UI操作ではなくAPIで確実にクリーンアップ
    try {
      await boardPage.apiDeleteListsByTitles(createdListTitles);
    } catch (error) {
      console.warn('API cleanup failed', error);
    }
  });

  test('should allow a user to create, update, and delete a list', async () => {
    const listTitle = '最初のリスト-' + Date.now(); // ユニークな名前を生成
    const updatedListTitle = '更新されたリスト-' + Date.now(); // ユニークな名前を生成
    createdListTitles.push(listTitle, updatedListTitle); // クリーンアップ対象に追加

    // Create List
    await boardPage.createList(listTitle);
    console.log(`List '${listTitle}' created.`);
    await expect(boardPage.getList(listTitle)).toBeVisible();
    console.log(`List '${listTitle}' is visible.`);

    // Update List
    await boardPage.editListTitle(listTitle, updatedListTitle);
    console.log(`List '${listTitle}' updated to '${updatedListTitle}'.`);
    await expect(boardPage.getList(listTitle)).not.toBeVisible();
    await expect(boardPage.getList(updatedListTitle)).toBeVisible();
    console.log(`List '${updatedListTitle}' is visible.`);

    // Delete List
    await boardPage.deleteList(updatedListTitle);
    await expect(boardPage.getList(updatedListTitle)).not.toBeVisible();
    console.log(`List '${updatedListTitle}' deleted and not visible.`);
  });

  test('should allow a user to create, update, and delete a card in a list', async ({ page }) => {
    const listTitle = 'カード用のリスト-' + Date.now(); // ユニークな名前を生成
    const cardTitle = '最初のカード';
    const cardContent = 'これはカードの内容です。';
    const updatedCardTitle = '更新されたカード';
    const updatedCardContent = '更新された内容です。';
    createdListTitles.push(listTitle); // クリーンアップ対象に追加

    // Pre-requisite: Create a list for the cards
    await boardPage.createList(listTitle);
    console.log(`Pre-requisite: List '${listTitle}' created.`);
    await expect(boardPage.getList(listTitle)).toBeVisible();
    console.log(`Pre-requisite: List '${listTitle}' is visible.`);

    // Create Card
    await boardPage.createCard(listTitle, cardTitle, cardContent);
    console.log(`Card '${cardTitle}' created in list '${listTitle}'.`);
    await expect(boardPage.getCard(cardTitle)).toBeVisible();
    await expect(boardPage.getCardContent(cardTitle)).toHaveText(cardContent);
    console.log(`Card '${cardTitle}' and its content are visible.`);

    // Update Card
    await boardPage.editCard(cardTitle, updatedCardTitle, updatedCardContent);
    console.log(`Card '${cardTitle}' updated to '${updatedCardTitle}'.`);
    await expect(boardPage.getCard(cardTitle)).not.toBeVisible();
    await expect(boardPage.getCard(updatedCardTitle)).toBeVisible();
    await expect(boardPage.getCardContent(updatedCardTitle)).toHaveText(updatedCardContent);
    console.log(`Card '${updatedCardTitle}' and its updated content are visible.`);

    // Delete Card
    await boardPage.deleteCard(updatedCardTitle);
    await expect(boardPage.getCard(updatedCardTitle)).not.toBeVisible();
    console.log(`Card '${updatedCardTitle}' deleted and not visible.`);
  });

  test('should allow a user to move a card between lists and reorder within a list', async () => {
    const listATitle = 'リストA-' + Date.now(); // ユニークな名前を生成
    const listBTitle = 'リストB-' + Date.now(); // ユニークな名前を生成
    const card1Title = 'カード1';
    const card2Title = 'カード2';
    const card3Title = 'カード3';
    createdListTitles.push(listATitle, listBTitle); // クリーンアップ対象に追加

    // 1. Arrange: Create lists and cards
    await boardPage.createList(listATitle);
    await boardPage.createList(listBTitle);
    await boardPage.createCard(listATitle, card1Title, '内容1');
    await boardPage.createCard(listATitle, card2Title, '内容2');

    const listA = boardPage.getList(listATitle);
    const listB = boardPage.getList(listBTitle);

    await expect(listA.locator('div[data-testid^="card-"]')).toHaveCount(2);
    await expect(listB.locator('div[data-testid^="card-"]')).toHaveCount(0);

    // 2. Act & Assert: Move card between lists
    await boardPage.moveCardToList(card1Title, listBTitle);
    await expect(listA.locator('div[data-testid^="card-"]')).toHaveCount(1);
    await expect(listB.locator('div[data-testid^="card-"]')).toHaveCount(1);
    await expect(listB.locator(`[data-testid="card-${card1Title}"]`)).toBeVisible();

    // 3. Arrange for reordering
    await boardPage.createCard(listATitle, card3Title, '内容3');
    // Initial order in List A should be [card2, card3]
    let cardTitlesInListA = await listA.locator('[data-testid="card-title"]').allTextContents();
    expect(cardTitlesInListA).toEqual([card2Title, card3Title]);

    // 4. Act & Assert: Reorder card within the same list
    await boardPage.moveCardToAnotherCard(card2Title, card3Title);
    // Final order should be [card3, card2]
    cardTitlesInListA = await listA.locator('[data-testid="card-title"]').allTextContents();
    expect(cardTitlesInListA).toEqual([card3Title, card2Title]);
  });
});