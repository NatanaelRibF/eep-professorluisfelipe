import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSampleData() {
  console.log('Seeding initial data for new modules...');
  
  // 1. Get an operator
  const admin = await prisma.operator.findFirst({ where: { isActive: true } });
  if (!admin) return;

  // 2. Spaces
  const spaceCount = await prisma.schoolSpace.count();
  if (spaceCount === 0) {
    await prisma.schoolSpace.createMany({
      data: [
        { name: 'Laboratório de Informática (LEI 1)', category: 'LEI', capacity: 36, location: 'Bloco A', resources: '36 Computadores, Projetor, Ar Condicionado' },
        { name: 'Laboratório de Informática (LEI 2)', category: 'LEI', capacity: 36, location: 'Bloco A', resources: '36 Computadores, Ar Condicionado' },
        { name: 'Laboratório Multidisciplinar de Ciências', category: 'Ciências', capacity: 40, location: 'Bloco B', resources: 'Bancadas, Vidrarias, Microscópios, Pia' },
        { name: 'Biblioteca Escolar / Sala de Estudos', category: 'Biblioteca', capacity: 50, location: 'Bloco Central', resources: 'Mesas de grupo, Acervo, Computador de consulta' },
        { name: 'Auditório Principal', category: 'Auditório', capacity: 150, location: 'Entrada', resources: 'Palco, Som embutido, Telão, Iluminação' },
        { name: 'Quadra Poliesportiva Coberta', category: 'Quadra', capacity: 80, location: 'Área Externa', resources: 'Traves, Rede de vôlei, Placares' },
      ],
    });
    console.log('✅ Spaces created');
  }

  // 3. Eletivas
  const electiveCount = await prisma.electiveSubject.count();
  if (electiveCount === 0) {
    await prisma.electiveSubject.createMany({
      data: [
        {
          name: 'Robótica e Inteligência Artificial Básica',
          themeArea: 'Tecnologia',
          description: 'Aprenda lógica de automação, sensores e introdução à programação em blocos e Python aplicada a protótipos.',
          goals: 'Construir um protótipo funcional para a feira de ciências.',
          operatorId: admin.id,
          maxCapacity: 35,
          semester: 1,
          year: 2026,
          roomLocation: 'LEI 1',
        },
        {
          name: 'Redação Nota 1000 & Argumentação para o ENEM',
          themeArea: 'Linguagens',
          description: 'Oficina intensiva de produção textual, repertório sociocultural e estratégias para a nota máxima na redação do ENEM.',
          goals: 'Produção semanal de textos com correção detalhada por competências.',
          operatorId: admin.id,
          maxCapacity: 40,
          semester: 1,
          year: 2026,
          roomLocation: 'Sala 04',
        },
        {
          name: 'Educação Financeira e Empreendedorismo Juvenil',
          themeArea: 'Matemática',
          description: 'Planejamento de orçamento, investimentos para jovens, empreendedorismo prático e economia solidária.',
          goals: 'Criação de um plano de negócios fictício para o Feirão.',
          operatorId: admin.id,
          maxCapacity: 35,
          semester: 1,
          year: 2026,
          roomLocation: 'Sala 06',
        },
      ],
    });
    console.log('✅ Eletivas created');
  }

  // 4. Empresas de Estágio
  const companyCount = await prisma.internshipCompany.count();
  if (companyCount === 0) {
    await prisma.internshipCompany.createMany({
      data: [
        {
          tradeName: 'Grendene Sobral - TI & Suporte',
          corporateName: 'Grendene S/A',
          cnpj: '89.850.341/0001-06',
          contactPerson: 'Carlos Eduardo (Gerente RH)',
          phone: '(88) 3611-9000',
          email: 'estagios@grendene.com.br',
          city: 'Sobral',
          industryArea: 'Indústria e Manufatura',
        },
        {
          tradeName: 'Secretaria da Saúde de Sobral',
          corporateName: 'Prefeitura Municipal de Sobral',
          cnpj: '07.598.634/0001-37',
          contactPerson: 'Dra. Fernanda Albuquerque',
          phone: '(88) 3677-1200',
          email: 'saude.estagio@sobral.ce.gov.br',
          city: 'Sobral',
          industryArea: 'Saúde e Serviços Públicos',
        },
        {
          tradeName: 'InovaTech Soluções Digitais',
          corporateName: 'InovaTech Tecnologia LTDA',
          cnpj: '34.567.890/0001-12',
          contactPerson: 'Marcos Vinícius',
          phone: '(88) 98822-4455',
          email: 'contato@inovatechsobral.com.br',
          city: 'Sobral',
          industryArea: 'Tecnologia e Serviços',
        },
      ],
    });
    console.log('✅ Companies created');
  }

  // 5. Simulado Exemplo
  const examCount = await prisma.exam.count();
  if (examCount === 0) {
    await prisma.exam.create({
      data: {
        title: '1º Simulado Diagnóstico SPAECE 2026 - 3º Ano Médio',
        category: 'SPAECE',
        targetGrade: '3ª Série',
        date: new Date('2026-03-15'),
        totalQuestions: 10,
        answerKey: [
          { q: 1, answer: 'B', descriptor: 'D03' },
          { q: 2, answer: 'C', descriptor: 'D04' },
          { q: 3, answer: 'A', descriptor: 'D06' },
          { q: 4, answer: 'D', descriptor: 'D14' },
          { q: 5, answer: 'B', descriptor: 'D18' },
          { q: 6, answer: 'A', descriptor: 'D20' },
          { q: 7, answer: 'C', descriptor: 'D26' },
          { q: 8, answer: 'B', descriptor: 'D28' },
          { q: 9, answer: 'D', descriptor: 'D30' },
          { q: 10, answer: 'A', descriptor: 'D35' },
        ],
        description: 'Avaliação preparatória com matriz de descritores de Língua Portuguesa e Matemática (SEDUC-CE).',
      },
    });
    console.log('✅ Exam created');
  }

  console.log('🎉 Sample data seeded successfully!');
}

seedSampleData().catch(console.error).finally(() => prisma.$disconnect());
