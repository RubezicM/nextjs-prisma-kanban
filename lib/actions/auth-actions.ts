"use server"

import { signIn as authSignIn, signOut as authSignOut } from "@/auth"
import prisma from "@/db/prisma"
import { hashSync } from "bcrypt-ts-edge";
import { AuthError } from "next-auth";
import { ZodError } from "zod";
import { signInFormSchema, signUpFormSchema } from "@/lib/validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { handleAuthError, type AuthFormState } from "@/lib/auth-error-handler"



export async function signUpWithCredentials(prevState: unknown, formData: FormData) {
    try {
        const validatedFields = signUpFormSchema.parse({
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword"),

        })

        const {name, email, password} = validatedFields

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {email}
        })

        if (existingUser) {
            return {
                success: false,
                errors: {
                    email: [`User ${email} already exists`],
                },
            };
        }

        // Hash password
        const hashedPassword = hashSync(password, 10)

        // Create user
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        })

        // Sign in the user
        await authSignIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard"
        })

        return {success: true, message: "User registered successfully"};
    } catch (error) {
        // redirect errors are handled by NextAuth, so we can throw them directly
        if (isRedirectError(error)) {
            throw error;
        }
        // zod validation errors, auth errors, and other unexpected errors
        if (error instanceof ZodError) {
            const fieldErrors = error.flatten().fieldErrors;
            return {
                success: false,
                errors: {
                    email: fieldErrors.email,
                    password: fieldErrors.password,
                },
            };
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return {
                        success: false,
                        errors: {
                            general: "Invalid email or password",
                        },
                    };
                case "CallbackRouteError":
                    return {
                        success: false,
                        errors: {
                            general: "An error occurred during sign up. Please try again.",
                        },
                    };
                default:
                    return {
                        success: false,
                        errors: {
                            general: "Something went wrong. Please try again.",
                        },
                    };
            }
        }

        console.error("Sign up error:", error)
        return {
            success: false,
            errors: {
                general: "Something went wrong. Please try again.",
            },
        }
    }
}

export async function signInWithCredentials(prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
    try {

        const validatedFields = signInFormSchema.parse({
            email: formData.get("email"),
            password: formData.get("password"),
        })
        const {email, password} = validatedFields

        await authSignIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard"
        })
        return { success: true, message: "Sign in successful" }
    } catch (error) {
        return handleAuthError(error, "signup")
    }
}


export async function signInAction() {
    await authSignIn("google", {redirectTo: "/dashboard"})
}

export async function signOutAction() {
    await authSignOut({redirectTo: "/"})
}


// Link Google account to existing user
export async function linkGoogleAccount() {
    await authSignIn("google", {redirectTo: "/dashboard/settings"})
}

// Check if user has linked providers
export async function getUserProviders(userId: string) {
    const accounts = await prisma.account.findMany({
        where: {userId},
        select: {provider: true}
    })

    return {
        hasGoogle: accounts.some(acc => acc.provider === "google"),
        hasCredentials: !!(await prisma.user.findUnique({
            where: {id: userId},
            select: {password: true}
        }))?.password
    }
}
