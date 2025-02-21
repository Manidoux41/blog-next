import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth/next";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Update user's connection state
        await prisma.user.update({
          where: { id: user.id },
          data: { isConnected: true }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isConnected: true
        };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isConnected = user.isConnected;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isConnected = token.isConnected as boolean;
      }
      return session;
    },
    signOut: async ({ token }) => {
      if (token?.sub) {
        await prisma.user.update({
          where: { id: token.sub },
          data: { isConnected: false }
        });
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };