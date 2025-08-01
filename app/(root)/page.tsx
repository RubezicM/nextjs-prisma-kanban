import { auth } from "@/auth";

import { redirect } from "next/navigation";

import { getUserBoards } from "@/lib/actions/board-actions";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex flex-col justify-center space-y-4">
        <h3>Please sign in to use this app.</h3>
      </div>
    );
  }
  const userBoards = await getUserBoards(session.user.id);

  if (userBoards.length === 0) {
    redirect("/join?new-user=true");
  } else {
    redirect(`/board/${userBoards[0].slug}`);
  }
}
