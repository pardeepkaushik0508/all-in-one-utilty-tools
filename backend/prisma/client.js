const { PrismaClient } = require('@prisma/client');

// Prevent exhausting DB connections in serverless/hot-reload environments
let prisma;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

module.exports = { getPrisma };

