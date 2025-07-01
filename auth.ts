import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import  prisma from "@/db/prisma"
import type { NextAuthConfig } from "next-auth"
import { ExtendedToken, ExtendedSession } from "@/types/auth-types"

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
                    scope: "read:user user:email"
                }
            },
            profile(profile) {
                return {
                    id: profile.id.toString(),
                    name: profile.name || profile.login,
                    email: profile.email || `${profile.login}@users.noreply.github.com`, // GitHub fallback!
                    image: profile.avatar_url,
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account, profile, trigger, session }) {
            // Initial sign in
            if (account && user) {
                token.provider = account.provider
                token.userId = user.id
            }

            return token
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
    debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
