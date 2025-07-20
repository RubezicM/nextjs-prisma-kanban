"use client";

import { useState, useTransition } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";

import { useSearchParams } from "next/navigation";

import { signInWithGitHub, signInWithGoogle } from "@/lib/actions/auth-actions";

import CredentialsSignInForm from "@/components/auth/forms/credentials-signin-form";
import { Button } from "@/components/ui/button";

const LoginAuthPanel = () => {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const [activeButton, setActiveButton] = useState<"google" | "github" | null>(null);
  const callbackUrl = searchParams.get("callbackUrl") || "/";

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
    <div className="flex flex-col w-full items-center justify-center gap-4 my-4">
      <>
        <Button
          variant="outline"
          disabled={isPending}
          onClick={handleGoogleSignIn}
          className="w-full"
        >
          <FaGoogle className="h-4 w-4" />
          {isPending && activeButton === "google" ? "Signing in..." : "Log in with Google"}
        </Button>

        <Button
          variant="outline"
          disabled={isPending}
          onClick={handleGitHubSignIn}
          className="w-full"
        >
          <FaGithub className="h-4 w-4" />
          {isPending && activeButton === "github" ? "Signing in..." : "Log in with GitHub"}
        </Button>
      </>
      <div className="w-full after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
        <span className="bg-background text-muted-foreground relative z-10 px-2">
          Or continue with
        </span>
      </div>
      <CredentialsSignInForm formDisabled={isPending} />
    </div>
  );
};

export default LoginAuthPanel;
