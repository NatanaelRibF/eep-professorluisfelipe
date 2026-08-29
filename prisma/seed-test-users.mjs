import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('Creating/verifying test users for each role...');

  const roles = await prisma.operatorRole.findMany();
  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));

  // 1. Diretor
  const passAdmin = await bcrypt.hash('admin123', 10);
  await prisma.operator.upsert({
    where: { email: 'admin@eep.com' },
    update: { nickname: 'Dir. Roberto', passwordHash: passAdmin, roleId: roleMap['Diretor'] },
    create: {
      name: 'Roberto Silveira',
      nickname: 'Dir. Roberto',
      email: 'admin@eep.com',
      passwordHash: passAdmin,
      roleId: roleMap['Diretor'],
      isActive: true,
    },
  });

  // 2. Professor
  const passProf = await bcrypt.hash('prof123', 10);
  const prof = await prisma.operator.upsert({
    where: { email: 'professor@eep.com' },
    update: { nickname: 'Prof. Carlos', passwordHash: passProf, roleId: roleMap['Professor'] },
    create: {
      name: 'Carlos Mendes',
      nickname: 'Prof. Carlos',
      email: 'professor@eep.com',
      passwordHash: passProf,
      roleId: roleMap['Professor'],
      isActive: true,
    },
  });

  // Link subjects to professor
  const mathSubject = await prisma.subject.findFirst({ where: { name: { contains: 'Matemática' } } });
  if (mathSubject) {
    await prisma.teacherSubject.upsert({
      where: {
        operatorId_subjectId: {
          operatorId: prof.id,
          subjectId: mathSubject.id,
        },
      },
      update: {},
      create: {
        operatorId: prof.id,
        subjectId: mathSubject.id,
      },
    });
  }

  // 3. Secretário
  const passSec = await bcrypt.hash('sec123', 10);
  await prisma.operator.upsert({
    where: { email: 'secretario@eep.com' },
    update: { nickname: 'Sec. Ana', passwordHash: passSec, roleId: roleMap['Secretário'] },
    create: {
      name: 'Ana Cláudia Fontes',
      nickname: 'Sec. Ana',
      email: 'secretario@eep.com',
      passwordHash: passSec,
      roleId: roleMap['Secretário'],
      isActive: true,
    },
  });

  // 4. Outros
  const passOutros = await bcrypt.hash('outros123', 10);
  await prisma.operator.upsert({
    where: { email: 'outros@eep.com' },
    update: { nickname: 'Marcos Apoio', passwordHash: passOutros, roleId: roleMap['Outros'] },
    create: {
      name: 'Marcos Vinícius de Apoio',
      nickname: 'Marcos Apoio',
      email: 'outros@eep.com',
      passwordHash: passOutros,
      roleId: roleMap['Outros'],
      isActive: true,
    },
  });

  console.log('✅ Test users verified successfully:');
  console.log(' - Diretor: admin@eep.com / admin123');
  console.log(' - Professor: professor@eep.com / prof123');
  console.log(' - Secretário: secretario@eep.com / sec123');
  console.log(' - Outros: outros@eep.com / outros123');
}

createTestUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
