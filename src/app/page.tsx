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
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/board`);
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
