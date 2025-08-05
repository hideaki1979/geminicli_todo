import type { Metadata } from "next";
import ClientOnly from "@/components/ClientOnly";
import Header from "@/components/Header";
import Board from "@/components/Board";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: 'ボード',
};

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <>
      <Header />
      <main>
        <ClientOnly>
          <Board />
        </ClientOnly>
      </main>
    </>
  );
}