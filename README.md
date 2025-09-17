# Chat App

A modern chat application built with Next.js, shadcn/ui, and PostgreSQL.

## Tech Stack

- **Frontend**: Next.js, React, shadcn/ui, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **File Upload**: Vercel Blob
- **Auth**: Better Auth
- **Monorepo**: Turborepo with pnpm workspaces

## Development
```bash
cd apps/web
cp .env.example .env
```

```bash
cd packages/database
cp .env.example .env
```

```bash
pnpm install
pnpm dev
```

## Database

```bash
pnpm db:generate
pnpm db:migrate
```
