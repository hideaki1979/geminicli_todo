import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
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
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }