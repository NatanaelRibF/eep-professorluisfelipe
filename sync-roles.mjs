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
    'manage_passes',
    'manage_busca_ativa',
    'manage_calendar',
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

  await prisma.operatorRole.upsert({
    where: { name: 'Professor' },
    update: {
      permissions: [
        'manage_attendance',
        'manage_rac',
        'manage_occurrences',
        'manage_equipment',
        'view_equipment',
        'manage_pdt',
        'manage_internships',
        'manage_busca_ativa',
        'manage_passes',
        'manage_calendar',
      ],
    },
    create: {
      name: 'Professor',
      permissions: [
        'manage_attendance',
        'manage_rac',
        'manage_occurrences',
        'manage_equipment',
        'view_equipment',
        'manage_pdt',
        'manage_internships',
        'manage_busca_ativa',
        'manage_passes',
        'manage_calendar',
      ],
      description: 'Corpo Docente',
    },
  });

  await prisma.operatorRole.upsert({
    where: { name: 'Outros' },
    update: {
      permissions: [
        'manage_attendance',
        'manage_occurrences',
        'manage_equipment',
        'view_equipment',
        'manage_passes',
      ],
    },
    create: {
      name: 'Outros',
      permissions: [
        'manage_attendance',
        'manage_occurrences',
        'manage_equipment',
        'view_equipment',
        'manage_passes',
      ],
      description: 'Funcionários de Apoio / Inspetores',
    },
  });

  console.log('✅ Roles updated in PostgreSQL!');
}

syncRoles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
