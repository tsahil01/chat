# Project Overview

## 🎯 What is this project?

This is a **modern AI-powered chat application** built as a full-stack SaaS product. It allows users to have intelligent conversations with multiple AI models, integrate with their Google and GitHub accounts, and leverage various tools like web search, calendar management, email, and repository operations - all within natural language conversations.

Think of it as an advanced AI assistant that can not only chat but also take actions on your behalf across different platforms.

## 🏗️ Architecture

### Monorepo Structure

This project uses a **pnpm workspace + Turborepo** monorepo architecture with the following structure:

```
chat-app/
├── apps/
│   └── web/              # Main Next.js application
├── packages/
│   ├── database/         # Prisma schema and database client (@workspace/db)
│   ├── ui/              # Shared UI components (@workspace/ui)
│   ├── config/          # Shared configuration (@workspace/config)
│   ├── eslint-config/   # Shared ESLint rules
│   └── typescript-config/ # Shared TypeScript configuration
└── scripts/             # Utility scripts
```

### Technology Stack

#### Frontend
- **Next.js 15** (App Router) - React framework with server and client components
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety throughout the application
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible UI components (shared via @workspace/ui)
- **next-themes** - Dark/light mode support

#### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Vercel AI SDK** - Streaming AI responses and tool calling
- **OpenRouter & Moonshot** - Multiple AI model providers
- **Better Auth** - Authentication with GitHub/Google OAuth
- **Dodo Payments** - Subscription billing and payment processing

#### Database
- **PostgreSQL** - Primary database
- **Prisma 7** - Type-safe ORM with migrations
- **Prisma Accelerate** - Connection pooling and caching

#### Storage & Integrations
- **Vercel Blob** - File upload and storage
- **Google APIs** - Calendar and Email integration
- **GitHub API** - Repository, issues, and PR management
- **Web Search APIs** - Parallel Web and Exa search

## 🎨 Key Features

### 1. **Multi-Model AI Chat**
- Support for multiple AI models (GPT-OSS, Grok, Kimi, Gemini, etc.)
- Streaming responses with real-time updates
- Model selection with different capabilities (thinking models, file support, tool support)
- Free and Pro models with subscription-based access

### 2. **Personality System**
- Users can select different AI personalities for conversations
- Customizable conversation style and tone

### 3. **Web Search Integration**
- Toggle web search on/off during conversations
- AI can search the web and cite sources
- Uses Parallel Web and Exa search APIs

### 4. **File Attachments**
- Upload files to conversations
- File processing and analysis by AI
- Stored in Vercel Blob storage

### 5. **Google Integration**
- **Calendar**: Create, delete, list events, check availability
- **Email**: List, read, search, and send emails (commented out but available)
- OAuth flow for secure authentication

### 6. **GitHub Integration**
- **Repositories**: List, create, get info
- **Issues**: List, create, view issues
- **Pull Requests**: List, create, view PRs, view code diffs
- **Users**: View user info and followers
- OAuth flow for secure authentication

### 7. **AI Tools & Function Calling**
The AI can dynamically call tools based on user integrations:
- Web search when web search is enabled
- Calendar operations when Google is connected
- Email operations when Google is connected
- GitHub operations when GitHub is connected

### 8. **Chat Management**
- Persistent chat history with PostgreSQL
- Search through conversations
- Pagination for message history
- Public sharing of conversations
- Archive chats

### 9. **Subscription & Usage Limits**
- Free tier with message limits
- Pro plan with unlimited messages and advanced features
- Usage tracking per user per month
- Upgrade prompts when limits are reached
- Integration with Dodo Payments for billing

### 10. **Prompt Helpers**
- **Autocomplete**: AI suggests completions while typing
- **Refine**: Improve and refine prompts before sending

## 📊 Database Schema

### Core Models

#### User
- Stores user information (id, name, email, image)
- Links to sessions, accounts, chats, documents, usage, and integrations

#### Session
- User sessions with expiration
- Tracks IP address and user agent

#### Account
- OAuth accounts (GitHub, Google)
- Stores access tokens and refresh tokens

#### Integration
- User's connected services (Google, GitHub)
- Stores OAuth tokens and email associations

#### Chat
- Individual conversations
- Supports public/private/archive visibility
- Stores personality and last context

#### Message
- Individual messages in a chat
- Role-based (user, assistant, system)
- JSON storage for parts and attachments

#### UserUsage
- Tracks monthly message usage per user
- Used for enforcing subscription limits

#### Document & Suggestion
- Stores documents/artifacts
- AI suggestions for document improvements

## 🔐 Authentication & Authorization

### Better Auth
- GitHub OAuth provider
- Google OAuth provider
- Session-based authentication
- Automatic token refresh

### Integration OAuth
- Separate OAuth flows for Google and GitHub integrations
- Scopes for calendar, email, and repository access
- Token management with expiration handling

## 💰 Monetization

### Subscription Plans
- **Free**: Limited messages per month, basic models
- **Pro ($9.99/month)**: 
  - Unlimited messages
  - Advanced AI models (Kimi K2, thinking models)
  - Priority support
  - File uploads
  - Custom integrations
  - Export conversations

### Payment Processing
- Dodo Payments integration
- Webhook handling for subscription events
- Usage metering and quota enforcement

## 🛠️ Development Workflow

### Getting Started

```bash
# Install dependencies
pnpm install

# Start PostgreSQL with Docker
docker run --name chat-postgres -e POSTGRES_PASSWORD=mysecretpassword \
  -p 5432:5432 -d postgres:latest

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate

# Start development server
pnpm dev
```

