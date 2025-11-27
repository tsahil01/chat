# Chat App

A modern chat application built with Next.js, shadcn/ui, and PostgreSQL.

## Tech Stack

- **Frontend**: Next.js, React, shadcn/ui, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **File Upload**: Vercel Blob
- **Auth**: Better Auth
- **Monorepo**: Turborepo with pnpm workspaces

## Project Structure

- `apps/web` - Next.js application with API routes and frontend
- `packages/ui` - Shared UI components built with shadcn/ui
- `packages/database` - Prisma schema and database client
- `packages/eslint-config` - Shared ESLint configuration
- `packages/typescript-config` - Shared TypeScript configuration

## Quickstart

```bash
# 1) Install deps
pnpm install

# 2) Start Postgres in Docker (one-time)
docker run --name chat-postgres -e POSTGRES_PASSWORD=mysecretpassword \
  -p 5432:5432 -d postgres:latest

# 3) Create env file
cp .env.example .env

# 4) Set the database connection in .env file
DB_URL='postgresql://postgres:mysecretpassword@localhost:5432/postgres'
printf "\nDATABASE_URL=${DB_URL}\n" | tee -a .env > /dev/null

# 5) Generate client and run migrations
pnpm db:generate
pnpm db:migrate

# 6) Start the app
pnpm dev
```

## Details

### Local Postgres with Docker

```bash
docker run --name chat-postgres -e POSTGRES_PASSWORD=mysecretpassword \
  -p 5432:5432 -d postgres:latest
```

Connection URL to use in .env file:

```bash
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/postgres
```

### Prisma

```bash
pnpm db:generate
pnpm db:migrate
```

Re-run after schema changes.

### Env file

- Root: `.env.example` → copy to `.env`
