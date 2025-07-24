import BoardCreationForm from "@/app/(root)/join/BoardCreationForm";
import { auth } from "@/auth";

import { redirect } from "next/navigation";

import { getUserBoards } from "@/lib/actions/board-actions";

const JoinPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }
  const userBoards = await getUserBoards(session.user.id);
  const isNewUser = userBoards.length === 0;

  return <BoardCreationForm isNewUser={isNewUser} />;
};

export default JoinPage;
