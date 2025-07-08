import NextAuth, { Session, User } from "next-auth"
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials"

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // 環境変数から認証情報を読み込む
                const validUserName = process.env.DEMO_USERNAME;
                const validPassword = process.env.DEMO_PASSWORD;

                if (!validUserName || !validPassword) {
                    return null;
                }

                if (credentials?.username === validUserName &&
                    credentials.password === validPassword
                ) {
                    // 今後の実装でDBからユーザー情報を取得する。
                    const user = { id: "1", name: "J Smith", email: "jsmish@example.com" };
                    return user
                }
                return null
            }
        })
    ],
    pages: {
        signIn: "/auth/signin",
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT, user: User }) {
            if (user?.id) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: { session: Session, token: JWT }) {
            if (session.user && token?.id) {
                session.user.id = token.id;
            }
            return session;
        },
    },
}); 