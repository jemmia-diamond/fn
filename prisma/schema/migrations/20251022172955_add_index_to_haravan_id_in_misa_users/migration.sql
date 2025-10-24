/*
  Warnings:

  - A unique constraint covering the columns `[haravan_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_haravan_id_key" ON "misa"."users"("haravan_id");
