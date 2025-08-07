"use client";

import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";

import { usePathname } from "next/navigation";

// board loading state shape
interface BoardLoadingState {
  isLoading: boolean; // Is any board currently loading?
  loadingBoardName: string; // Name of the board being loaded (for display)
  loadingBoardSlug: string; // Slug of the board being loaded
  startedAt: number | null; // When loading started (for timeout)
}

// actions that can modify the loading state
type BoardLoadingAction =
  | { type: "START_LOADING"; boardName: string; boardSlug: string }
  | { type: "STOP_LOADING" }
  | { type: "TIMEOUT_LOADING" };

// Init state - no loading by default
const initialState: BoardLoadingState = {
  isLoading: false,
  loadingBoardName: "",
  loadingBoardSlug: "",
  startedAt: null,
};

// reducer to handle state changes predictably
function boardLoadingReducer(
  state: BoardLoadingState,
  action: BoardLoadingAction
): BoardLoadingState {
  switch (action.type) {
    case "START_LOADING":
      return {
        ...state,
        isLoading: true,
        loadingBoardName: action.boardName,
        loadingBoardSlug: action.boardSlug,
        startedAt: Date.now(),
      };

    case "STOP_LOADING":
    case "TIMEOUT_LOADING":
      return {
        ...state,
        isLoading: false,
        loadingBoardName: "",
        loadingBoardSlug: "",
        startedAt: null,
      };

    default:
      return state;
  }
}

interface BoardLoadingContextType {
  state: BoardLoadingState;
  startLoading: (boardName: string, boardSlug: string) => void;
  stopLoading: () => void;
}

const BoardLoadingContext = createContext<BoardLoadingContextType | undefined>(undefined);

export function BoardLoadingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(boardLoadingReducer, initialState);
  const pathname = usePathname();

  // in case navigation fails
  useEffect(() => {
    if (!state.isLoading || !state.startedAt) return;

    const timeoutId = setTimeout(() => {
      console.warn("Board loading timed out after 10 seconds");
      dispatch({ type: "TIMEOUT_LOADING" });
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [state.isLoading, state.startedAt]);

  // stop loading when pathname changes - navigation completed
  useEffect(() => {
    if (state.isLoading) {
      // check if we've navigated to the expected board
      const currentSlug = pathname.split("/")[2];
      if (currentSlug === state.loadingBoardSlug) {
        dispatch({ type: "STOP_LOADING" });
      }
    }
  }, [pathname, state.isLoading, state.loadingBoardSlug]);

  const contextValue: BoardLoadingContextType = {
    state,
    startLoading: (boardName: string, boardSlug: string) => {
      dispatch({ type: "START_LOADING", boardName, boardSlug });
    },
    stopLoading: () => {
      dispatch({ type: "STOP_LOADING" });
    },
  };

  return (
    <BoardLoadingContext.Provider value={contextValue}>{children}</BoardLoadingContext.Provider>
  );
}

// hook to use the context
export function useBoardLoading() {
  const context = useContext(BoardLoadingContext);
  if (context === undefined) {
    throw new Error("useBoardLoading must be used within a BoardLoadingProvider");
  }
  return context;
}
