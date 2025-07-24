import { CardPriority } from "@/types/database";
import {
  SignalHigh,
  SignalLow,
  SignalMedium,
  MoreHorizontal,
  AlertOctagonIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface PriorityIconProps {
  priority: CardPriority;
  className?: string;
}

export function PriorityIcon({ priority, className }: PriorityIconProps) {
  const defaultClassName = "h-6 w-6";

  if (priority === "NONE") {
    return <MoreHorizontal className={cn(defaultClassName, "text-muted-foreground", className)} />;
  }

  if (priority === "URGENT") {
    return <AlertOctagonIcon className={cn(defaultClassName, "text-red-500", className)} />;
  }

  const IconComponent = {
    LOW: SignalLow,
    MEDIUM: SignalMedium,
    HIGH: SignalHigh,
  }[priority];

  if (IconComponent) {
    return <IconComponent className={cn(defaultClassName, "text-foreground", className)} />;
  }

  return null;
}

export function getPriorityLabel(priority: CardPriority): string {
  const labels = {
    NONE: "No priority",
    LOW: "Low priority",
    MEDIUM: "Medium priority",
    HIGH: "High priority",
    URGENT: "Urgent",
  };
  return labels[priority];
}
