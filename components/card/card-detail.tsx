"use client";

import { useBoardContext } from "@/contexts/BoardProvider";
import { useCardAutoSave } from "@/hooks/use-card-auto-save";
import { useUpdateCardPriority } from "@/hooks/use-cards";
import { Card } from "@/types/database";

import { JSX, useState, useEffect } from "react";

import CardBreadcrumbs from "@/components/card/card-breadcrumbs";
import { PriorityPicker } from "@/components/card/priority-picker";
import TextEditor from "@/components/shared/editor/text-editor";

import CardBreadcrumbs from "@/components/card/card-breadcrumbs";
import { PriorityPicker } from "@/components/card/priority-picker";
import TextEditor from "@/components/shared/editor/text-editor";

interface CardDetailProps {
  cardId: string;
}

const CardDetail: ({ cardId }: CardDetailProps) => JSX.Element = ({ cardId }: CardDetailProps) => {
  const { boardData, isLoading } = useBoardContext();
  const { saveTitle, saveContent, isSuccess, lastVariables } = useCardAutoSave(cardId);
  const updateCardPriorityMutation = useUpdateCardPriority();
  const [showContentSaved, setShowContentSaved] = useState(false);

  useEffect(() => {
    if (isSuccess && lastVariables?.content !== undefined) {
      setShowContentSaved(true);
      const timer = setTimeout(() => {
        setShowContentSaved(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, lastVariables]);
  const { saveTitle, saveContent } = useCardAutoSave(cardId);
  const updateCardPriorityMutation = useUpdateCardPriority();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!boardData) {
    return (
      <div className="p-6">
        <p className="text-red-500">Board data not found</p>
      </div>
    );
  }

  let foundCard: Card | null = null;
  for (const list of boardData.lists) {
    const card = list.cards.find(c => c.id === cardId);
    if (card) {
      foundCard = card;
      break;
    }
  }

  if (!foundCard) {
    return (
      <div className="p-6">
        <p className="text-red-500">Unexpected error: Card not found in context</p>
      </div>
    );
  }

  const handleTitleChange = (value: string) => {
    saveTitle(value);
  };

  const handleContentChange = (content: string) => {
    saveContent(content);
  };

  const handlePriorityChange = (priority: Card["priority"]) => {
    updateCardPriorityMutation.mutate({ cardId, priority });
  };

  return (
    <div className="bg-background p-3 h-screen overflow-hidden">
      <div className="border rounded-sm bg-popover shadow-sm w-full h-full grid grid-cols-1 lg:grid-cols-[4fr_1fr]">
        <div className="content-area flex flex-col min-h-0">
          <div className="header border-b p-4 flex-shrink-0">
            <CardBreadcrumbs
              boardTitle={boardData.title}
              boardSlug={boardData.slug}
              cardTitle={foundCard.title}
            />
          </div>
          <div className="content-body flex-1 overflow-auto min-h-0">
            <div className="centered-container max-w-[860px] mx-auto p-6">
              <input
                type="text"
                defaultValue={foundCard.title}
                onChange={e => handleTitleChange(e.target.value)}
                className="text-2xl font-bold mb-4 w-full bg-transparent border-none outline-none focus:ring-0 focus:outline-none rounded px-2 py-1 -mx-2"
                placeholder="Card title..."
              />

              <div className="mb-4">
                <div>
                  <TextEditor
                    initialContent={foundCard.content || ""}
                    onContentChange={handleContentChange}
                    variant="fullHeight"
                  />
                </div>
              </div>

              <div className="text-xs text-gray-500 flex flex-row justify-between items-center">
                <p>Created: {new Date(foundCard.createdAt).toLocaleDateString()}</p>
                {showContentSaved && (
                  <p className="text-green-600 transition-opacity duration-300">Content saved ✓</p>
                )}
              <div className="text-sm text-gray-500 flex flex-row gap-4">
                <p>Created: {new Date(foundCard.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="commands-area border-l lg:border-l border-t lg:border-t-0 p-4 lg:block hidden">
          <h3 className="font-semibold mb-4 text-gray-500">Commands</h3>
          <div className="mb-4">
            <PriorityPicker
              priority={foundCard.priority}
              onPriorityChange={handlePriorityChange}
              variant="detailed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetail;
