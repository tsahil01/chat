/*
  Warnings:

  - You are about to drop the `Message_v2` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vote_v2` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Message_v2" DROP CONSTRAINT "Message_v2_chatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vote_v2" DROP CONSTRAINT "Vote_v2_chatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vote_v2" DROP CONSTRAINT "Vote_v2_messageId_fkey";

-- DropTable
DROP TABLE "public"."Message_v2";

-- DropTable
DROP TABLE "public"."Vote_v2";

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" UUID NOT NULL,
    "chatId" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "parts" JSONB NOT NULL,
    "attachments" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
