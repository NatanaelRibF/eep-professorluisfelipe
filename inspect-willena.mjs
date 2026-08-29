import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectWillena() {
  const op = await prisma.operator.findUnique({
    where: { email: 'willenapontes01@gmail.com' },
    include: { role: true },
  });
  console.log('Willena operator record:', op);
}

inspectWillena()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
