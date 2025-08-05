import type { DefaultSession } from 'next-auth'

declare module 'next-auth/jwt' {
    /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
    interface JWT {
        /** OpenID ID Token */
        id?: string
    }
}

import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
} 