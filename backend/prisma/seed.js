// Optional seed script (not required for migrations-deploy flow)

const { getPrisma } = require('./client');

async function main() {
  const prisma = getPrisma();
  // Intentionally left empty.
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = require('./client').getPrisma?.();
    // If prisma exists, attempt disconnect.
    if (prisma && prisma.$disconnect) await prisma.$disconnect();
  });

