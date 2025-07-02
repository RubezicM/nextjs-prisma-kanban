'use client'

import { useActionState } from "react";
import { createBoard } from "@/lib/actions/board-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const OnboardingWizard = ({userId}: { userId: string }) => {
    const [state, formAction, isPending] = useActionState(createBoard, {
        success: false,
        message: "",
    } as any);

    return (
        <div className="fixed top-[10%] inset-0 z-50">
            <div className="fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 p-6duration-200 sm:max-w-lg">
                <div className="px-6 pt-6 pb-4">
                    <h3 className="text-center text-lg font-semibold text-foreground">
                        Create a new board
                    </h3>

                </div>
                {/* Form */}
                <form action={formAction as any} className="px-6 pb-6">
                    <div className="space-y-4">
                        {/* Title Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="title"
                                className="text-sm font-medium text-foreground"
                            >
                                Workspace name
                            </Label>
                            <Input
                                type="text"
                                name="title"
                                id="title"
                                placeholder="My Awesome Project"
                                className={`
                                        transition-colors duration-200
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
                                Workspace URL
                            </Label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    name="slug"
                                    id="slug"
                                    placeholder="my-awesome-project"
                                    className={`
                                            pl-20 transition-colors duration-200
                                            ${state?.errors?.slug
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : "border-input focus-visible:ring-ring"
                                    }
                                        `}
                                    maxLength={40}
                                    required
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                        app.com/
                                    </span>
                            </div>
                            {state?.errors?.slug && (
                                <p className="text-xs text-destructive mt-1">
                                    {state.errors.slug[0]}
                                </p>
                            )}
                        </div>

                        {/* General Error */}
                        {state?.errors?._form && (
                            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                                <p className="text-xs text-destructive">
                                    {state.errors._form[0]}
                                </p>
                            </div>
                        )}

                        {/* Success Message */}
                        {state?.success && (
                            <div className="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3">
                                <p className="text-xs text-green-700 dark:text-green-400">
                                    {state.message}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-[80%] mt-6 h-10 mx-auto block font-medium"
                        size="default"
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Creating Board...
                            </div>
                        ) : (
                            "Create Board"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
};

export default OnboardingWizard;
