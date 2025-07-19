import { auth } from "@/auth";

import { redirect } from "next/navigation";

import SignInButtons from "@/components/auth/signin-buttons";

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl } = await searchParams;

  const session = await auth();

  if (session) {
    return redirect(callbackUrl || "/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold">Sign in to your account</h2>
          <p className="mt-2 text-sm">Please sign in with one of the providers</p>
          <div className="mt-8 flex items-center justify-center">
            <SignInButtons />
          </div>
        </div>
      </div>
    </div>
  );
}
