import { auth } from "@/auth";

import { notFound, redirect } from "next/navigation";

import { getBoardBySlug } from "@/lib/actions/board-actions";

import CardDetail from "@/components/card/card-detail";

interface CardPageProps {
  params: Promise<{
    slug: string;
    cardId: string;
  }>;
}

const CardPage = async ({ params }: CardPageProps) => {
  const { slug, cardId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const board = await getBoardBySlug(session.user.id, slug);

  if (!board) {
    notFound();
  }

  // Check if card exists in board data
  let cardExists = false;
  for (const list of board.lists) {
    if (list.cards.some(card => card.id === cardId)) {
      cardExists = true;
      break;
    }
  }

  if (!cardExists) {
    notFound();
  }

  return <CardDetail cardId={cardId} />;
};

export default CardPage;
