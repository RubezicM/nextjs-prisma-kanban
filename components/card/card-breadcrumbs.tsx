"use client";

import { ChevronRight, LayoutDashboard } from "lucide-react";

import Link from "next/link";

interface CardBreadcrumbsProps {
  boardTitle: string;
  boardSlug: string;
  cardTitle: string;
}

const CardBreadcrumbs = ({ boardTitle, boardSlug, cardTitle }: CardBreadcrumbsProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link
        href={`/board/${boardSlug}`}
        className="flex items-center gap-1.5 text-accent-foreground hover:text-white transition-colors duration-200 font-semibold bg-accent hover:bg-accent/90 px-3 py-1.5 rounded-md"
      >
        <LayoutDashboard className="h-4 w-4 text-accent-foreground/80" />
        <span className="hidden sm:inline">{boardTitle}</span>
        <span className="sm:hidden truncate max-w-[100px]">{boardTitle}</span>
      </Link>

      <ChevronRight className="h-4 w-4 text-white" />

      <span className="text-white font-semibold truncate max-w-[150px] sm:max-w-[200px]">
        {cardTitle}
      </span>
    </nav>
  );
};

export default CardBreadcrumbs;
