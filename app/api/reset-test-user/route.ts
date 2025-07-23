import prisma from "@/db/prisma";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Security: Only allow requests from Vercel Cron or with secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🧹 Starting weekly test user data reset...");

    // Find test user
    const testUser = await prisma.user.findUnique({
      where: { email: "test@test.com" },
      include: { boards: true },
    });

    if (!testUser) {
      console.log("⚠️  Test user not found");
      return NextResponse.json({ message: "Test user not found" }, { status: 404 });
    }

    // Delete all test user's data
    console.log(`🗑️  Deleting data for user: ${testUser.email}`);

    // Delete boards (cascade will handle lists and cards)
    const deletedBoards = await prisma.board.deleteMany({
      where: { userId: testUser.id },
    });

    console.log(`✅ Reset complete! Deleted ${deletedBoards.count} boards`);
    console.log(`📅 Next reset: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Reset test user data - deleted ${deletedBoards.count} boards`,
      nextReset: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("❌ Error resetting test user data:", error);
    return NextResponse.json({ error: "Failed to reset test user data" }, { status: 500 });
  }
}
