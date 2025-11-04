# Chat App

A modern chat application built with Next.js, shadcn/ui, and PostgreSQL.

## Tech Stack

- **Frontend**: Next.js, React, shadcn/ui, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **File Upload**: Vercel Blob
- **Auth**: Better Auth
- **Monorepo**: Turborepo with pnpm workspaces

## Quickstart

```bash
# 1) Install deps
pnpm install

# 2) Start Postgres in Docker (one-time)
docker run --name chat-postgres -e POSTGRES_PASSWORD=mysecretpassword \
  -p 5432:5432 -d postgres:latest

# 3) Create env files
cp .env.example .env
cp packages/database/.env.example packages/database/.env

# 4) Set the database connection in BOTH env files
DB_URL='postgresql://postgres:mysecretpassword@localhost:5432/postgres'
printf "\nDATABASE_URL=${DB_URL}\n" | tee -a .env > /dev/null
printf "\nDATABASE_URL=${DB_URL}\n" | tee -a packages/database/.env > /dev/null

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

Connection URL to use in both env files:

```bash
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/postgres
```

### Prisma

```bash
pnpm db:generate
pnpm db:migrate
```

Re-run after schema changes.

### Env files

- Root: `.env.example` → copy to `.env`
- Database: `packages/database/.env.example` → copy to `packages/database/.env`
- Keep `DATABASE_URL` the same in both for local development.
