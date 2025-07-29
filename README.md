# Next.js Kanban Board

A Kanban board app built with Next.js 15 and React 19.

## 🔐 Test Login

**Email:** `test@test.com`
**Password:** `test123`

> **Live Demo:** [https://tasks.miljanrubezic.com]

## 🚀 Features

- Drag & drop cards between columns
- Login/signup
- Multiple boards per user
- Rich text editor for card descriptions
- Priority levels for cards
- Dark/light mode toggle
- Hide/show columns

## 🛠️ Tech Stack

**Frontend**

- Next.js 15, React 19, TypeScript
- TailwindCSS, Shadcn components
- @dnd-kit for drag & drop
- TipTap rich text editor

**Backend**

- Next.js API routes
- NextAuth.js for login
- Prisma + PostgreSQL
- bcrypt for passwords

**Other Stuff**

- TanStack Query for data fetching
- Vitest + Playwright for testing
- ESLint, Prettier for code quality

## 🏗️ How It Works

Login → Pick a board → Move cards around → Feel accomplished

**Database stuff:**

- Users (login info)
- Boards (each user can have multiple)
- Lists (the columns: Backlog, Todo, In Progress, Done, Canceled)
- Cards (the actual tasks)

## 🚀 Getting Started

**What you need:**

- Node.js 18+, PostgreSQL, pnpm

**Setup:**

```bash
git clone <your-repo-url>
cd nextjs-kanban
pnpm install

# Set up your .env.local with database connection
# Run migrations and seed data
pnpm dlx prisma migrate deploy
pnpm dlx prisma generate
pnpm run seed

# Start it up
pnpm dev
```

Then go to `http://localhost:3000`

## 📦 Scripts

- `pnpm dev` - Run locally
- `pnpm build` - Build for production
- `pnpm test` - Run tests
- `pnpm seed` - Add sample data

## 🚀 Deployment

This project is configured for Vercel deployment:

- Automatic migrations on deploy
- Environment-based database seeding
- Optimized build process

The `vercel-build` script handles:

1. Database migrations
2. Prisma client generation
3. Next.js build
4. Optional database seeding (with `FORCE_SEED=true`)

## 🤝 Contributing

This is a demo project, but feel free to:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📝 License

This project is for testing and educational purposes.
