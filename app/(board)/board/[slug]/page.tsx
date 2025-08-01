import { auth } from "@/auth";

import { getUserBoards } from "@/lib/actions/board-actions";

import Board from "@/components/board/board";
import BoardSwitcher from "@/components/shared/header/board-switcher";
import Menu from "@/components/shared/header/menu";

const BoardPage = async () => {
  const session = await auth();
  const userBoards = session?.user?.id ? await getUserBoards(session.user.id) : [];

  return (
    <div className="flex h-screen flex-col">
      <div className="bg-background border-b">
        <div className="flex items-center justify-between px-6 py-2">
          <BoardSwitcher boards={userBoards} />
          <Menu />
        </div>
      </div>

      <main className="flex-1 overflow-hidden">
        <Board />
      </main>
    </div>
  );
};

export default BoardPage;
