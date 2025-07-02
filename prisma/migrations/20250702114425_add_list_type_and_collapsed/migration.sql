/*
  Warnings:

  - A unique constraint covering the columns `[boardId,type]` on the table `List` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ListType" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELED');

-- AlterTable
ALTER TABLE "List" ADD COLUMN     "collapsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" VARCHAR(20) NOT NULL DEFAULT 'todo',
ALTER COLUMN "title" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "List_boardId_type_key" ON "List"("boardId", "type");
