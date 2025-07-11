'use client'

import { useState, useTransition } from "react";
import { signInWithGitHub, signInWithGoogle } from "@/lib/actions/auth-actions";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useSearchParams } from "next/navigation";

const SignInButtons = () => {
    const [isPending, startTransition] = useTransition()
    const searchParams = useSearchParams();
    const [activeButton, setActiveButton] = useState<'google' | 'github' | null>(null)
    const callbackUrl = searchParams.get("callbackUrl") || "/join"; // ← Change from /dashboard

    const handleGoogleSignIn = () => {
        setActiveButton('google')
        startTransition(async () => {
            const formData = new FormData()
            formData.append('callbackUrl', callbackUrl)
            await signInWithGoogle(formData as FormData)
        })
    }

    const handleGitHubSignIn = () => {
        setActiveButton('github')
        startTransition(async () => {
            const formData = new FormData()
            formData.append('callbackUrl', callbackUrl)
            await signInWithGitHub(formData as FormData)
        })
    }

    return (

        <div className="flex gap-3 justify-center items-center w-full">
            <button
                disabled={isPending}
                onClick={handleGoogleSignIn}
                className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors disabled:opacity-20"
            >
                {isPending && activeButton === 'google' ? 'Signing in...' : 'Google'}
                <FaGoogle className="w-4 h-4"/>
            </button>

            <button
                disabled={isPending}
                onClick={handleGitHubSignIn}
                className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors disabled:opacity-20"
            >
                {isPending && activeButton === 'github' ? 'Signing in...' : 'GitHub'}
                <FaGithub className="w-4 h-4"/>
            </button>
        </div>
    );
};

export default SignInButtons;
