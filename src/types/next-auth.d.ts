import type { DefaultSession } from 'next-auth'

declare module 'next-auth/jwt' {
    /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
    interface JWT {
        /** OpenID ID Token */
        id?: string
    }
}

declare module 'next-auth' {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the
     * `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's postal address. */
            id: string
        } & DefaultSession['user']
    }
} 