import BoardCreationForm from "@/app/(root)/join/BoardCreationForm";
import { auth } from "@/auth";

import { redirect } from "next/navigation";

const JoinPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  return <BoardCreationForm />;
};

export default JoinPage;
