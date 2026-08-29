import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanBase64Avatars() {
  console.log('Cleaning base64 avatars from operators...');
  const operators = await prisma.operator.findMany();
  for (const op of operators) {
    if (op.avatarUrl && op.avatarUrl.startsWith('data:')) {
      console.log(`Clearing base64 avatar for operator: ${op.name} (${op.email})`);
      await prisma.operator.update({
        where: { id: op.id },
        data: { avatarUrl: null },
      });
    }
  }
  console.log('✅ Cleaned base64 avatars!');
}

cleanBase64Avatars()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
