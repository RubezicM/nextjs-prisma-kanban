import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getBoardBySlug } from "@/lib/actions/board-actions";
import { BoardProvider } from "@/contexts/BoardProvider";
import Board from "@/components/board/board";

interface BoardPageProps {
    params: Promise<{
        slug: string
    }>
}


const BoardPage = async ({params}: BoardPageProps) => {
    const {slug} = await params

    const session = await auth()

    if (!session?.user?.id) {
        redirect('/auth/sign-in')
    }

    const board = await getBoardBySlug(session.user.id, slug)
    if (!board) {
        notFound()
    }


    return (
        <BoardProvider initialData={board}
                       userId={session.user.id}>
            <Board/>
        </BoardProvider>
    );
};

export default BoardPage;
