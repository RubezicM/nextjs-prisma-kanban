import { auth } from "@/auth";

import { redirect } from "next/navigation";

import { getUserBoards } from "@/lib/actions/board-actions";

import { LandingPage } from "@/components/landing/LandingPage";

export default async function Home() {
  const session = await auth();

  // If user is authenticated, handle redirects as before
  if (session?.user?.id) {
    const userBoards = await getUserBoards(session.user.id);

    if (userBoards.length === 0) {
      redirect("/join?new-user=true");
    } else {
      redirect(`/board/${userBoards[0].slug}`);
    }
  }

  // Show landing page for unauthenticated users
  return <LandingPage />;
}
