-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passwordHash" BYTEA NOT NULL,
    "passwordSalt" BYTEA NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewKeypairRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" BIGINT NOT NULL,
    "sendingIP" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "challenge" BYTEA,
    "signedWithKeyId" TEXT,

    CONSTRAINT "NewKeypairRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" BIGINT NOT NULL,
    "challenge" BYTEA NOT NULL,
    "signedWithKeyId" TEXT,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthPublicKey" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" BIGINT NOT NULL,
    "id" TEXT NOT NULL,
    "clientTransports" TEXT[],
    "sessionCounter" INTEGER,
    "publicKey" BYTEA NOT NULL,
    "authorizedByKeyId" TEXT
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
CREATE UNIQUE INDEX "AuthPublicKey_id_userId_key" ON "AuthPublicKey"("id", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_HouseholdToUser_AB_unique" ON "_HouseholdToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_HouseholdToUser_B_index" ON "_HouseholdToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ExternalHouseholdToUser_AB_unique" ON "_ExternalHouseholdToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ExternalHouseholdToUser_B_index" ON "_ExternalHouseholdToUser"("B");

-- AddForeignKey
ALTER TABLE "NewKeypairRequest" ADD CONSTRAINT "NewKeypairRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewKeypairRequest" ADD CONSTRAINT "NewKeypairRequest_userId_signedWithKeyId_fkey" FOREIGN KEY ("userId", "signedWithKeyId") REFERENCES "AuthPublicKey"("userId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_signedWithKeyId_fkey" FOREIGN KEY ("userId", "signedWithKeyId") REFERENCES "AuthPublicKey"("userId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthPublicKey" ADD CONSTRAINT "AuthPublicKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthPublicKey" ADD CONSTRAINT "AuthPublicKey_userId_authorizedByKeyId_fkey" FOREIGN KEY ("userId", "authorizedByKeyId") REFERENCES "AuthPublicKey"("userId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HouseholdToUser" ADD CONSTRAINT "_HouseholdToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HouseholdToUser" ADD CONSTRAINT "_HouseholdToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExternalHouseholdToUser" ADD CONSTRAINT "_ExternalHouseholdToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ExternalHousehold"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExternalHouseholdToUser" ADD CONSTRAINT "_ExternalHouseholdToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
