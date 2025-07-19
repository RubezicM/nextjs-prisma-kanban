"use client";

import { useState, useTransition } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";

import { useSearchParams } from "next/navigation";

import { signInWithGitHub, signInWithGoogle } from "@/lib/actions/auth-actions";

const SignInButtons = () => {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const [activeButton, setActiveButton] = useState<"google" | "github" | null>(null);
  const callbackUrl = searchParams.get("callbackUrl") || "/join"; // ← Change from /dashboard

  const handleGoogleSignIn = () => {
    setActiveButton("google");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("callbackUrl", callbackUrl);
      await signInWithGoogle(formData as FormData);
    });
  };

  const handleGitHubSignIn = () => {
    setActiveButton("github");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("callbackUrl", callbackUrl);
      await signInWithGitHub(formData as FormData);
    });
  };

  return (
    <div className="flex w-full items-center justify-center gap-3">
      <button
        disabled={isPending}
        onClick={handleGoogleSignIn}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-200 focus:outline-none disabled:opacity-20"
      >
        {isPending && activeButton === "google" ? "Signing in..." : "Google"}
        <FaGoogle className="h-4 w-4" />
      </button>

      <button
        disabled={isPending}
        onClick={handleGitHubSignIn}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-200 focus:outline-none disabled:opacity-20"
      >
        {isPending && activeButton === "github" ? "Signing in..." : "GitHub"}
        <FaGithub className="h-4 w-4" />
      </button>
    </div>
  );
};

export default SignInButtons;
