"use client";

import { useBoardLoading } from "@/contexts/BoardLoadingContext";
import type { Board } from "@/types/database";
import { ChevronDown, Loader2 } from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { getBoardAvatar } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BoardSwitcherProps {
  boards: Board[];
}

export default function BoardSwitcher({ boards }: BoardSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { state: loadingState, startLoading } = useBoardLoading();

  // Extract current board slug from URL
  const currentSlug = pathname.split("/")[2];
  const currentBoard = boards.find(board => board.slug === currentSlug);
  const currentBoardIndex = boards.findIndex(board => board.slug === currentSlug);

  const handleBoardClick = (board: Board) => {
    // Don't allow clicking if already loading or if it's the current board
    if (loadingState.isLoading || board.slug === currentSlug) {
      return;
    }

    startLoading(board.title, board.slug);
    router.push(`/board/${board.slug}`);
  };

  if (boards.length === 0) {
    return (
      <Button variant="ghost" size="sm" onClick={() => router.push("/join")}>
        Create Board
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <>
            {currentBoard ? (
              <>
                <div
                  className={`w-6 h-6 rounded-sm flex items-center justify-center text-white text-xs font-bold ${getBoardAvatar(currentBoard.title, currentBoardIndex).bgColor}`}
                >
                  {getBoardAvatar(currentBoard.title, currentBoardIndex).initials}
                </div>
                <span className="font-medium">{currentBoard.title}</span>
              </>
            ) : (
              <span className="font-medium">Select Board</span>
            )}
          </>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="p-4 space-y-2">
        <>
          {boards.map((board, index) => {
            const avatar = getBoardAvatar(board.title, index);
            const isCurrentBoard = currentSlug === board.slug;
            const isLoadingThisBoard =
              loadingState.isLoading && loadingState.loadingBoardSlug === board.slug;
            const isDisabled = loadingState.isLoading || isCurrentBoard;

            return (
              <DropdownMenuItem
                key={board.id}
                onClick={() => handleBoardClick(board)}
                className={`flex items-center gap-2 ${
                  isCurrentBoard ? "bg-muted" : ""
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={isDisabled}
              >
                <div
                  className={`w-6 h-6 rounded-sm flex items-center justify-center text-white text-xs font-bold ${avatar.bgColor}`}
                >
                  {isLoadingThisBoard ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    avatar.initials
                  )}
                </div>
                <span className={isLoadingThisBoard ? "opacity-75" : ""}>{board.title}</span>
                {isLoadingThisBoard && (
                  <div className="ml-auto">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                )}
              </DropdownMenuItem>
            );
          })}
        </>
        <DropdownMenuItem onClick={() => router.push("/join")} asChild>
          <Link href="/join">+ Create new board</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
