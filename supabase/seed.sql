-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profilepic" TEXT,
    "pruneAt" TIMESTAMP(3),
    "passwordHash" BYTEA NOT NULL,
    "passwordSalt" BYTEA NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthNewPasskeyRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" BIGINT NOT NULL,
    "sendingIP" TEXT NOT NULL,
    "pruneAt" TIMESTAMP(3) NOT NULL,
    "identifier" TEXT NOT NULL,
    "challenge" TEXT,
    "authorizedByPasskeyId" TEXT,

    CONSTRAINT "AuthNewPasskeyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pruneAt" TIMESTAMP(3) NOT NULL,
    "finalExpiration" TIMESTAMP(3) NOT NULL,
    "userId" BIGINT NOT NULL,
    "challenge" TEXT NOT NULL,
    "signedWithKeyId" TEXT,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthPasskey" (
    "backendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" BIGINT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientTransports" TEXT[],
    "sessionCounter" INTEGER,
    "publicKey" BYTEA NOT NULL,
    "authorizedByKeyId" TEXT,

    CONSTRAINT "AuthPasskey_pkey" PRIMARY KEY ("backendId")
);

-- CreateTable
CREATE TABLE "Household" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalHousehold" (
    "id" TEXT NOT NULL,
    "server" TEXT NOT NULL,

    CONSTRAINT "ExternalHousehold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_HouseholdToUser" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "_ExternalHouseholdToUser" (
    "A" TEXT NOT NULL,
    "B" BIGINT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "AuthPasskey_clientId_userId_idx" ON "AuthPasskey"("clientId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthPasskey_clientId_userId_key" ON "AuthPasskey"("clientId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_HouseholdToUser_AB_unique" ON "_HouseholdToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_HouseholdToUser_B_index" ON "_HouseholdToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ExternalHouseholdToUser_AB_unique" ON "_ExternalHouseholdToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ExternalHouseholdToUser_B_index" ON "_ExternalHouseholdToUser"("B");

-- AddForeignKey
ALTER TABLE "AuthNewPasskeyRequest" ADD CONSTRAINT "AuthNewPasskeyRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthNewPasskeyRequest" ADD CONSTRAINT "AuthNewPasskeyRequest_authorizedByPasskeyId_fkey" FOREIGN KEY ("authorizedByPasskeyId") REFERENCES "AuthPasskey"("backendId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_signedWithKeyId_fkey" FOREIGN KEY ("signedWithKeyId") REFERENCES "AuthPasskey"("backendId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthPasskey" ADD CONSTRAINT "AuthPasskey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthPasskey" ADD CONSTRAINT "AuthPasskey_authorizedByKeyId_fkey" FOREIGN KEY ("authorizedByKeyId") REFERENCES "AuthPasskey"("backendId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HouseholdToUser" ADD CONSTRAINT "_HouseholdToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HouseholdToUser" ADD CONSTRAINT "_HouseholdToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExternalHouseholdToUser" ADD CONSTRAINT "_ExternalHouseholdToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ExternalHousehold"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExternalHouseholdToUser" ADD CONSTRAINT "_ExternalHouseholdToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;




CREATE UNIQUE INDEX "User_username_insensitive_idx" ON "User" (lower("username"));


-- Copied from the Supabase docs:
-- https://supabase.com/docs/guides/database/extensions/pg_cron?queryGroups=database-method&database-method=sql
create extension pg_cron with schema extensions;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;



-- This is the least cumbersome and least error-prone way to disable full DB access by anyone
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;
