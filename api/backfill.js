const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({ where: { reference: null } });
  console.log(`Found ${projects.length} projects missing reference.`);
  let nextNum = 2400; // Starting PT number mapping
  
  for (const p of projects) {
    await prisma.project.update({
      where: { id: p.id },
      data: { reference: `PT${nextNum++}` }
    });
    console.log(`Updated ${p.name} -> PT${nextNum - 1}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
