// scripts/seed-test-data.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedTestCards() {
  // Find your user (replace with your actual email)
  const user = await prisma.user.findFirst({
    where: {
      email: "miljanrubezic@gmail.com", // Replace with your login email
    },
  });

  if (!user) {
    console.log("❌ User not found. Please login first or update email.");
    return;
  }

  // Find or create a test board
  let board = await prisma.board.findFirst({
    where: {
      userId: user.id,
      title: "najnoviiji board",
    },
    include: { lists: true },
  });

  if (!board) {
    console.log("📋 Creating test board...");
    board = await prisma.board.create({
      data: {
        title: "Performance Test Board",
        slug: "performance-test",
        userId: user.id,
        lists: {
          create: [
            { title: "Backlog", type: "backlog", order: 1 },
            { title: "Todo", type: "todo", order: 2 },
            { title: "In Progress", type: "in-progress", order: 3 },
            { title: "Done", type: "done", order: 4 },
            { title: "Canceled", type: "canceled", order: 5 },
          ],
        },
      },
      include: { lists: true },
    });
  }

  // Create 50 test cards distributed across lists
  const cardTemplates = [
    "Fix authentication bug in login flow",
    "Implement drag and drop functionality",
    "Add responsive design for mobile devices",
    "Optimize database queries for better performance",
    "Write unit tests for user management",
    "Update documentation for API endpoints",
    "Refactor component architecture",
    "Add error handling for network requests",
    "Implement caching strategy",
    "Design user onboarding flow",
  ];

  const contentTemplates = [
    "<p>This is a test card with <strong>rich content</strong> to simulate real usage.</p>",
    "<p>Card with <em>multiple</em> formatting options and <code>inline code</code>.</p>",
    "<p>Testing performance with longer content that includes:</p><ul><li>Bullet points</li><li>Multiple lines</li><li>Various formatting</li></ul>",
    "<p>Simple card with basic text content.</p>",
    "<p>Card with <strike>strikethrough</strike> and other formatting options.</p>",
  ];

  console.log("🚀 Creating 50 test cards...");

  for (let i = 0; i < 50; i++) {
    const randomList = board.lists[i % board.lists.length];
    const randomTitle = cardTemplates[i % cardTemplates.length];
    const randomContent = contentTemplates[i % contentTemplates.length];

    await prisma.card.create({
      data: {
        title: `${randomTitle} #${i + 1}`,
        content: randomContent,
        listId: randomList.id,
        order: (i + 1) * 1000,
      },
    });

    if ((i + 1) % 10 === 0) {
      console.log(`✅ Created ${i + 1}/50 cards...`);
    }
  }

  console.log(`🎉 Successfully created 50 test cards in board: ${board.slug}`);
  console.log(`🔗 Visit: http://localhost:3000/board/${board.slug}`);
}

seedTestCards()
  .catch(e => {
    console.error("❌ Error seeding data:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
