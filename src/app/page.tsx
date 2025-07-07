import { Board as BoardType } from "@/types";
import path from "path";
import fs from "fs/promises";
import { BoardProvider } from "@/context/BoardContext";
import ClientOnly from "@/components/ClientOnly";
import Header from "@/components/Header";
import Board from "@/components/Board";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

async function getBoardData(): Promise<BoardType> {
  const jsonPath = path.join(process.cwd(), "src", "data", "board.json");
  const jsonData = await fs.readFile(jsonPath, "utf-8");
  return JSON.parse(jsonData);
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
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
