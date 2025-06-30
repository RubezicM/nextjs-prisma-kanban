'use client'

import { signInWithGitHub } from "@/lib/actions/auth-actions";
import { FaGithub } from "react-icons/fa";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

const GithubButton = ({isAuthenticating, setIsAuthenticating}) => {
    const [state, formAction, isPending] = useActionState(signInWithGitHub, null);
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const handleSubmit = (formData: FormData) => {
        setIsAuthenticating(true)
        return formAction()
    }


    const isDisabled = isPending || isAuthenticating

    return (
        // signInWithGoogle
        <form action={handleSubmit as any}>
            <input type="hidden"
                   name="callbackUrl"
                   value={callbackUrl}/>
            <button
                disabled={isDisabled}
                type="submit"
                className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors"
            >{isPending ? 'Signing in...' : 'GitHub'}<FaGithub className="w-4 h-4"/>
            </button>
        </form>
    );
};

export default GithubButton;
