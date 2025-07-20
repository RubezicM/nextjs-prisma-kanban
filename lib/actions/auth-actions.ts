"use server";

import { signIn as authSignIn, signOut as authSignOut } from "@/auth";
import prisma from "@/db/prisma";
import { hashSync } from "bcrypt-ts-edge";
import { ZodError } from "zod";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signInFormSchema, signUpFormSchema } from "@/lib/validators";

// #todo - error handling, add more specific error messages

export type SignUpFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    general?: string;
  };
  success?: boolean;
  message?: string;
} | null;

export const signUpWithCredentials = async (prevState: unknown, formData: FormData) => {
  try {
    // Parse and validate the form data using Zod schema
    const userData = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      return {
        success: false,
        errors: {
          email: [`User ${userData.email} already exists`],
        },
      };
    }
    const plainPassword = userData.password;

    // Hash the password before saving it to the database
    userData.password = hashSync(plainPassword, 10);

    await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      },
    });

    // Sign in the user after successful registration
    await authSignIn("credentials", {
      email: userData.email,
      password: plainPassword,
      redirectTo: "/",
    });

    return { success: true, message: "User registered successfully" };
  } catch (e) {
    if (isRedirectError(e)) {
      throw e;
    }

    // Handle Zod validation errors
    if (e instanceof ZodError) {
      const fieldErrors = e.flatten().fieldErrors;
      return {
        success: false,
        errors: {
          name: fieldErrors.name,
          email: fieldErrors.email,
          password: fieldErrors.password,
          confirmPassword: fieldErrors.confirmPassword,
        },
      };
    }

    console.error("Sign up error:", e);
    return {
      success: false,
      errors: {
        general: "Something went wrong. Please try again.",
      },
    };
  }
};

export type SignInFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    general?: string;
  };
  success?: boolean;
  message?: string;
} | null;

export async function signInWithCredentials(
  prevState: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    await authSignIn("credentials", user);
    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    console.log("error", error);
    if (isRedirectError(error)) {
      throw error;
    }

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
              general: "Wrong credentials",
            },
          };
        case "CallbackRouteError":
          return {
            success: false,
            errors: {
              general: "Authentication error",
            },
          };
        default:
          return {
            success: false,
            errors: {
              general: "Unexpected error during sign-in",
            },
          };
      }
    }

    console.error("Unexpected error:", error);
    return {
      success: false,
      errors: {
        general: "An unexpected error occurred",
      },
    };
  }
}

export async function signInWithGoogle(formData: FormData) {
  const callbackUrl = (formData.get("callbackUrl") as string) || "/join";
  await authSignIn("google", { redirectTo: callbackUrl });
}

export async function signInWithGitHub(formData: FormData) {
  const callbackUrl = (formData.get("callbackUrl") as string) || "/";
  console.log("Signing in with GitHub, redirecting to:", callbackUrl);
  await authSignIn("github", { redirectTo: callbackUrl });
}

export async function signOutAction() {
  try {
    await authSignOut({ redirectTo: "/" });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error; // Prebaci redirect dalje
    }
    console.error("Error signing out user:", error);
    throw new Error("Failed to sign out");
  }
}
