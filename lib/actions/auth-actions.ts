"use server";

import { signIn as authSignIn, signOut as authSignOut } from "@/auth";

export async function signInWithGitHub(formData: FormData) {
  const callbackUrl = (formData.get("callbackUrl") as string) || "/join";

  await authSignIn("github", { redirectTo: callbackUrl });
}

export async function signInWithGoogle(formData: FormData) {
  const callbackUrl = (formData.get("callbackUrl") as string) || "/join";
  await authSignIn("google", { redirectTo: callbackUrl });
}

export async function signOutAction() {
  await authSignOut({ redirectTo: "/" });
}