### Available Scripts

```bash
pnpm dev          # Start development server (Turbopack)
pnpm build        # Build for production
pnpm lint         # Lint code
pnpm format       # Format code with Prettier
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Prisma Studio
```

### Environment Variables

Required environment variables (see `.env.example`):

**Database:**
- `DATABASE_URL` - PostgreSQL connection string

**Authentication:**
- `BETTER_AUTH_SECRET` - Secret for Better Auth
- `BETTER_AUTH_URL` - Base URL of the app
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`

**AI Providers:**
- `OPENROUTER_API_KEY` - OpenRouter API key
- `MOONSHOT_API_KEY` - Moonshot API key
- `GEMINI_API_KEY` - Gemini API key (optional)

**Search:**
- `EXA_API_KEY` - Exa search API key
- `FIRECRAWL_API_KEY` - Firecrawl API key
- `PARALLEL_API_KEY` - Parallel Web search API key

**Payments:**
- `DODO_PAYMENTS_API_KEY` - Dodo Payments API key
- `DODO_PAYMENTS_WEBHOOK_SECRET` - Webhook secret
- `DODO_PAYMENTS_PRO_PLAN_ID` - Pro plan ID

**Storage:**
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token

**Integrations:**
- `NEXT_PUBLIC_INTEGRATION_GOOGLE_CLIENT_ID`
- `INTEGRATION_GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_INTEGRATION_GITHUB_CLIENT_ID`
- `INTEGRATION_GITHUB_CLIENT_SECRET`

## 📁 Key Directories

### `/apps/web/app`
Next.js 15 App Router pages and API routes:
- `/` - Home page with chat input
- `/chat/[id]` - Individual chat conversation
- `/chats` - Chat history list
- `/integrations` - Integration management
- `/api/chat` - Chat streaming and actions
- `/api/auth` - Better Auth endpoints
- `/api/integrations` - Google/GitHub OAuth flows
- `/api/upload` - File upload handling
- `/api/usage` - Usage tracking

### `/apps/web/components`
React components:
- `chat/` - Chat UI components (input, messages, etc.)
- `header/` - Navigation and header components
- `integrations/` - Integration cards and UI
- `message-parts/` - Message rendering (text, code, images)
- `user-menu/` - User menu and settings
- `widgets/` - Utility widgets

### `/apps/web/lib`
Core application logic:
- `auth.ts` & `auth-client.ts` - Better Auth configuration
- `models.ts` - AI model definitions
- `plans.ts` - Subscription plan definitions
- `tools/` - AI tool implementations (Google, GitHub, search)
- `providers/` - AI provider configurations
- `prompts/` - System prompts for AI
- `usage/` - Usage tracking utilities
- `payments/` - Payment integration utilities

### `/packages/database`
Prisma setup:
- `prisma/schema.prisma` - Database schema
- `generated/prisma/` - Generated Prisma client
- `src/index.ts` - Exported database client

### `/packages/ui`
Shared UI components based on shadcn/ui:
- `components/` - Reusable UI components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions
- `styles/` - Global CSS

## 🚀 How It Works

### Chat Flow

1. **User starts a chat** on the home page
2. **Message is sent** to `/api/chat` route
3. **Server creates or loads chat** from database
4. **AI model is selected** based on user preference
5. **Tools are assembled** based on user's integrations
6. **AI processes the message** with streaming response
7. **Tool calls are executed** if AI decides to use them
8. **Response is streamed** back to the client
9. **Messages are persisted** to the database
10. **Usage is tracked** for quota enforcement

### Integration Flow

1. **User clicks "Connect Google/GitHub"**
2. **OAuth flow initiates** via `/api/integration-auth`
3. **User authorizes** on Google/GitHub
4. **Tokens are stored** in Integration table
5. **Tools become available** in future chats
6. **AI can call tools** with user's credentials

### Subscription Flow

1. **User hits message limit** (free tier)
2. **Upgrade dialog appears**
3. **User selects Pro plan**
4. **Redirected to Dodo Payments** checkout
5. **Webhook receives payment confirmation**
6. **User's subscription is activated**
7. **Usage limits are lifted**

## 🎯 User Experience

### For Free Users
- Limited messages per month
- Access to basic AI models (GPT-OSS, Grok, Gemini)
- Web search capability
- Basic chat history
- Can try integrations with limits

### For Pro Users
- Unlimited messages
- Access to all AI models including thinking models (Kimi K2)
- Full integration capabilities
- Priority support
- File upload support
- Public sharing of chats
- Export functionality

## 🔧 Technical Highlights

### Performance
- **Turbopack** for fast development builds
- **React Server Components** for reduced client bundle
- **Streaming responses** for faster perceived performance
- **Prisma Accelerate** for database connection pooling

### Type Safety
- Full TypeScript coverage
- Prisma-generated types
- Zod for runtime validation
- AI SDK types for model interactions

### Code Quality
- ESLint for linting
- Prettier for formatting
- Shared configurations across workspace
- Pre-submission checks

### Scalability
- Serverless API routes
- Stateless authentication with tokens
- Database-backed chat history
- Connection pooling with Accelerate

## 📝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines, code style, and pull request process.

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth](https://www.better-auth.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Turborepo](https://turbo.build/repo/docs)

## 🚢 Deployment

The application is designed to be deployed on Vercel:

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy with automatic build optimization
4. Database runs on managed PostgreSQL (e.g., Neon, Supabase)

## 📞 Support

For issues, questions, or contributions, please refer to the repository's issue tracker and contribution guidelines.
