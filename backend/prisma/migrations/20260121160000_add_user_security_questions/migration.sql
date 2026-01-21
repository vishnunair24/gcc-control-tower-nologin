-- Add security question fields to User for password recovery

ALTER TABLE "User" ADD COLUMN "securityQuestion1" TEXT;
ALTER TABLE "User" ADD COLUMN "securityAnswer1Hash" TEXT;
ALTER TABLE "User" ADD COLUMN "securityQuestion2" TEXT;
ALTER TABLE "User" ADD COLUMN "securityAnswer2Hash" TEXT;
ALTER TABLE "User" ADD COLUMN "securityQuestion3" TEXT;
ALTER TABLE "User" ADD COLUMN "securityAnswer3Hash" TEXT;
