-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_question_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "riskLevel" TEXT,
    "riskScore" INTEGER,
    "dimensionScores" TEXT NOT NULL DEFAULT '{}',
    "signals" TEXT NOT NULL DEFAULT '[]',
    "triggerTags" TEXT NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "question_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_question_options" ("createdAt", "id", "label", "questionId", "riskLevel", "riskScore", "signals", "sortOrder", "triggerTags", "updatedAt") SELECT "createdAt", "id", "label", "questionId", "riskLevel", "riskScore", "signals", "sortOrder", "triggerTags", "updatedAt" FROM "question_options";
DROP TABLE "question_options";
ALTER TABLE "new_question_options" RENAME TO "question_options";
CREATE TABLE "new_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sceneId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'single_choice',
    "questionType" TEXT NOT NULL DEFAULT 'behavioral',
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "isHighWeight" BOOLEAN NOT NULL DEFAULT false,
    "depthLevels" TEXT NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "questions_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "scenes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_questions" ("category", "createdAt", "description", "enabled", "id", "isHighWeight", "sceneId", "sortOrder", "title", "type", "updatedAt", "weight") SELECT "category", "createdAt", "description", "enabled", "id", "isHighWeight", "sceneId", "sortOrder", "title", "type", "updatedAt", "weight" FROM "questions";
DROP TABLE "questions";
ALTER TABLE "new_questions" RENAME TO "questions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
