import prisma from "@/db/prisma";
import { ExtendedToken, ExtendedSession } from "@/types/auth-types";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compareSync } from "bcrypt-ts-edge";

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials === null) return null;

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });
        if (user && user.password) {
          const isMatch = compareSync(credentials.password as string, user.password);
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
            };
          }
        }
        return null;
      },
    }),
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
      if (user) {
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { name: token.name },
        });
      }

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
