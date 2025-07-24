"use client";

import type { Board } from "@/types/database";
import { ChevronDown } from "lucide-react";

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

  // Extract current board slug from URL
  const currentSlug = pathname.split("/")[2];
  const currentBoard = boards.find(board => board.slug === currentSlug);
  const currentBoardIndex = boards.findIndex(board => board.slug === currentSlug);

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
            return (
              <DropdownMenuItem
                key={board.id}
                onClick={() => router.push(`/board/${board.slug}`)}
                className={`flex items-center gap-2 ${currentSlug === board.slug ? "bg-muted" : ""}`}
              >
                <div
                  className={`w-6 h-6 rounded-sm flex items-center justify-center text-white text-xs font-bold ${avatar.bgColor}`}
                >
                  {avatar.initials}
                </div>
                {board.title}
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
