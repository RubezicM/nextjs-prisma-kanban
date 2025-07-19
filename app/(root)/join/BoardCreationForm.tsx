"use client";

import { useActionState, useState, useCallback, useEffect } from "react";
import { createBoard } from "@/lib/actions/board-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useBoardSlugValidation } from "@/hooks/use-board-slug-validation";
import type { CreateBoardState } from "@/lib/actions/board-actions";
import { useRouter } from "next/navigation";
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 40);
};

const BoardCreationForm = () => {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(createBoard, {
    success: false,
    message: "",
  } as CreateBoardState | null);

  useEffect(() => {
    if (state?.success && state?.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  const [slug, setSlug] = useState("");
  const { isAvailable, isChecking } = useBoardSlugValidation(slug);

  const handleTitleChange = useCallback((value: string) => {
    setSlug(generateSlug(value));
  }, []);

  return (
    <div className="fixed inset-0 top-[10%] z-50 backdrop-blur-sm">
      <div className="fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 p-6 duration-200 sm:max-w-lg">
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-foreground text-center text-lg font-semibold">Create a new board</h3>
        </div>
        {/* Form */}
        <form action={formAction as (formData: FormData) => void} className="px-6 pb-6">
          <div className="bg-popover space-y-4 rounded-lg p-6 shadow-2xl">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground text-sm font-medium">
                Board Name
              </Label>
              <Input
                type="text"
                name="title"
                id="title"
                placeholder="My Awesome Project"
                onChange={e => handleTitleChange(e.target.value)}
                className={`text-accent transition-colors duration-200 ${
                  state?.errors?.title
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-input focus-visible:ring-ring"
                } `}
                maxLength={30}
                required
              />
              {state?.errors?.title && (
                <p className="text-destructive mt-1 text-xs">{state.errors.title[0]}</p>
              )}
            </div>

            {/* Slug Field */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-foreground text-sm font-medium">
                Board URL
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  name="slug"
                  value={slug}
                  id="slug"
                  onChange={e => setSlug(e.target.value)}
                  className={`text-foreground pl-26 transition-colors duration-200 ${
                    state?.errors?.slug
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input focus-visible:ring-ring"
                  } `}
                  maxLength={40}
                  required
                />
                <span className="text-muted-foreground pointer-events-none absolute top-[55%] left-3 -translate-y-1/2 text-xs">
                  app.com/board/
                </span>
              </div>
              <div className="min-h-[20px]">
                {state?.errors?.slug && (
                  <p className="text-destructive mt-1 text-xs">{state.errors.slug[0]}</p>
                )}
                {isChecking && slug.length >= 3 && (
                  <span className="text-muted-foreground animate-pulse text-xs">
                    Checking availability...
                  </span>
                )}
                {!isChecking && isAvailable === false && (
                  <span className="text-destructive text-xs">⚠️ URL already taken </span>
                )}

                {!isChecking && isAvailable === true && slug.length >= 3 && (
                  <span className="text-xs text-green-600"> ✅ URL available</span>
                )}
              </div>
            </div>

            {/* General Error */}
            {state?.errors?._form && (
              <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
                <p className="text-destructive text-xs">{state.errors._form[0]}</p>
              </div>
            )}

            {state?.success && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20">
                <p className="text-xs text-green-700 dark:text-green-400">{state.message}</p>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={isPending || isAvailable === false}
            className="mx-auto mt-6 block h-10 w-[80%] font-medium"
            size="default"
          >
            {isPending ? " Creating Board..." : "Create Board"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BoardCreationForm;
