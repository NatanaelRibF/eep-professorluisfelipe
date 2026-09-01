import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNewFeaturesData() {
  console.log('🌱 Seeding initial data for new features...');

  // 1. Ensure "Frequência Geral Diária" subject exists
  await prisma.subject.upsert({
    where: { name: 'Frequência Geral Diária' },
    update: { abbreviation: 'GERAL', isActive: true },
    create: {
      name: 'Frequência Geral Diária',
      abbreviation: 'GERAL',
      isActive: true,
    },
  });
  console.log('  ✅ Subject "Frequência Geral Diária" created/verified');

  // 2. Seed Official 2026 SEDUC Ceará Academic Calendar Events
  const events = [
    // 1º Bimestre
    { title: 'Início do Ano Letivo 2026 (1º Bimestre)', type: 'BIMESTRE', startDate: new Date('2026-02-02'), isNonSchoolDay: false, bimester: 1, color: 'blue' },
    { title: 'Carnaval (Feriado & Recesso Escolar)', type: 'FERIADO', startDate: new Date('2026-02-16'), endDate: new Date('2026-02-18'), isNonSchoolDay: true, bimester: 1, color: 'red' },
    { title: 'Dia de São José (Padroeiro do Ceará)', type: 'FERIADO', startDate: new Date('2026-03-19'), isNonSchoolDay: true, bimester: 1, color: 'red' },
    { title: 'Data Magna do Ceará', type: 'FERIADO', startDate: new Date('2026-03-25'), isNonSchoolDay: true, bimester: 1, color: 'red' },
    { title: 'Semana Santa / Paixão de Cristo', type: 'FERIADO', startDate: new Date('2026-04-02'), endDate: new Date('2026-04-03'), isNonSchoolDay: true, bimester: 1, color: 'red' },
    { title: 'Tiradentes', type: 'FERIADO', startDate: new Date('2026-04-21'), isNonSchoolDay: true, bimester: 1, color: 'red' },
    { title: 'Término do 1º Bimestre & Conselho de Turma', type: 'CONSELHO', startDate: new Date('2026-04-30'), isNonSchoolDay: false, bimester: 1, color: 'purple' },

    // 2º Bimestre
    { title: 'Início do 2º Bimestre', type: 'BIMESTRE', startDate: new Date('2026-05-04'), isNonSchoolDay: false, bimester: 2, color: 'blue' },
    { title: 'Dia do Trabalho', type: 'FERIADO', startDate: new Date('2026-05-01'), isNonSchoolDay: true, bimester: 2, color: 'red' },
    { title: 'Corpus Christi', type: 'FERIADO', startDate: new Date('2026-06-04'), isNonSchoolDay: true, bimester: 2, color: 'red' },
    { title: 'Término do 2º Bimestre & Conselho de Turma', type: 'CONSELHO', startDate: new Date('2026-06-30'), isNonSchoolDay: false, bimester: 2, color: 'purple' },
    { title: 'Férias Escolares dos Alunos (Julho)', type: 'RECESSO', startDate: new Date('2026-07-01'), endDate: new Date('2026-07-31'), isNonSchoolDay: true, bimester: 2, color: 'amber' },

    // 3º Bimestre
    { title: 'Início do 3º Bimestre (Retorno das Aulas)', type: 'BIMESTRE', startDate: new Date('2026-08-03'), isNonSchoolDay: false, bimester: 3, color: 'blue' },
    { title: 'Dia do Estudante / Feira de Profissões EEEP', type: 'EVENTO', startDate: new Date('2026-08-11'), isNonSchoolDay: false, bimester: 3, color: 'green' },
    { title: 'Independência do Brasil', type: 'FERIADO', startDate: new Date('2026-09-07'), isNonSchoolDay: true, bimester: 3, color: 'red' },
    { title: 'Término do 3º Bimestre & Conselho de Turma', type: 'CONSELHO', startDate: new Date('2026-09-30'), isNonSchoolDay: false, bimester: 3, color: 'purple' },

    // 4º Bimestre
    { title: 'Início do 4º Bimestre', type: 'BIMESTRE', startDate: new Date('2026-10-01'), isNonSchoolDay: false, bimester: 4, color: 'blue' },
    { title: 'Nossa Senhora Aparecida', type: 'FERIADO', startDate: new Date('2026-10-12'), isNonSchoolDay: true, bimester: 4, color: 'red' },
    { title: 'Dia do Professor e Funcionários da Educação', type: 'FERIADO', startDate: new Date('2026-10-15'), isNonSchoolDay: true, bimester: 4, color: 'red' },
    { title: 'Finados', type: 'FERIADO', startDate: new Date('2026-11-02'), isNonSchoolDay: true, bimester: 4, color: 'red' },
    { title: 'Proclamação da República', type: 'FERIADO', startDate: new Date('2026-11-15'), isNonSchoolDay: true, bimester: 4, color: 'red' },
    { title: 'Dia Nacional da Consciência Negra', type: 'FERIADO', startDate: new Date('2026-11-20'), isNonSchoolDay: true, bimester: 4, color: 'red' },
    { title: 'Conselho de Classe Final & Encerramento do Ano Letivo', type: 'CONSELHO', startDate: new Date('2026-12-18'), isNonSchoolDay: false, bimester: 4, color: 'purple' },
  ];

  const currentYear = await prisma.schoolYear.findFirst({ where: { isCurrent: true } });

  for (const ev of events) {
    const existing = await prisma.schoolEvent.findFirst({ where: { title: ev.title } });
    if (!existing) {
      await prisma.schoolEvent.create({
        data: {
          ...ev,
          schoolYearId: currentYear?.id,
        },
      });
    }
  }
  console.log(`  ✅ Academic calendar seeded with ${events.length} SEDUC events`);
}

seedNewFeaturesData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
