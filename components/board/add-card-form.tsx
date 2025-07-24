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
  const createCardMutation = useCreateCard(listId);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    formData.set("content", content);
    formData.set("listId", listId);
    if (boardSlug) {
      formData.set("boardSlug", boardSlug);
    }
    try {
      await createCardMutation.mutateAsync(formData);
      onSuccess?.();
      setContent("");
    } catch (error) {
      console.error("Failed to create card:", error);
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
          ></Input>
        </div>
        <div className="border rounded-md bg-background">
          <TextEditor onContentChange={setContent} />
        </div>
      </div>
      <div className="border-t py-2 my-4 flex items-end justify-end gap-2">
        <Button type="submit" size="sm" disabled={createCardMutation.isPending}>
          {createCardMutation.isPending ? "Creating..." : "Add Card"}
        </Button>
      </div>
    </form>
  );
};

export default AddCardForm;
