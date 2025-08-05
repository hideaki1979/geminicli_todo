import type { Metadata } from "next";
import { Board as BoardType } from "@/types";

export const metadata: Metadata = {
  title: 'ボード',
};
import { BoardProvider } from "@/context/BoardContext";
import ClientOnly from "@/components/ClientOnly";
import Header from "@/components/Header";
import Board from "@/components/Board";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

async function getBoardData(): Promise<BoardType> {
  try {
    // フォールバック or 相対パス利用
    const baseUrl = process.env.NEXTAUTH_URL ?? '';
    const response = await fetch(
      `${baseUrl}/api/board`,
      {
        // デフォルトキャッシュを利用しつつ、必要に応じて再検証
        next: { revalidate: 60 },
      });

    if (!response.ok) {
      throw new Error('Failed to fetch board data');
    }
    return response.json();
  } catch (error) {
    console.error('Fetch処理でエラー発生：', error);
    throw error;
  }
}

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const boardData = await getBoardData();

  return (
    <>
      <Header />
      <main>
        <ClientOnly>
          <BoardProvider initialBoard={boardData}>
            <Board />
          </BoardProvider>
        </ClientOnly>
      </main>
    </>
  );
}
