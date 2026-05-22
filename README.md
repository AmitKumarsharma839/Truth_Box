# TruthBox

A compact Reddit-style discussion MVP built for Node `18.20.4`, React 18, Next.js 14, Tailwind CSS 3, NextAuth v4, Prisma, and PostgreSQL 15.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set your PostgreSQL connection:

```bash
cp .env.example .env
```

3. Create the database and run Prisma:

```bash
createdb reddit_clone
npm run prisma:migrate -- --name init
npm run db:seed
```

If your local PostgreSQL user or password is different, update `DATABASE_URL` in `.env` first.

4. Start the app:

```bash
npm run dev
```

Open http://localhost:3000.

For an Express wrapper around Next.js, use:

```bash
npm run dev:express
```

## MVP Features

- Signup, login, logout, and 12-hour session management with NextAuth v4
- Community creation and browsing
- Text, uploaded image, and link posts
- Post detail pages
- Upvote and downvote with instant count updates
- Comment creation and display
- Feed sorting by latest or popularity
- Mobile responsive Tailwind UI with skeleton loading states
