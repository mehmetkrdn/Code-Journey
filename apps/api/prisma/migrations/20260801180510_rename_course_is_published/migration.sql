/*
  Warnings:

  - You are about to drop the column `isPubblished` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course"
RENAME COLUMN "isPubblished" TO "isPublished";
