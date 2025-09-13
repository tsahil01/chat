-- CreateEnum
CREATE TYPE "public"."visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "public"."artifact_kind" AS ENUM ('TEXT', 'CODE', 'IMAGE', 'SHEET');

-- CreateTable
CREATE TABLE "public"."Chat" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visibility" "public"."visibility" NOT NULL DEFAULT 'PRIVATE',
    "lastContext" JSONB,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message_v2" (
    "id" UUID NOT NULL,
    "chatId" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "parts" JSONB NOT NULL,
    "attachments" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vote_v2" (
    "chatId" UUID NOT NULL,
    "messageId" UUID NOT NULL,
    "isUpvoted" BOOLEAN NOT NULL,

    CONSTRAINT "Vote_v2_pkey" PRIMARY KEY ("chatId","messageId")
);

-- CreateTable
CREATE TABLE "public"."Document" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "text" "public"."artifact_kind" NOT NULL DEFAULT 'TEXT',
    "userId" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id","createdAt")
);

-- CreateTable
CREATE TABLE "public"."Suggestion" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "documentCreatedAt" TIMESTAMP(3) NOT NULL,
    "originalText" TEXT NOT NULL,
    "suggestedText" TEXT NOT NULL,
    "description" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stream" (
    "id" UUID NOT NULL,
    "chatId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message_v2" ADD CONSTRAINT "Message_v2_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote_v2" ADD CONSTRAINT "Vote_v2_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote_v2" ADD CONSTRAINT "Vote_v2_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."Message_v2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Suggestion" ADD CONSTRAINT "Suggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Suggestion" ADD CONSTRAINT "Suggestion_documentId_documentCreatedAt_fkey" FOREIGN KEY ("documentId", "documentCreatedAt") REFERENCES "public"."Document"("id", "createdAt") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stream" ADD CONSTRAINT "Stream_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
