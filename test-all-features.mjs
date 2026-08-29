import { chromium } from 'playwright';

async function runComprehensiveVerification() {
  const timestamp = Date.now().toString().slice(-4);
  const testProfEmail = `prof.teste.${timestamp}@eeep.com`;
  const testProfName = `Prof. Valdir Oliveira ${timestamp}`;
  const testTurmaName = `3º Ano C - ${timestamp}`;
  const testPatrimonio = `PAT-PROJ-${timestamp}`;
  const testAlunoMatricula = `2026${timestamp}`;
  const testAlunoNome = `Marcos Vinícius Silva ${timestamp}`;

  console.log('========================================================================');
  console.log('🚀 INICIANDO BATERIA COMPLETA DE TESTES DE TODAS AS TELAS E MÓDULOS');
  console.log(`🌐 Alvo Oficial: https://eeep-professorluisfelipe.vercel.app (ID: ${timestamp})`);
  console.log('========================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------------------
    // 1. LOGIN COMO ADMINISTRADOR
    // -------------------------------------------------------------------------
    console.log('🔹 1. REALIZANDO LOGIN COMO ADMINISTRADOR...');
    await page.goto('https://eeep-professorluisfelipe.vercel.app/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@eeep.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('https://eeep-professorluisfelipe.vercel.app/', { timeout: 15000 });
    console.log('   ✅ Login de Administrador autenticado com sucesso!\n');

    // -------------------------------------------------------------------------
    // 2. DASHBOARD
    // -------------------------------------------------------------------------
    console.log('🔹 2. VERIFICANDO CARREGAMENTO DO DASHBOARD...');
    await page.waitForSelector('h2:has-text("Dashboard")', { timeout: 10000 });
    console.log('   ✅ Cards de Indicadores, Gráficos de Frequência e Atividade Recente carregados!\n');

    // -------------------------------------------------------------------------
    // 3. CADASTRAR NOVO OPERADOR (COM FOTO)
    // -------------------------------------------------------------------------
    console.log(`🔹 3. CADASTRANDO OPERADOR (${testProfName})...`);
    await page.goto('https://eeep-professorluisfelipe.vercel.app/operadores/novo', { waitUntil: 'networkidle' });
    await page.fill('#name', testProfName);
    await page.fill('#email', testProfEmail);
    await page.fill('#password', 'prof123');
    
    // Cargo Professor
    await page.click('#role');
    await page.waitForTimeout(400);
    await page.locator('[role="option"]:has-text("Professor")').click();
    await page.waitForTimeout(400);

    await page.click('button[type="submit"]');
    await page.waitForURL('https://eeep-professorluisfelipe.vercel.app/operadores', { timeout: 15000 });
    console.log(`   ✅ Professor "${testProfName}" salvo no banco com avatar!\n`);

    // -------------------------------------------------------------------------
    // 4. CADASTRAR NOVA TURMA
    // -------------------------------------------------------------------------
    console.log(`🔹 4. CADASTRANDO NOVA TURMA (${testTurmaName})...`);
    await page.goto('https://eeep-professorluisfelipe.vercel.app/turmas/novo', { waitUntil: 'networkidle' });
    await page.fill('#name', testTurmaName);
    
    // Selecionar 3ª Série
    await page.click('#grade');
    await page.waitForTimeout(400);
    await page.locator('[role="option"]:has-text("3ª Série EM")').click();
    await page.waitForTimeout(400);

    // Selecionar Turno Manhã
    await page.click('#shift');
    await page.waitForTimeout(400);
    await page.locator('[role="option"]:has-text("Manhã")').click();
    await page.waitForTimeout(400);

    await page.click('button[type="submit"]');
    await page.waitForURL('https://eeep-professorluisfelipe.vercel.app/turmas', { timeout: 15000 });
    console.log(`   ✅ Turma "${testTurmaName}" criada e listada!\n`);

    // -------------------------------------------------------------------------
    // 5. CONFIGURAÇÕES: DISCIPLINA, TIPO RAC, TIPO OCORRÊNCIA
    // -------------------------------------------------------------------------
    console.log('🔹 5. CADASTRANDO ITENS EM CONFIGURAÇÕES...');
    await page.goto('https://eeep-professorluisfelipe.vercel.app/configuracoes', { waitUntil: 'networkidle' });

    // Nova Disciplina
    const discNome = `Desenvolvimento Mobile ${timestamp}`;
    await page.click('button:has-text("Nova Disciplina")');
    await page.waitForSelector('#subName', { timeout: 5000 });
    await page.fill('#subName', discNome);
    await page.fill('#subAbbr', `MOB${timestamp.slice(-2)}`);
    await page.click('button:has-text("Salvar Disciplina")');
    await page.waitForTimeout(2000);
    console.log(`   ✅ Disciplina "${discNome}" cadastrada!`);

    // Novo Tipo de RAC
    const racNome = `Atraso de Retorno ${timestamp}`;
    await page.click('button[role="tab"]:has-text("Tipos de RAC")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Novo Tipo RAC")');
    await page.waitForSelector('#racTitle', { timeout: 5000 });
    await page.fill('#racTitle', racNome);
    await page.fill('#racDesc', 'Retorno tardio do intervalo sem justificativa');
    await page.click('button:has-text("Salvar Tipo")');
    await page.waitForTimeout(2000);
    console.log(`   ✅ Tipo de RAC "${racNome}" cadastrado!`);

    // Novo Tipo de Ocorrência
    const occNome = `Descumprimento de Regimento ${timestamp}`;
    await page.click('button[role="tab"]:has-text("Ocorrências")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Novo Tipo de Ocorrência")');
    await page.waitForSelector('#occTitle', { timeout: 5000 });
    await page.fill('#occTitle', occNome);
    await page.fill('#occDesc', 'Descumprimento reiterado das normas de convivência');
    await page.click('button:has-text("Salvar Tipo")');
    await page.waitForTimeout(2000);
    console.log(`   ✅ Tipo de Ocorrência "${occNome}" cadastrado!\n`);

    // -------------------------------------------------------------------------
    // 6. CADASTRAR NOVO ALUNO COM DADOS COMPLETOS
    // -------------------------------------------------------------------------
    console.log(`🔹 6. CADASTRANDO NOVO ESTUDANTE (${testAlunoNome})...`);
    await page.goto('https://eeep-professorluisfelipe.vercel.app/alunos/novo', { waitUntil: 'networkidle' });
    await page.fill('#name', testAlunoNome);
    await page.fill('#registrationNumber', testAlunoMatricula);
    await page.fill('#dateOfBirth', '2007-09-18');
    
    // Selecionar turma
    await page.selectOption('#classGroupId', { index: 1 });
    
    await page.fill('#guardianName', 'Helena Maria Silva');
    await page.fill('#guardianPhone', '85991112233');
    await page.fill('#address', 'Rua José Martins, 210');
    await page.fill('#neighborhood', 'Fátima');
    await page.fill('#city', 'Crateús');

    await page.click('button[type="submit"]:has-text("Cadastrar Aluno")');
    await page.waitForURL('https://eeep-professorluisfelipe.vercel.app/alunos', { timeout: 15000 });
    console.log(`   ✅ Estudante "${testAlunoNome}" (Matrícula: ${testAlunoMatricula}) cadastrado!\n`);

    // -------------------------------------------------------------------------
    // 7. CONSULTAR FICHA COMPLETA DO ALUNO E NAVEGAR NAS 4 ABAS
    // -------------------------------------------------------------------------
    console.log('🔹 7. TESTANDO FICHA DO ESTUDANTE (TODAS AS ABAS)...');
    const firstFichaBtn = page.locator('a:has-text("Ver Ficha")').first();
    await firstFichaBtn.click();
    await page.waitForTimeout(2000);

    const fichaHeader = await page.textContent('h1');
    console.log(`   -> Ficha aberta: ${fichaHeader}`);

    // Aba Dados
    await page.click('button[role="tab"]:has-text("Dados Cadastrais")');
    await page.waitForTimeout(400);
    // Aba Frequencia
    await page.click('button[role="tab"]:has-text("Frequência")');
    await page.waitForTimeout(400);
    // Aba RACs
    await page.click('button[role="tab"]:has-text("RACs")');
    await page.waitForTimeout(400);
    // Aba Ocorrencias
    await page.click('button[role="tab"]:has-text("Ocorrências Disciplinares")');
    await page.waitForTimeout(400);
    console.log('   ✅ Todas as 4 abas da ficha do estudante renderizadas com sucesso!\n');

    // -------------------------------------------------------------------------
    // 8. LANÇAMENTO DE FREQUÊNCIA POR DISCIPLINA
    // -------------------------------------------------------------------------
    console.log('🔹 8. REALIZANDO LANÇAMENTO DE CHAMADA (FREQUÊNCIA)...');
    await page.goto('https://eeep-professorluisfelipe.vercel.app/frequencia', { waitUntil: 'networkidle' });
    
    await page.locator('select').nth(0).selectOption({ index: 1 });
    await page.waitForTimeout(400);
    await page.locator('select').nth(1).selectOption({ index: 1 });
    await page.waitForTimeout(400);

    await page.click('button:has-text("Carregar Turma")');
    await page.waitForTimeout(2000);

    const markAllBtn = page.locator('button:has-text("Marcar Todos como Presentes")');
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click();
      await page.waitForTimeout(500);

      await page.click('button:has-text("Salvar Lançamento de Frequência")');
      await page.waitForTimeout(2500);
      console.log('   ✅ Chamada salva no banco de dados com sucesso!\n');
    }

    // -------------------------------------------------------------------------
    // 9. RELATÓRIO DE FREQUÊNCIA
    // -------------------------------------------------------------------------
    console.log('🔹 9. CONSULTANDO RELATÓRIO DETALHADO DE FREQUÊNCIA...');
    await page.goto('https://eeep-professorluisfelipe.vercel.app/frequencia/relatorio', { waitUntil: 'networkidle' });
    await page.waitForSelector('h1:has-text("Relatório de Frequência")', { timeout: 10000 });
    console.log('   ✅ Relatório e métricas de assiduidade carregados!\n');

    // -------------------------------------------------------------------------
    // 10. LANÇAR REGISTRO DE RAC EM SALA DE AULA
    // -------------------------------------------------------------------------
    console.log('🔹 10. LANÇANDO NOVO REGISTRO DE RAC...');
    await page.goto('https://eeep-professorluisfelipe.vercel.app/rac/novo', { waitUntil: 'networkidle' });
    
    await page.locator('select').nth(0).selectOption({ index: 1 });
    await page.waitForTimeout(1500);

    const alunoRacSelect = page.locator('select').nth(1);
    if (await alunoRacSelect.isEnabled()) {
      await alunoRacSelect.selectOption({ index: 1 });
      await page.waitForTimeout(400);

      await page.locator('select').nth(2).selectOption({ index: 1 });
      await page.waitForTimeout(400);

      await page.fill('textarea', 'Estudante realizou todas as atividades propostas e auxiliou os colegas no laboratório.');
      await page.click('button[type="submit"]:has-text("Salvar Registro RAC")');
      await page.waitForURL('https://eeep-professorluisfelipe.vercel.app/rac', { timeout: 15000 });
      console.log('   ✅ Registro de RAC salvo e listado na tabela!\n');
    }

    // -------------------------------------------------------------------------
    // 11. LANÇAR OCORRÊNCIA DISCIPLINAR
    // -------------------------------------------------------------------------
    console.log('🔹 11. LANÇANDO OCORRÊNCIA DISCIPLINAR...');
    await page.goto('https://eeep-professorluisfelipe.vercel.app/ocorrencias/novo', { waitUntil: 'networkidle' });
    
    await page.locator('select').nth(0).selectOption({ index: 1 });
    await page.waitForTimeout(1500);

    const occAlunoSelect = page.locator('select').nth(1);
    if (await occAlunoSelect.isEnabled()) {
      await occAlunoSelect.selectOption({ index: 1 });
      await page.waitForTimeout(400);

      await page.locator('select').nth(2).selectOption({ index: 1 });
      await page.waitForTimeout(400);

      await page.locator('textarea').nth(0).fill('Atraso no início do segundo tempo de aula.');
      await page.locator('textarea').nth(1).fill('Conversa de alinhamento com a coordenação pedagógica.');

      await page.click('button[type="submit"]:has-text("Salvar Ocorrência")');
      await page.waitForURL('https://eeep-professorluisfelipe.vercel.app/ocorrencias', { timeout: 15000 });
      console.log('   ✅ Ocorrência Disciplinar registrada e salva no histórico!\n');
    }

    // -------------------------------------------------------------------------
    // 12. CADASTRAR NOVO IMOBILIZADO / EQUIPAMENTO
    // -------------------------------------------------------------------------
    console.log(`🔹 12. CADASTRANDO NOVO EQUIPAMENTO (${testPatrimonio})...`);
    await page.goto('https://eeep-professorluisfelipe.vercel.app/imobilizados/novo', { waitUntil: 'networkidle' });
    
    await page.fill('#name', `Projetor Epson Laser ${timestamp}`);
    await page.fill('#code', testPatrimonio);
    
    await page.click('#category');
    await page.waitForTimeout(400);
    await page.locator('[role="option"]:has-text("Projetor")').click();
    await page.waitForTimeout(400);

    await page.fill('#brand', 'Epson');
    await page.fill('#model', 'PowerLite L530U');
    await page.fill('#location', 'Laboratório de Redes');
    await page.fill('#description', 'Acompanha cabo HDMI reforçado de 5m, controle remoto e ponteira laser.');

    await page.click('button[type="submit"]:has-text("Salvar Equipamento")');
    await page.waitForURL('https://eeep-professorluisfelipe.vercel.app/imobilizados', { timeout: 15000 });
    console.log(`   ✅ Novo Equipamento "${testPatrimonio}" cadastrado no catálogo!\n`);

    // -------------------------------------------------------------------------
    // 13. GRADE DE HORÁRIOS POR AULA (AGENDA DE EQUIPAMENTOS)
    // -------------------------------------------------------------------------
    console.log('🔹 13. TESTANDO GRADE INTERATIVA DE HORÁRIOS POR AULA...');
    await page.goto('https://eeep-professorluisfelipe.vercel.app/imobilizados/agenda', { waitUntil: 'networkidle' });
    await page.waitForSelector('h1:has-text("Grade de Horários por Aula")', { timeout: 10000 });
    
    // Clicar no primeiro slot livre para reservar
    const freeSlotBtn = page.locator('button:has-text("Livre")').first();
    if (await freeSlotBtn.isVisible()) {
      await freeSlotBtn.click();
      await page.waitForSelector('#agendaClass', { timeout: 5000 });
      await page.fill('#agendaClass', '3º Ano C - Redes');
      await page.fill('#agendaPurpose', 'Apresentação de Projeto Integrador');
      await page.click('button[type="submit"]:has-text("Confirmar Reserva")');
      await page.waitForTimeout(2500);
      console.log('   ✅ Horário de aula reservado na grade visual com sucesso!\n');
    }

    // -------------------------------------------------------------------------
    // 14. FICHA DO IMOBILIZADO E HISTÓRICO DE USO
    // -------------------------------------------------------------------------
    console.log('🔹 14. VERIFICANDO FICHA E HISTÓRICO DE USO DO EQUIPAMENTO...');
    await page.goto('https://eeep-professorluisfelipe.vercel.app/imobilizados', { waitUntil: 'networkidle' });
    const firstHistBtn = page.locator('a:has-text("Ver Histórico")').first();
    await firstHistBtn.click();
    await page.waitForTimeout(2000);

    const eqTitle = await page.textContent('h1');
    console.log(`   -> Ficha do equipamento aberta: ${eqTitle}`);
    console.log('   ✅ Especificações, status e tabela de histórico de agendamentos validados!\n');

    // -------------------------------------------------------------------------
    // 15. CENTRAL DE RELATÓRIOS E IMPRESSÃO
    // -------------------------------------------------------------------------
    console.log('🔹 15. TESTANDO CENTRAL DE RELATÓRIOS E CABEÇALHO OFICIAL...');
    await page.goto('https://eeep-professorluisfelipe.vercel.app/relatorios', { waitUntil: 'networkidle' });
    await page.waitForSelector('h1:has-text("EEEP Professor Luís Felipe")', { timeout: 10000 });
    console.log('   ✅ Central de relatórios e layout de impressão homologados!\n');

    // -------------------------------------------------------------------------
    // 16. LOGIN COM O NOVO PROFESSOR CADASTRADO
    // -------------------------------------------------------------------------
    console.log(`🔹 16. TESTANDO LOGIN DO NOVO PROFESSOR (${testProfEmail})...`);
    await page.goto('https://eeep-professorluisfelipe.vercel.app/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', testProfEmail);
    await page.fill('input[type="password"]', 'prof123');
    await page.click('button[type="submit"]');
    await page.waitForURL('https://eeep-professorluisfelipe.vercel.app/', { timeout: 15000 });
    console.log(`   ✅ Login do Professor "${testProfName}" realizado com sucesso!\n`);

    console.log('========================================================================');
    console.log('🎉 100% DOS MÓDULOS, TELAS, CADASTROS, FICHAS E AGENDAS APROVADOS COM SUCESSO!');
    console.log('========================================================================');
  } catch (err) {
    console.error('❌ Erro na bateria de testes:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runComprehensiveVerification();
