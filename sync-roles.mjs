import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncRoles() {
  console.log('Syncing database roles permissions...');
  
  const gestorPermissions = [
    'manage_students',
    'manage_attendance',
    'manage_rac',
    'manage_occurrences',
    'manage_operators',
    'manage_classes',
    'manage_subjects',
    'manage_settings',
    'view_reports',
    'manage_equipment',
    'view_equipment',
    'manage_pdt',
    'manage_internships',
    'view_management',
  ];

  await prisma.operatorRole.upsert({
    where: { name: 'Diretor' },
    update: { permissions: gestorPermissions },
    create: { name: 'Diretor', permissions: gestorPermissions, description: 'Direção Geral' },
  });

  await prisma.operatorRole.upsert({
    where: { name: 'Coordenador' },
    update: { permissions: gestorPermissions },
    create: { name: 'Coordenador', permissions: gestorPermissions, description: 'Coordenação Pedagógica' },
  });

  await prisma.operatorRole.upsert({
    where: { name: 'Secretário' },
    update: { permissions: gestorPermissions },
    create: { name: 'Secretário', permissions: gestorPermissions, description: 'Secretaria Escolar' },
  });

  console.log('✅ Roles updated with manage_operators in PostgreSQL!');
}

syncRoles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
