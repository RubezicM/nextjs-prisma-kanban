import { auth } from "@/auth";
import { getUserBoards } from "@/lib/actions/board-actions";
import { redirect } from "next/navigation";
import OnboardingWizard from "@/app/(root)/dashboard/OnBoardingWizard";

const DashboardPage = async () => {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/auth/sign-in')
    }

    const userBoards = await getUserBoards(session.user.id);

    // Conditional rendering
    if (userBoards.length === 0) {
        return <OnboardingWizard userId={session.user.id} />
    }

    return (
        <div>Welcome back, {session?.user?.name}!</div>
    );
};

export default DashboardPage;
