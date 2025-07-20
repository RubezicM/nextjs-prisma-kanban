"use client";

import { useActionState } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { signInWithCredentials } from "@/lib/actions/auth-actions";
import type { SignInFormState } from "@/lib/actions/auth-actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CredentialsSignInForm = ({ formDisabled }: { formDisabled?: boolean }) => {
  const [state, formAction, isPending] = useActionState(signInWithCredentials, {
    success: false,
    message: "",
  } as SignInFormState);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="email" className="mb-1">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="e.g janedoe@email.com"
            disabled={isPending || formDisabled}
          />
        </div>
        <div>
          <Label htmlFor="password" className="mb-1">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="password"
            disabled={isPending || formDisabled}
          />
          {state?.errors?.password && (
            <p className="text-red-500 text-sm mt-1">{state.errors.password[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Button
            className="w-full cursor-pointer"
            variant="default"
            type="submit"
            disabled={isPending || formDisabled}
          >
            {isPending ? "Signing in.." : "Log In"}
          </Button>
          {/* General error */}
          {state?.errors?.general && (
            <div className="rounded-md p-2">
              <p className="text-red-700 text-sm">{state.errors.general}</p>
            </div>
          )}

          {/* Success message */}
          {state?.success && (
            <div className="rounded-md p-2">
              <p className="text-green-700 text-sm">{state.message}</p>
            </div>
          )}
        </div>
        <div className="text-sm text-center text-foreground">
          <span>Don&apos;t have an account? </span>
          <Link href="/auth/sign-up" target="_self" className="underline text-foreground">
            Sign up
          </Link>
        </div>
      </div>
    </form>
  );
};

export default CredentialsSignInForm;
