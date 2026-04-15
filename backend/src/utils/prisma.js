const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');


// Explicitly pass the database URL into the v7 Client using accelerateUrl
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL
});


module.exports = prisma;
