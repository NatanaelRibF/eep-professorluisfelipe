import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function prepareTestUsers() {
  console.log('Setting up standard test users...');
  const passwordHash = await bcrypt.hash('admin123', 10);

  const roles = await prisma.operatorRole.findMany();
  const getRoleId = (name) => roles.find((r) => r.name === name)?.id;

  const users = [
    { email: 'admin@eep.com', name: 'Administrador Master', nickname: 'Dir. Roberto', role: 'Diretor' },
    { email: 'secretario@eep.com', name: 'Ana Cláudia Fontes', nickname: 'Sec. Ana', role: 'Secretário' },
    { email: 'willenapontes01@gmail.com', name: 'Willena Pontes da Silva', nickname: 'Sec. Willena', role: 'Secretário' },
    { email: 'professor@eep.com', name: 'Carlos Mendes', nickname: 'Prof. Carlos', role: 'Professor' },
    { email: 'outros@eep.com', name: 'Marcos Vinícius de Apoio', nickname: 'Marcos Apoio', role: 'Outros' },
  ];

  for (const u of users) {
    const roleId = getRoleId(u.role);
    if (!roleId) continue;

    await prisma.operator.upsert({
      where: { email: u.email },
      update: {
        passwordHash,
        roleId,
        isActive: true,
        nickname: u.nickname,
      },
      create: {
        email: u.email,
        name: u.name,
        nickname: u.nickname,
        passwordHash,
        roleId,
        isActive: true,
      },
    });
    console.log(`  ✅ User ready: ${u.email} (${u.role})`);
  }
}

prepareTestUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
