// app/api/validate-slug/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import prisma from "@/db/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");

  if (!slug) {
    return Response.json({ available: false, error: "Slug required" });
  }

  const exists = await prisma.board.findFirst({
    where: { userId: session.user.id, slug },
  });

  return Response.json({ available: !exists });
}
