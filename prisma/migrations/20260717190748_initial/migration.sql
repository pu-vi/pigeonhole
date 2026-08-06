-- CreateEnum
CREATE TYPE "subject" AS ENUM ('english', 'mathematics', 'science', 'social_studies', 'history', 'geography', 'civics', 'economics', 'computer_science', 'general_knowledge', 'current_affairs', 'reasoning', 'aptitude', 'environment', 'arts', 'music', 'sports');

-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('text', 'image', 'audio');

-- CreateEnum
CREATE TYPE "difficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subject" "subject" NOT NULL,
    "type" "question_type" NOT NULL,
    "difficulty" "difficulty" NOT NULL DEFAULT 'medium',
    "question_text" TEXT NOT NULL,
    "media_url" TEXT,
    "options" JSONB NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "explanation" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_tags" (
    "question_id" UUID NOT NULL,
    "tag" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_tags_pkey" PRIMARY KEY ("question_id","tag")
);

-- CreateTable
CREATE TABLE "request_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "method" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_tags_tag_idx" ON "question_tags"("tag");

-- CreateIndex
CREATE INDEX "question_tags_question_id_idx" ON "question_tags"("question_id");

-- AddForeignKey
ALTER TABLE "question_tags" ADD CONSTRAINT "question_tags_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
