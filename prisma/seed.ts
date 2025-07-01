// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleData = {
  userId: "23563ffd-7834-49c0-8bfd-8b75c6e75d15", // Your user ID
  boards: [
    {
      title: "My First Board",
      slug: "my-first-board",
      lists: [
        {
          title: "To Do",
          order: 1.0,
          cards: [
            { title: "Welcome to your board!", order: 1.0 },
            { title: "Create your first task", order: 2.0 },
            { title: "Drag cards between lists", order: 3.0 },
          ]
        },
        {
          title: "In Progress",
          order: 2.0,
          cards: [
            { title: "Learn Kanban workflow", order: 1.0 },
            { title: "Set up your workspace", order: 2.0 },
          ]
        },
        {
          title: "Done",
          order: 3.0,
          cards: [
            { title: "Sign up and log in", order: 1.0 },
          ]
        }
      ]
    },
    {
      title: "Personal Tasks",
      slug: "personal-tasks",
      lists: [
        {
          title: "Today",
          order: 1.0,
          cards: [
            { title: "Morning workout", order: 1.0 },
            { title: "Check emails", order: 2.0 },
          ]
        },
        {
          title: "This Week",
          order: 2.0,
          cards: [
            { title: "Grocery shopping", order: 1.0 },
            { title: "Plan weekend trip", order: 2.0 },
          ]
        },
        {
          title: "Completed",
          order: 3.0,
          cards: []
        }
      ]
    }
  ]
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data (optional - for testing)
  console.log('🧹 Cleaning existing data...')
  await prisma.card.deleteMany()
  await prisma.list.deleteMany()
  await prisma.board.deleteMany()

  // Create boards with nested lists and cards
  for (const boardData of sampleData.boards) {
    console.log(`📋 Creating board: ${boardData.title}`)

    const board = await prisma.board.create({
      data: {
        id: boardData.id,
        title: boardData.title,
        slug: boardData.slug,
        userId: sampleData.userId,
      }
    })

    // Create lists for this board
    for (const listData of boardData.lists) {
      console.log(`📝 Creating list: ${listData.title}`)

      const list = await prisma.list.create({
        data: {
          id: listData.id,
          title: listData.title,
          order: listData.order,
          boardId: board.id,
        }
      })

      // Create cards for this list
      for (const cardData of listData.cards) {
        await prisma.card.create({
          data: {
            title: cardData.title,
            order: cardData.order,
            listId: list.id,
          }
        })
      }

      console.log(`  ✅ Created ${listData.cards.length} cards`)
    }
  }

  console.log('🎉 Seeding completed successfully!')
  console.log(`📊 Created: ${sampleData.boards.length} boards, ${sampleData.boards.reduce((acc, b) => acc + b.lists.length, 0)} lists, ${sampleData.boards.reduce((acc, b) => acc + b.lists.reduce((acc2, l) => acc2 + l.cards.length, 0), 0)} cards`)
}

main()
    .catch((e) => {
      console.error('❌ Seed failed:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
