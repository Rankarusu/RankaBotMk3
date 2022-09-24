-- CreateTable
CREATE TABLE "exp" (
    "user_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "xp" INTEGER,
    "level" INTEGER,
    "xp_lock" TIMESTAMP(6),

    CONSTRAINT "exp_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "reminder" (
    "interaction_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "guild_id" TEXT,
    "channel_id" TEXT,
    "message" TEXT,
    "invoke_time" TIMESTAMP(6) NOT NULL,
    "parsed_time" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "reminder_pkey" PRIMARY KEY ("interaction_id")
);

-- CreateTable
CREATE TABLE "sticker" (
    "interaction_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "guild_id" TEXT,
    "sticker_name" TEXT,
    "sticker_url" TEXT,
    "invoke_time" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "sticker_pkey" PRIMARY KEY ("interaction_id")
);
