-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK', 'ORDER_CODE', 'FIND_BUG', 'OUTPUT_PREDICTION');

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "type" "ChallengeType" NOT NULL,
    "question" TEXT NOT NULL,
    "description" TEXT,
    "codeSnippet" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "xpReward" INTEGER NOT NULL DEFAULT 5,
    "coinReward" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "correctAnswer" JSONB NOT NULL,
    "explanation" TEXT,
    "lessonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "challengeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChallengeAttempt" (
    "id" TEXT NOT NULL,
    "submittedAnswer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "earnedXp" INTEGER NOT NULL DEFAULT 0,
    "earnedCoins" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserChallengeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Challenge_lessonId_idx" ON "Challenge"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_lessonId_order_key" ON "Challenge"("lessonId", "order");

-- CreateIndex
CREATE INDEX "ChallengeOption_challengeId_idx" ON "ChallengeOption"("challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeOption_challengeId_order_key" ON "ChallengeOption"("challengeId", "order");

-- CreateIndex
CREATE INDEX "UserChallengeAttempt_userId_idx" ON "UserChallengeAttempt"("userId");

-- CreateIndex
CREATE INDEX "UserChallengeAttempt_challengeId_idx" ON "UserChallengeAttempt"("challengeId");

-- CreateIndex
CREATE INDEX "UserChallengeAttempt_userId_challengeId_idx" ON "UserChallengeAttempt"("userId", "challengeId");

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeOption" ADD CONSTRAINT "ChallengeOption_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallengeAttempt" ADD CONSTRAINT "UserChallengeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallengeAttempt" ADD CONSTRAINT "UserChallengeAttempt_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
