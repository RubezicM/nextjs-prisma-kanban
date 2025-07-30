"use client";

import { useBoardContext } from "@/contexts/BoardProvider";
import { Card } from "@/types/database";

import { JSX } from "react";

interface CardDetailProps {
  cardId: string;
}

const CardDetail: ({ cardId }: CardDetailProps) => JSX.Element = ({ cardId }: CardDetailProps) => {
  const { boardData, isLoading } = useBoardContext();

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
  console.log("Board Data:", boardData);
  console.log("cardId", cardId);

  // Find the card in the board data
  let foundCard: Card | null = null;
  for (const list of boardData.lists) {
    const card = list.cards.find(c => c.id === cardId);
    if (card) {
      foundCard = card;
      break;
    }
  }

  // Card existence is now validated in the server page, so this shouldn't happen
  if (!foundCard) {
    return (
      <div className="p-6">
        <p className="text-red-500">Unexpected error: Card not found in context</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{foundCard.title}</h1>
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Card ID: {cardId}</p>
        <p className="text-sm text-gray-500 mb-2">Priority: {foundCard.priority}</p>
      </div>
      {foundCard.content && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{foundCard.content}</p>
        </div>
      )}
      <div className="text-sm text-gray-500">
        <p>Created: {new Date(foundCard.createdAt).toLocaleDateString()}</p>
        <p>Updated: {new Date(foundCard.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default CardDetail;
