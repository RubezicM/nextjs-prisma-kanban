"use client";

import { useActionState, useState } from "react";

import Link from "next/link";

import { SignUpFormState, signUpWithCredentials } from "@/lib/actions/auth-actions";

import PasswordMatchIndicator from "@/components/auth/PasswordMatchIndicator";
import PasswordStrengthIndicator from "@/components/auth/PasswordStrengthIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CredentialsSignUpForm = () => {
  const [state, formAction, isPending] = useActionState(signUpWithCredentials, {
    success: false,
    message: "",
  } as SignUpFormState);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <form action={formAction} className="space-y-6 w-full">
      <div className="space-y-6">
        <div>
          <Label htmlFor="email" className="mb-1">
            Email
          </Label>
          <Input
            type="text"
            name="email"
            id="email"
            autoComplete="email"
            placeholder="mail@example.com"
          />
          {state?.errors?.email && (
            <p className="text-red-500 text-sm mt-1">{state.errors.email[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="name" className="mb-1">
            Name
          </Label>
          <Input type="text" name="name" id="name" placeholder="John Doe" />
          {state?.errors?.name && (
            <p className="text-red-500 text-sm mt-1">{state.errors.name[0]}</p>
          )}
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
            disabled={isPending}
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              // reset state errors ?
              if (state?.errors?.password) {
                state.errors.password = [];
              }
            }}
          />
          {state?.errors?.password && (
            <p className="text-red-500 text-sm mt-1">{state.errors.password[0]}</p>
          )}
          <PasswordStrengthIndicator password={password} />
          <Label htmlFor="confirmPassword" className="mb-1 mt-4">
            Confirm password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            disabled={isPending}
          />
          <PasswordMatchIndicator password={password} confirmPassword={confirmPassword} />
          {state?.errors?.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{state.errors.confirmPassword[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Button
            className="w-full cursor-pointer"
            variant="default"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Creating account.." : "Sign up"}
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
          Already have an account?{" "}
          <Link href="/auth/sign-in" target="_self" className="underline text-foreground">
            Sign In
          </Link>
        </div>
      </div>
    </form>
  );
};

export default CredentialsSignUpForm;
