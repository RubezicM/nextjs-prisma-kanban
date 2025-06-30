import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import  prisma from "@/db/prisma"
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth"
import { ExtendedToken, ExtendedSession } from "@/types/auth-types"

export const authConfig = {
    pages: {
        signIn: "/auth/sign-in",
        error: "/auth/error",
        newUser: "/auth/sign-up",
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
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            },
            // allowDangerousEmailAccountLinking: true,
        }),

        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (credentials === null) return null;

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email as string
                    }
                })

                if (user && user.password) {
                    const isPasswordValid = compareSync(
                        credentials.password as string,
                        user.password
                    )

                    if (isPasswordValid) {
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name
                        }
                    }
                }
                return null
            }
        })
    ],
    callbacks: {
        // JWT callback - runs whenever JWT is created, updated, or accessed
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

        // Sign in callback
        // async signIn({ user, account, profile }) {
        //     if (!user.email) return false
        //
        //     if (account?.provider === "google") {
        //         try {
        //             // Check if user exists with this email
        //             const existingUser = await prisma.user.findUnique({
        //                 where: { email: user.email },
        //                 include: { accounts: true }
        //             })
        //
        //             if (existingUser) {
        //
        //                 // Check if this Google account is already linked
        //                 const existingAccount = existingUser.accounts.find(
        //                     acc => acc.provider === "google" && acc.providerAccountId === account.providerAccountId
        //                 )
        //
        //                 if (!existingAccount) {
        //                     // Link the Google account to existing user
        //                     await prisma.account.create({
        //                         data: {
        //                             userId: existingUser.id,
        //                             type: account.type,
        //                             provider: account.provider,
        //                             providerAccountId: account.providerAccountId,
        //                             refresh_token: account.refresh_token,
        //                             access_token: account.access_token,
        //                             expires_at: account.expires_at,
        //                             token_type: account.token_type,
        //                             scope: account.scope,
        //                             id_token: account.id_token,
        //                             session_state: account.session_state as string | undefined,
        //                         }
        //                     })
        //                 }
        //
        //             }
        //         } catch (error) {
        //             console.error("Error in signIn callback:", error)
        //             return false
        //         }
        //     }
        //
        //     return true
        // },
    },
    debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
