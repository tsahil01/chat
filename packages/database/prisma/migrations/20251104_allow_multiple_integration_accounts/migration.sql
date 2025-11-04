-- DropIndex
DROP INDEX "integration_name_userId_key";

-- AlterTable
ALTER TABLE "integration" DROP CONSTRAINT "integration_userId_fkey",
ADD CONSTRAINT "integration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "integration_name_userId_email_key" ON "integration"("name", "userId", "email");
