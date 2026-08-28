import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Roles
  console.log('📝 Creating roles...')
  const diretorRole = await prisma.operatorRole.upsert({
    where: { name: 'Diretor' },
    update: {},
    create: {
      name: 'Diretor',
      description: 'Direção Geral da Escola',
      permissions: [
        'manage_students',
        'manage_attendance',
        'manage_rac',
        'manage_occurrences',
        'manage_operators',
        'manage_classes',
        'manage_subjects',
        'manage_settings',
        'view_reports',
      ],
    },
  })

  await prisma.operatorRole.upsert({
    where: { name: 'Coordenador' },
    update: {},
    create: {
      name: 'Coordenador',
      description: 'Coordenação Pedagógica',
      permissions: [
        'manage_students',
        'manage_attendance',
        'manage_rac',
        'manage_occurrences',
        'manage_classes',
        'manage_subjects',
        'manage_settings',
        'view_reports',
      ],
    },
  })

  await prisma.operatorRole.upsert({
    where: { name: 'Secretário' },
    update: {},
    create: {
      name: 'Secretário',
      description: 'Secretaria Escolar',
      permissions: [
        'manage_students',
        'manage_occurrences',
        'manage_classes',
        'view_reports',
      ],
    },
  })

  await prisma.operatorRole.upsert({
    where: { name: 'Professor' },
    update: {},
    create: {
      name: 'Professor',
      description: 'Corpo Docente',
      permissions: [
        'manage_attendance',
        'manage_rac',
        'manage_occurrences',
      ],
    },
  })

  // 2. Admin Operator
  console.log('👤 Creating admin operator...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.operator.upsert({
    where: { email: 'admin@eep.com' },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      name: 'Administrador',
      email: 'admin@eep.com',
      passwordHash: hashedPassword,
      roleId: diretorRole.id,
      isActive: true,
    },
  })

  await prisma.operator.upsert({
    where: { email: 'admin@eeep.com' },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      name: 'Administrador',
      email: 'admin@eeep.com',
      passwordHash: hashedPassword,
      roleId: diretorRole.id,
      isActive: true,
    },
  })

  // 3. SchoolYear
  console.log('📅 Creating school year...')
  const schoolYear = await prisma.schoolYear.upsert({
    where: { year: 2026 },
    update: {},
    create: {
      year: 2026,
      isCurrent: true,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-12-15'),
    },
  })

  // 4. Grades
  console.log('🎓 Creating grades...')
  const grade1 = await prisma.grade.upsert({
    where: { name: '1ª Série EM' },
    update: {},
    create: { name: '1ª Série EM', orderNumber: 1, level: 'MEDIO' },
  })
  const grade2 = await prisma.grade.upsert({
    where: { name: '2ª Série EM' },
    update: {},
    create: { name: '2ª Série EM', orderNumber: 2, level: 'MEDIO' },
  })
  const grade3 = await prisma.grade.upsert({
    where: { name: '3ª Série EM' },
    update: {},
    create: { name: '3ª Série EM', orderNumber: 3, level: 'MEDIO' },
  })

  // 5. Subjects
  console.log('📚 Creating subjects...')
  const subjects = [
    { name: 'Língua Portuguesa', abbreviation: 'PORT' },
    { name: 'Matemática', abbreviation: 'MAT' },
    { name: 'História', abbreviation: 'HIST' },
    { name: 'Geografia', abbreviation: 'GEO' },
    { name: 'Biologia', abbreviation: 'BIO' },
    { name: 'Física', abbreviation: 'FIS' },
    { name: 'Química', abbreviation: 'QUI' },
    { name: 'Filosofia', abbreviation: 'FIL' },
    { name: 'Sociologia', abbreviation: 'SOC' },
    { name: 'Educação Física', abbreviation: 'EDF' },
    { name: 'Arte', abbreviation: 'ART' },
    { name: 'Língua Inglesa', abbreviation: 'ING' },
  ]
  for (const s of subjects) {
    await prisma.subject.upsert({
      where: { name: s.name },
      update: { abbreviation: s.abbreviation },
      create: { name: s.name, abbreviation: s.abbreviation },
    })
  }

  // 6. RACTypes
  console.log('📋 Creating RAC types...')
  const racTypes = [
    { name: 'Uso de Celular', severity: 'LEVE', description: 'Uso indevido de aparelho celular durante a aula' },
    { name: 'Dormir em Sala', severity: 'MODERADO', description: 'Dormindo durante a explicação ou atividade' },
    { name: 'Não Fazer Atividade', severity: 'LEVE', description: 'Recusa ou negligência na realização das atividades propostas' },
    { name: 'Conversa Excessiva', severity: 'LEVE', description: 'Conversas paralelas atrapalhando o andamento da aula' },
    { name: 'Sair sem Autorização', severity: 'MODERADO', description: 'Ausentar-se da sala de aula sem permissão do professor' },
  ]
  for (const r of racTypes) {
    await prisma.rACType.upsert({
      where: { name: r.name },
      update: { severity: r.severity, description: r.description },
      create: { name: r.name, severity: r.severity, description: r.description },
    })
  }

  // 7. OccurrenceTypes
  console.log('⚠️ Creating Occurrence types...')
  const occurrenceTypes = [
    { name: 'Falta de Fardamento', severity: 'LEVE', description: 'Estudante sem o fardamento escolar regulamentar' },
    { name: 'Briga em Sala', severity: 'GRAVE', description: 'Agressão física ou verbal grave entre estudantes' },
    { name: 'Atraso', severity: 'LEVE', description: 'Chegada após o horário limite estabelecido' },
    { name: 'Desrespeito ao Professor', severity: 'GRAVE', description: 'Falta de respeito, desacato ou ofensas a docentes/funcionários' },
    { name: 'Depredação de Patrimônio', severity: 'GRAVE', description: 'Dano voluntário ao patrimônio escolar ou de terceiros' },
  ]
  for (const o of occurrenceTypes) {
    await prisma.occurrenceType.upsert({
      where: { name: o.name },
      update: { severity: o.severity, description: o.description },
      create: { name: o.name, severity: o.severity, description: o.description },
    })
  }

  // 8. ClassGroups
  console.log('🏫 Creating class groups...')
  const classGroups = [
    { name: '1º Ano A', shift: 'MANHA', gradeId: grade1.id, schoolYearId: schoolYear.id },
    { name: '1º Ano B', shift: 'TARDE', gradeId: grade1.id, schoolYearId: schoolYear.id },
    { name: '2º Ano A', shift: 'MANHA', gradeId: grade2.id, schoolYearId: schoolYear.id },
    { name: '2º Ano B', shift: 'TARDE', gradeId: grade2.id, schoolYearId: schoolYear.id },
    { name: '3º Ano A', shift: 'MANHA', gradeId: grade3.id, schoolYearId: schoolYear.id },
    { name: '3º Ano B', shift: 'NOITE', gradeId: grade3.id, schoolYearId: schoolYear.id },
  ]
  for (const c of classGroups) {
    await prisma.classGroup.upsert({
      where: {
        name_gradeId_schoolYearId: {
          name: c.name,
          gradeId: c.gradeId,
          schoolYearId: c.schoolYearId,
        },
      },
      update: { shift: c.shift },
      create: {
        name: c.name,
        shift: c.shift,
        gradeId: c.gradeId,
        schoolYearId: c.schoolYearId,
      },
    })
  }

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
