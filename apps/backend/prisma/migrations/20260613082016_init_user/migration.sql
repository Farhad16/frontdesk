-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REQUESTER', 'STAFF');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GOOGLE', 'PASSWORD');

-- CreateEnum
CREATE TYPE "NotificationPref" AS ENUM ('OFF', 'MY_UPDATES', 'NEW_MESSAGES', 'ALL');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('AVAILABLE', 'BUSY', 'AWAY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "photoUrl" TEXT,
    "passwordHash" TEXT,
    "provider" "Provider" NOT NULL DEFAULT 'PASSWORD',
    "providerId" TEXT,
    "role" "Role" NOT NULL DEFAULT 'REQUESTER',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "notificationPref" "NotificationPref" NOT NULL DEFAULT 'ALL',
    "availability" "Availability" NOT NULL DEFAULT 'AVAILABLE',
    "availabilityNote" TEXT,
    "availabilityUntil" TIMESTAMP(3),
    "addOns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
