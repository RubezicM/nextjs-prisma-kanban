"use client";

import type { Card, List } from "@/types/database";
import { ChevronLeft, ChevronRight, EyeOff } from "lucide-react";

import { useState } from "react";

import HiddenColumnCard from "@/components/board/hidden-column-card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type HiddenColumnsAreaProps = {
  hiddenLists: (List & {
    icon: string;
    color: string;
    cards: Card[];
  })[];
};

const HiddenColumnsArea = ({ hiddenLists }: HiddenColumnsAreaProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (hiddenLists.length === 0) {
    return null;
  }

  return (
    <div
      className={`border-l bg-muted/20 flex-shrink-0 transition-all duration-300 ${
        isCollapsed ? "w-12" : "w-72"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Hidden columns</h3>
            <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
              {hiddenLists.length}
            </span>
          </div>
        )}
        <Tooltip delayDuration={800}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="border rounded-sm">
            {isCollapsed ? "Expand hidden area" : "Collapse hidden area"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {hiddenLists.map(list => (
            <HiddenColumnCard key={list.id} list={list} />
          ))}
        </div>
      )}

      {/* Collapsed state - show icons vertically */}
      {isCollapsed && (
        <div className="p-2 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          {hiddenLists.map(list => (
            <Tooltip key={list.id} delayDuration={800}>
              <TooltipTrigger asChild>
                <div
                  className={`h-3 w-3 rounded-full cursor-pointer ${list.color}`}
                  onClick={() => setIsCollapsed(false)}
                />
              </TooltipTrigger>
              <TooltipContent side="left" className="border rounded-sm">
                <div className="text-sm">
                  <div className="font-medium">{list.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {list.cards?.length || 0} cards
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
};

export default HiddenColumnsArea;
