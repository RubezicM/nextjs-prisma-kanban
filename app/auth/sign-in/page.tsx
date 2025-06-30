import { SignInButton } from "@/components/auth/signin-button"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function SignInPage() {
    const session = await auth()

    // if (session) {
    //     redirect("/dashboard")
    // }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Use your Google account to continue
                    </p>
                </div>
                <div className="mt-8 flex justify-center">
                    <SignInButton />
                </div>
            </div>
        </div>
    )
}
