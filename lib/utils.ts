import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a URL-safe slug from a title string
 * @param title - The input title string
 * @returns A clean, URL-safe slug without leading/trailing dashes
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 40)
    .replace(/-+$/, "");
}

/**
 * Generates board avatar data (initials and color) for visual identification
 * @param boardTitle - The title of the board
 * @param boardIndex - The index/position of the board (0-based)
 * @returns Object with initials and background color class
 */
export function getBoardAvatar(boardTitle: string, boardIndex: number) {
  // Get first 2 letters from title, fallback to "BD" for "Board"
  const initials =
    boardTitle
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 2) || "BD";

  // Static colors for 2-board limit (consistent across users)
  const colors = [
    "bg-green-500", // First board
    "bg-pink-500", // Second board
  ];

  return {
    initials,
    bgColor: colors[boardIndex % colors.length] || "bg-gray-500",
  };
}
