-- CreateTable
CREATE TABLE IF NOT EXISTS "haravan"."users" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT,
    "email" VARCHAR,
    "first_name" VARCHAR,
    "last_name" VARCHAR,
    "phone" VARCHAR,
    "account_owner" BOOLEAN,
    "bio" TEXT,
    "im" TEXT,
    "receive_announcements" INTEGER,
    "url" TEXT,
    "user_type" VARCHAR,
    "permissions" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_users_id" ON "haravan"."users"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_users_uuid" ON "haravan"."users"("uuid");
