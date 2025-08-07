"use client";

import { useBoardLoading } from "@/contexts/BoardLoadingContext";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function FullscreenLoader() {
  const { state } = useBoardLoading();
  const [mounted, setMounted] = useState(false);

  // handle mounting on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // (SSR) or not loading
  if (!mounted || !state.isLoading) {
    return null;
  }

  const loaderContent = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-200 ease-in-out"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-text"
      aria-describedby="loading-description"
    >
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
        </div>
        <div id="loading-text" className="text-white text-lg font-medium">
          Loading {state.loadingBoardName}...
        </div>
        <div id="loading-description" className="sr-only">
          Please wait while we load the board {state.loadingBoardName}
        </div>
      </div>
    </div>
  );

  return createPortal(loaderContent, document.body);
}
