// types/database.ts
export type CardPriority = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export interface Board {
  id: string;
  title: string;
  slug: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: string;
  title: string;
  order: number;
  type: string;
  collapsed: boolean;
  cards: Array<{
    id: string;
    title: string;
    content: string | null;
    listId: string;
    order: number;
    priority: CardPriority;
    createdAt: Date;
    updatedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  color?: string | undefined;
}

export interface Card {
  id: string;
  title: string;
  content: string | null;
  listId: string;
  order: number;
  priority: CardPriority;
  createdAt: Date;
  updatedAt: Date;
}

export type BoardWithData = {
  id: string;
  title: string;
  slug: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lists: Array<{
    id: string;
    title: string;
    type: string;
    order: number;
    collapsed: boolean;
    createdAt: Date;
    updatedAt: Date;
    cards: Array<{
      id: string;
      title: string;
      content: string | null;
      listId: string;
      order: number;
      priority: CardPriority;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }>;
};
