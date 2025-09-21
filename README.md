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

1. **Set up environment variables:**
```bash
# Copy the example environment file to root directory
cp env.example .env

# Edit .env with your actual values
nano .env
```

2. **Install dependencies and start development:**
```bash
pnpm install
pnpm dev
```

## Database

```bash
pnpm db:generate
pnpm db:migrate
```
