// 1. Force Node to load the .env file BEFORE anything else happens
require('dotenv').config(); 

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// 2. Explicitly pass the database URL into the v7 Client using accelerateUrl
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL
});

async function main() {
  console.log("Seeding database...");
  
  const hashedPassword = await bcrypt.hash('Admin@1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@primetrade.ai' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@primetrade.ai',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });