import NextAuth from 'next-auth';
import type { User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcrypt';
import { Collection, Db, MongoClient } from 'mongodb';

// 型をインポート
import { User as CustomUser } from '@/types/index';

async function getDb(): Promise<{ client: MongoClient; db: Db; usersCollection: Collection<CustomUser> }> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'test'); // DB名を指定
    const usersCollection = db.collection<CustomUser>("users");
    return { client, db, usersCollection };
}

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
    adapter: MongoDBAdapter(clientPromise, { databaseName: process.env.MONGODB_DB_NAME || 'test' }),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                const { usersCollection } = await getDb();
                const user = await usersCollection.findOne({ email: credentials.email });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);

                if (isPasswordValid) {
                    const normalizedUser: NextAuthUser = {
                        id: user._id.toHexString(),
                        name: user.name ?? null,
                        email: user.email ?? null,
                        image: user.image ?? null,
                    };
                    return normalizedUser;
                }

                return null;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/signin",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user && 'id' in user) {
                token.sub = user.id;
                token.name = user.name;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub as string;
                // name/email は既に session.user に入っている場合が多いが、存在すれば同期しておく
                if (typeof token.name === 'string') session.user.name = token.name;
                if (typeof token.email === 'string') session.user.email = token.email;
            }
            return session;
        },
    },
}); 