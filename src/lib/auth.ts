

import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  // Connects NextAuth session/account tables to our Prisma DB
  adapter: PrismaAdapter(prisma) as any,

  session: {
    strategy: "jwt", // JWT so we can read userId in middleware without a DB hit
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, name: true, password: true, image: true },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],

  callbacks: {
    // Persist userId into the JWT token
    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    // Expose userId on the client-side session object
    async session({ session, token }) {
      if (token?.userId) session.user.id = token.userId as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

// ── Server-side helper ────────────────────────────────────────────────────────
// Use in Server Components and Route Handlers instead of getServerSession directly

export async function getSession() {
  return getServerSession(authOptions);
}

// Throws if not authenticated — use in protected API routes
export async function requireSession() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

// Augment the default Session type to include our custom userId field
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}