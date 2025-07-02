import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserBoards } from "@/lib/actions/board-actions";
import OnboardingWizard from "@/app/(root)/join/OnBoardingWizard";

const JoinPage = async () => {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/auth/sign-in')
    }

    const userBoards = await getUserBoards(session.user.id);

    // Conditional rendering
    if (userBoards.length === 0) {
        return <OnboardingWizard userId={session.user.id} />
    } else {
        redirect(`/board/${userBoards[0].slug}`);
    }
};

export default JoinPage;
