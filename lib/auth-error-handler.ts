// lib/auth-error-handler.ts
import { ZodError } from "zod"
import { AuthError } from "next-auth"
import { isRedirectError } from "next/dist/client/components/redirect-error";

export type AuthFormState = {
    errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
        confirmPassword?: string[]
        general?: string
    }
    success?: boolean
    message?: string
} | null

export function handleAuthError(error: unknown, context: "signin" | "signup" = "signin"): AuthFormState {
    // Redirect errors should be re-thrown to let NextAuth handle them
    if (isRedirectError(error)) {
        throw error
    }

    // Zod validation errors
    if (error instanceof ZodError) {
        const fieldErrors = error.flatten().fieldErrors

        // Only include fields that actually have errors (avoid undefined values)
        const errors: AuthFormState["errors"] = {}

        if (fieldErrors.email) errors.email = fieldErrors.email
        if (fieldErrors.password) errors.password = fieldErrors.password

        // Only include signup-specific fields if we're in signup context
        if (context === "signup") {
            if (fieldErrors.name) errors.name = fieldErrors.name
            if (fieldErrors.confirmPassword) errors.confirmPassword = fieldErrors.confirmPassword
        }

        return {
            success: false,
            errors,
        }
    }


    // NextAuth errors
    if (error instanceof AuthError) {
        switch (error.type) {
            case "CredentialsSignin":
                return {
                    success: false,
                    errors: {
                        general: "Invalid email or password",
                    },
                }
            case "CallbackRouteError":
                const actionText = context === "signup" ? "sign up" : "sign in"
                return {
                    success: false,
                    errors: {
                        general: `An error occurred during ${actionText}. Please try again.`,
                    },
                }
            default:
                return {
                    success: false,
                    errors: {
                        general: "Something went wrong. Please try again.",
                    },
                }
        }
    }

    // Database/Prisma errors (you might want to add specific handling)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
        return {
            success: false,
            errors: {
                email: ["This email is already registered"],
            },
        }
    }

    // Unexpected errors
    console.error(`Auth ${context} error:`, error)
    return {
        success: false,
        errors: {
            general: "Something went wrong. Please try again.",
        },
    }
}
