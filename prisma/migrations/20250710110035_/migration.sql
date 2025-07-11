/*
  Warnings:

  - You are about to drop the column `model` on the `message` table. All the data in the column will be lost.
  - Added the required column `parts` to the `message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "message" DROP COLUMN "model",
ADD COLUMN     "parts" JSONB NOT NULL,
ADD COLUMN     "revisionId" TEXT;
