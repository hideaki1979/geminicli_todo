export type Task = {
  id: string;
  title: string;
  content: string;
};

export type List = {
  id: string;
  title: string;
  tasks: Task[];
};

export type Board = {
  id: string;
  title: string;
  lists: List[];
};

import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
