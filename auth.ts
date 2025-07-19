import prisma from "@/db/prisma";
import { ExtendedToken, ExtendedSession } from "@/types/auth-types";
import { PrismaAdapter } from "@auth/prisma-adapter";

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const authConfig = {
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email || `${profile.login}@users.noreply.github.com`, // GitHub fallback!
          image: profile.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.provider = account.provider;
        token.userId = user.id;
      }

      return token;
    },

    // Session callback - shape the session object
    async session({ session, token }): Promise<ExtendedSession> {
      const extendedToken = token as ExtendedToken;
      if (extendedToken.userId) {
        (session as ExtendedSession).user.id = extendedToken.userId;
        (session as ExtendedSession).user.provider = extendedToken.provider;
      }

      return session as ExtendedSession;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
