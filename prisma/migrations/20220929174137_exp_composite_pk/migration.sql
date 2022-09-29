/*
  Warnings:

  - The primary key for the `exp` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "exp" DROP CONSTRAINT "exp_pkey",
ADD CONSTRAINT "exp_pkey" PRIMARY KEY ("user_id", "guild_id");
