"use client";

import { CardPriority } from "@/types/database";
import { Check } from "lucide-react";

import React, { memo } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PriorityIcon, getPriorityLabel } from "./priority-icon";

interface PriorityPickerProps {
  priority: CardPriority;
  onPriorityChange: (priority: CardPriority) => void;
  disabled?: boolean;
  variant?: "compact" | "detailed";
}

const PRIORITY_OPTIONS: CardPriority[] = ["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"];

export const PriorityPicker = memo<PriorityPickerProps>(
  ({ priority, onPriorityChange, disabled = false, variant = "compact" }) => {
    const isDetailed = variant === "detailed";
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`${
              isDetailed ? "h-9 w-52 px-3 py-2 justify-start" : "h-8 w-8 p-0"
            } hover:bg-muted border flex items-center ${isDetailed ? "gap-2" : ""}`}
            disabled={disabled}
            aria-label="Change priority"
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <div className={isDetailed ? "scale-125" : ""}>
              <PriorityIcon priority={priority} />
            </div>
            {isDetailed && (
              <span className="text-sm font-medium">{getPriorityLabel(priority)}</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-46 z-50" data-no-drag>
          {PRIORITY_OPTIONS.map(
            (priorityOption): React.ReactElement => (
              <DropdownMenuItem
                key={priorityOption}
                onSelect={() => {
                  onPriorityChange(priorityOption);
                }}
                className="flex items-center flex-row justify-between gap-2 cursor-pointer hover:bg-muted"
              >
                <div className="flex gap-2 items-center">
                  <PriorityIcon priority={priorityOption} />
                  <span className="text-sm">{getPriorityLabel(priorityOption)}</span>
                </div>
                {priority === priorityOption && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

PriorityPicker.displayName = "PriorityPicker";
