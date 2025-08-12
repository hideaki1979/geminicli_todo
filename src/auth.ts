import NextAuth, { Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcrypt';
import { Collection, Db, MongoClient } from 'mongodb';

// 型をインポート
import { User as CustomUser } from '@/types';

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
                    return user as any;
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
        async jwt({ token, user }: { token: JWT, user?: CustomUser }) {
            if (user?._id) {
                token.id = user._id.toHexString();
                token.name = user.name;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }: { session: Session, token: JWT }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
                session.user.name = token.name;
                session.user.email = token.email;
            }
            return session;
        },
    },
}); 