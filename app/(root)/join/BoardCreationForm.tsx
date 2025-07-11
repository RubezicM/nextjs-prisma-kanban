'use client'

import { useActionState, useState, useCallback, useEffect } from "react";
import { createBoard } from "@/lib/actions/board-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useBoardSlugValidation } from "@/hooks/use-board-slug-validation";
import { useRouter } from 'next/navigation'
const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 40)
}

const BoardCreationForm = () => {

    const router = useRouter()

    const [state, formAction, isPending] = useActionState(createBoard, {
        success: false,
        message: "",
    } as any);


    useEffect(() => {
        if (state?.success && state?.redirectTo) {
            router.push(state.redirectTo)
        }
    }, [state, router])

    const [slug, setSlug] = useState("");
    const {isAvailable, isChecking} = useBoardSlugValidation(slug);

    const handleTitleChange = useCallback(
        (value: string) => {
            setSlug(generateSlug(value))
        }, []
    )

    return (
        <div className="fixed top-[10%] inset-0 z-50 backdrop-blur-sm">
            <div className="fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 p-6 duration-200 sm:max-w-lg">
                <div className="px-6 pt-6 pb-4">
                    <h3 className="text-center text-lg font-semibold text-foreground">
                        Create a new board
                    </h3>

                </div>
                {/* Form */}
                <form action={formAction as any}
                      className="px-6 pb-6">
                    <div className="space-y-4 bg-popover rounded-lg p-6 shadow-sm">
                        <div className="space-y-2">
                            <Label
                                htmlFor="title"
                                className="text-sm font-medium text-foreground"
                            >
                                Board Name
                            </Label>
                            <Input
                                type="text"
                                name="title"
                                id="title"
                                placeholder="My Awesome Project"
                                onChange={(e) => handleTitleChange(e.target.value)}
                                className={`text-foreground transition-colors duration-200
                                        ${state?.errors?.title
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : "border-input focus-visible:ring-ring"
                                }
                                    `}
                                maxLength={30}
                                required
                            />
                            {state?.errors?.title && (
                                <p className="text-xs text-destructive mt-1">
                                    {state.errors.title[0]}
                                </p>
                            )}
                        </div>

                        {/* Slug Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="slug"
                                className="text-sm font-medium text-foreground"
                            >
                                Board URL
                            </Label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    name="slug"
                                    value={slug}
                                    id="slug"
                                    onChange={(e) => setSlug(e.target.value)}
                                    className={`
                                            pl-26 transition-colors duration-200 text-foreground
                                            ${state?.errors?.slug
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : "border-input focus-visible:ring-ring"
                                    }
                                        `}
                                    maxLength={40}
                                    required
                                />
                                <span className="absolute left-3 top-[55%] -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                        app.com/board/
                                    </span>
                            </div>
                            <div className="min-h-[20px]">
                                {state?.errors?.slug && (
                                    <p className="text-xs text-destructive mt-1">
                                        {state.errors.slug[0]}
                                    </p>
                                )}
                                {isChecking && slug.length >= 3 && (
                                    <span className="text-xs text-muted-foreground animate-pulse">Checking availability...</span>
                                )}
                                {!isChecking && isAvailable === false && (
                                    <span className="text-xs text-destructive">⚠️ URL already taken </span>
                                )}

                                {!isChecking && isAvailable === true && slug.length >= 3 && (
                                    <span className="text-xs text-green-600"> ✅ URL available</span>
                                )}
                            </div>

                        </div>

                        {/* General Error */}
                        {state?.errors?._form && (
                            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                                <p className="text-xs text-destructive">
                                    {state.errors._form[0]}
                                </p>
                            </div>
                        )}

                        {state?.success && (
                            <div className="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3">
                                <p className="text-xs text-green-700 dark:text-green-400">
                                    {state.message}
                                </p>
                            </div>
                        )}
                    </div>
                    <Button
                        type="submit"
                        disabled={isPending || isAvailable === false}
                        className="w-[80%] mt-6 h-10 mx-auto block font-medium"
                        size="default"
                    >
                        {isPending ?
                            " Creating Board..."
                            : "Create Board"
                        }
                    </Button>
                </form>
            </div>
        </div>
    )
};

export default BoardCreationForm;
