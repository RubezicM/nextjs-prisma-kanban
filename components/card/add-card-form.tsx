"use client";

import { useCreateCard } from "@/hooks/use-cards";

import { useState } from "react";

import TextEditor from "@/components/shared/editor/text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddCardFormProps {
  listId: string;
  onSuccess?: () => void;
  boardSlug?: string;
}

const AddCardForm = ({ listId, onSuccess, boardSlug }: AddCardFormProps) => {
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<{
    title?: string[];
    content?: string[];
    listId?: string[];
    boardSlug?: string[];
    _form?: string[];
  }>({});
  const createCardMutation = useCreateCard(listId);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set("content", content);
    formData.set("listId", listId);
    if (boardSlug) {
      formData.set("boardSlug", boardSlug);
    }
    try {
      const result = await createCardMutation.mutateAsync(formData);

      if (!result.success) {
        setErrors(result.errors || { _form: ["Failed to create card. Please try again."] });
        return;
      }

      // Only on success:
      onSuccess?.();
      setContent("");
      setErrors({});
    } catch (error) {
      console.error("Unexpected error during card creation:", error);
      setErrors({ _form: ["Failed to create card. Please try again."] });
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="content" value={content} />
      <div className="flex flex-col gap-2">
        <div>
          <Label htmlFor="title" className="hidden">
            Title
          </Label>
          <Input
            type="text"
            name="title"
            className="placeholder:text-lg text-lg"
            placeholder="Add Title"
            disabled={createCardMutation.isPending}
            autoFocus
            id="title"
            required
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title[0]}</p>}
        </div>
        <div className="border rounded-md bg-background">
          <TextEditor onContentChange={setContent} />
        </div>
      </div>
      <div className="border-t py-2 my-4 flex flex-col gap-2">
        {errors._form && <p className="text-red-500 text-sm">{errors._form[0]}</p>}
        <div className="flex items-end justify-end gap-2">
          <Button type="submit" size="sm" disabled={createCardMutation.isPending}>
            {createCardMutation.isPending ? "Creating..." : "Add Card"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddCardForm;
