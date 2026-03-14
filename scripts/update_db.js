const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/"/g, '');
        if (key && !process.env[key]) {
            process.env[key] = value;
        }
    }
  });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {


  console.log("Starting DB update...");
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "address" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "phone" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "email" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "instagram" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "opening_hours" JSONB;`);
    console.log("Successfully added columns to companies table.");
  } catch (e) {
    console.error("Error updating DB:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();