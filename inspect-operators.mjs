import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectOperators() {
  const operators = await prisma.operator.findMany({
    include: { role: true },
  });
  console.log('=== CURRENT OPERATORS IN DB ===');
  for (const op of operators) {
    console.log({
      id: op.id,
      name: op.name,
      nickname: op.nickname,
      email: op.email,
      role: op.role?.name,
      avatarUrlPreview: op.avatarUrl ? op.avatarUrl.slice(0, 80) : null,
      avatarLength: op.avatarUrl ? op.avatarUrl.length : 0,
      isActive: op.isActive,
    });
  }
}

inspectOperators()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
