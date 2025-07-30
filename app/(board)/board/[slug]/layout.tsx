import { auth } from "@/auth";
import { BoardProvider } from "@/contexts/BoardProvider";

import { notFound, redirect } from "next/navigation";

import { getBoardBySlug } from "@/lib/actions/board-actions";

interface BoardSlugLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

const BoardSlugLayout = async ({ children, params }: BoardSlugLayoutProps) => {
  const { slug } = await params;

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const board = await getBoardBySlug(session.user.id, slug);
  if (!board) {
    notFound();
  }

  return (
    <BoardProvider initialData={board} userId={session.user.id}>
      {children}
    </BoardProvider>
  );
};

export default BoardSlugLayout;
