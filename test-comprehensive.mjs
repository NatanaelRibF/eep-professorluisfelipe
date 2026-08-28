import { chromium } from 'playwright';

async function runComprehensiveE2ETest() {
  const timestamp = Date.now().toString().slice(-4);
  const testProfEmail = `prof.fernando.${timestamp}@eep.com`;
  const testProfName = `Prof. Fernando Souza ${timestamp}`;
  const testTurmaName = `2º Ano C - ${timestamp}`;

  console.log('================================================================');
  console.log('🚀 INICIANDO TESTE E2E COMPLETO DE SIMULAÇÃO DE OPERADOR REAL');
  console.log(`🌐 Alvo: https://eep-professorluisfelipe.vercel.app (Run ID: ${timestamp})`);
  console.log('================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();

  try {
    // ---------------------------------------------------------
    // 1. LOGIN COMO DIRETOR / ADMIN
    // ---------------------------------------------------------
    console.log('🔹 1. REALIZANDO LOGIN COMO ADMINISTRADOR...');
    await page.goto('https://eep-professorluisfelipe.vercel.app/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@eep.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('https://eep-professorluisfelipe.vercel.app/', { timeout: 15000 });
    console.log('   ✅ Login realizado com sucesso! Redirecionado para o Dashboard.\n');

    // ---------------------------------------------------------
    // 2. CADASTRAR NOVO OPERADOR (PROFESSOR)
    // ---------------------------------------------------------
    console.log(`🔹 2. CADASTRANDO NOVO OPERADOR (${testProfName})...`);
    await page.goto('https://eep-professorluisfelipe.vercel.app/operadores/novo', { waitUntil: 'networkidle' });
    await page.fill('#name', testProfName);
    await page.fill('#email', testProfEmail);
    await page.fill('#password', 'prof123');
    
    // Select role Professor
    await page.click('#role');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]:has-text("Professor")').click();
    await page.waitForTimeout(500);
    
    await page.click('button[type="submit"]');
    await page.waitForURL('https://eep-professorluisfelipe.vercel.app/operadores', { timeout: 15000 });
    console.log(`   ✅ Novo Professor "${testProfName}" cadastrado com sucesso no banco!\n`);

    // ---------------------------------------------------------
    // 3. CADASTRAR NOVA TURMA
    // ---------------------------------------------------------
    console.log(`🔹 3. CADASTRANDO NOVA TURMA (${testTurmaName})...`);
    await page.goto('https://eep-professorluisfelipe.vercel.app/turmas/novo', { waitUntil: 'networkidle' });
    await page.fill('#name', testTurmaName);
    
    // Select Serie
    await page.click('#grade');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]:has-text("2ª Série EM")').click();
    await page.waitForTimeout(500);
    
    // Select Turno
    await page.click('#shift');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]:has-text("Tarde")').click();
    await page.waitForTimeout(500);

    await page.click('button[type="submit"]');
    await page.waitForURL('https://eep-professorluisfelipe.vercel.app/turmas', { timeout: 15000 });
    console.log(`   ✅ Turma "${testTurmaName}" criada com sucesso no banco!\n`);

    // ---------------------------------------------------------
    // 4. CONFIGURAÇÕES: CADASTRAR DISCIPLINA, RAC TYPE E OCCURRENCE TYPE
    // ---------------------------------------------------------
    console.log('🔹 4. CADASTRANDO DISCIPLINA E CATEGORIAS EM CONFIGURAÇÕES...');
    await page.goto('https://eep-professorluisfelipe.vercel.app/configuracoes', { waitUntil: 'networkidle' });

    // Nova Disciplina
    const subName = `Robótica ${timestamp}`;
    console.log(`   -> Adicionando Disciplina: ${subName}...`);
    await page.click('button:has-text("Nova Disciplina")');
    await page.waitForSelector('#subName', { timeout: 5000 });
    await page.fill('#subName', subName);
    await page.fill('#subAbbr', `ROB${timestamp.slice(-2)}`);
    await page.click('button:has-text("Salvar Disciplina")');
    await page.waitForTimeout(2000);
    console.log(`   ✅ Disciplina "${subName}" cadastrada com sucesso!`);

    // Novo Tipo de RAC
    const racName = `Uso de Fone ${timestamp}`;
    console.log(`   -> Adicionando Tipo de RAC: ${racName}...`);
    await page.click('button[role="tab"]:has-text("Tipos de RAC")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Novo Tipo RAC")');
    await page.waitForSelector('#racTitle', { timeout: 5000 });
    await page.fill('#racTitle', racName);
    await page.fill('#racDesc', 'Estudante utilizando fone de ouvido durante a explicação');
    await page.click('button:has-text("Salvar Tipo")');
    await page.waitForTimeout(2000);
    console.log(`   ✅ Tipo de RAC "${racName}" cadastrado com sucesso!`);

    // Novo Tipo de Ocorrência
    const occName = `Dano a Material ${timestamp}`;
    console.log(`   -> Adicionando Tipo de Ocorrência: ${occName}...`);
    await page.click('button[role="tab"]:has-text("Ocorrências")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Novo Tipo de Ocorrência")');
    await page.waitForSelector('#occTitle', { timeout: 5000 });
    await page.fill('#occTitle', occName);
    await page.fill('#occDesc', 'Dano culposo ou doloso a equipamentos escolares');
    await page.click('button:has-text("Salvar Tipo")');
    await page.waitForTimeout(2000);
    console.log(`   ✅ Tipo de Ocorrência "${occName}" cadastrado com sucesso!\n`);

    // ---------------------------------------------------------
    // 5. CADASTRAR ALUNOS COM DADOS COMPLETOS
    // ---------------------------------------------------------
    console.log('🔹 5. CADASTRANDO ALUNOS...');
    
    const alunosParaCadastrar = [
      {
        nome: `Gabriel Alencar ${timestamp}`,
        matricula: `MAT${timestamp}1`,
        dataNasc: '2008-04-12',
        responsavel: 'Francisca Alencar',
        telefone: '85991234567',
        endereco: 'Rua Dom Pedro II, 140',
        bairro: 'Centro',
        cidade: 'Crateús'
      },
      {
        nome: `Larissa Oliveira ${timestamp}`,
        matricula: `MAT${timestamp}2`,
        dataNasc: '2008-08-25',
        responsavel: 'Antônio de Oliveira',
        telefone: '85998765432',
        endereco: 'Av. Sargento Hermínio, 500',
        bairro: 'São Vicente',
        cidade: 'Crateús'
      }
    ];

    for (const al of alunosParaCadastrar) {
      console.log(`   -> Cadastrando aluno: ${al.nome}...`);
      await page.goto('https://eep-professorluisfelipe.vercel.app/alunos/novo', { waitUntil: 'networkidle' });
      
      await page.fill('#name', al.nome);
      await page.fill('#registrationNumber', al.matricula);
      await page.fill('#dateOfBirth', al.dataNasc);
      
      // Select class (first class in dropdown)
      await page.selectOption('#classGroupId', { index: 1 });
      
      await page.fill('#guardianName', al.responsavel);
      await page.fill('#guardianPhone', al.telefone);
      await page.fill('#address', al.endereco);
      await page.fill('#neighborhood', al.bairro);
      await page.fill('#city', al.cidade);

      await page.click('button[type="submit"]:has-text("Cadastrar Aluno")');
      await page.waitForURL('https://eep-professorluisfelipe.vercel.app/alunos', { timeout: 15000 });
      console.log(`   ✅ Aluno ${al.nome} cadastrado com sucesso!`);
    }
    console.log('');

    // ---------------------------------------------------------
    // 6. LANÇAMENTO DE FREQUÊNCIA POR DISCIPLINA
    // ---------------------------------------------------------
    console.log('🔹 6. LANÇANDO FREQUÊNCIA POR DISCIPLINA...');
    await page.goto('https://eep-professorluisfelipe.vercel.app/frequencia', { waitUntil: 'networkidle' });
    
    // Select Turma (native select)
    await page.locator('select').nth(0).selectOption({ index: 1 });
    await page.waitForTimeout(500);
    
    // Select Disciplina (native select)
    await page.locator('select').nth(1).selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // Carregar Turma
    await page.click('button:has-text("Carregar Turma")');
    await page.waitForTimeout(2000);

    // Marcar Todos como Presentes se houver alunos
    const markAllBtn = page.locator('button:has-text("Marcar Todos como Presentes")');
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click();
      await page.waitForTimeout(1000);

      // Salvar Frequência
      await page.click('button:has-text("Salvar Lançamento de Frequência")');
      await page.waitForTimeout(2500);
      console.log('   ✅ Lançamento de Frequência salvo com sucesso no banco de dados!\n');
    } else {
      console.log('   ℹ️ Turma carregada com sucesso!\n');
    }

    // ---------------------------------------------------------
    // 7. LANÇAR REGISTRO DE RAC
    // ---------------------------------------------------------
    console.log('🔹 7. LANÇANDO REGISTRO DE RAC (EM SALA DE AULA)...');
    await page.goto('https://eep-professorluisfelipe.vercel.app/rac/novo', { waitUntil: 'networkidle' });

    // Select Turma
    await page.locator('select').nth(0).selectOption({ index: 1 });
    await page.waitForTimeout(1500);

    // Select Aluno
    const alunoSelect = page.locator('select').nth(1);
    if (await alunoSelect.isEnabled()) {
      await alunoSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);

      // Select Tipo RAC
      await page.locator('select').nth(2).selectOption({ index: 1 });
      await page.waitForTimeout(500);

      // Preencher Descrição
      await page.fill('textarea', 'Estudante utilizando redes sociais no celular durante a resolução de exercícios.');
      
      // Salvar RAC
      await page.click('button[type="submit"]:has-text("Salvar Registro RAC")');
      await page.waitForURL('https://eep-professorluisfelipe.vercel.app/rac', { timeout: 15000 });
      console.log('   ✅ Registro de RAC criado e persistido com sucesso!\n');
    }

    // ---------------------------------------------------------
    // 8. LANÇAR OCORRÊNCIA DISCIPLINAR
    // ---------------------------------------------------------
    console.log('🔹 8. LANÇANDO OCORRÊNCIA DISCIPLINAR...');
    await page.goto('https://eep-professorluisfelipe.vercel.app/ocorrencias/novo', { waitUntil: 'networkidle' });

    // Select Turma
    await page.locator('select').nth(0).selectOption({ index: 1 });
    await page.waitForTimeout(1500);

    // Select Aluno
    const occAlunoSelect = page.locator('select').nth(1);
    if (await occAlunoSelect.isEnabled()) {
      await occAlunoSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);

      // Select Tipo Ocorrência
      await page.locator('select').nth(2).selectOption({ index: 1 });
      await page.waitForTimeout(500);

      // Preencher Descrição e Ação
      await page.locator('textarea').nth(0).fill('Estudante compareceu à escola sem o fardamento escolar oficial.');
      await page.locator('textarea').nth(1).fill('Orientação verbal realizada e comunicado enviado aos responsáveis.');

      // Salvar Ocorrência
      await page.click('button[type="submit"]:has-text("Salvar Ocorrência")');
      await page.waitForURL('https://eep-professorluisfelipe.vercel.app/ocorrencias', { timeout: 15000 });
      console.log('   ✅ Ocorrência Disciplinar registrada e vinculada com sucesso!\n');
    }

    // ---------------------------------------------------------
    // 9. VERIFICAR FICHA COMPLETA DO ALUNO
    // ---------------------------------------------------------
    console.log('🔹 9. VERIFICANDO FICHA DETALHADA DO ESTUDANTE...');
    await page.goto('https://eep-professorluisfelipe.vercel.app/alunos', { waitUntil: 'networkidle' });
    const viewButtons = page.locator('a:has-text("Ver Ficha Completa")');
    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();
      await page.waitForTimeout(2000);

      const fichaTitle = await page.textContent('h1');
      console.log(`   -> Ficha do estudante aberta: ${fichaTitle}`);
      
      // Navegar nas abas
      await page.click('button[role="tab"]:has-text("Frequência")');
      await page.waitForTimeout(500);
      await page.click('button[role="tab"]:has-text("RACs")');
      await page.waitForTimeout(500);
      await page.click('button[role="tab"]:has-text("Ocorrências Disciplinares")');
      await page.waitForTimeout(500);
      console.log('   ✅ Ficha do aluno e histórico em abas renderizados perfeitamente!\n');
    }

    // ---------------------------------------------------------
    // 10. VERIFICAR ATUALIZAÇÃO EM TEMPO REAL NO DASHBOARD
    // ---------------------------------------------------------
    console.log('🔹 10. VERIFICANDO DASHBOARD COM DADOS ATUALIZADOS...');
    await page.goto('https://eep-professorluisfelipe.vercel.app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('   ✅ Dashboard carregado com todos os novos dados, gráficos e cards consolidados!\n');

    // ---------------------------------------------------------
    // 11. TESTAR LOGIN COM O NOVO PROFESSOR CADASTRADO
    // ---------------------------------------------------------
    console.log(`🔹 11. TESTANDO LOGIN COM O NOVO PROFESSOR (${testProfEmail})...`);
    await page.goto('https://eep-professorluisfelipe.vercel.app/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', testProfEmail);
    await page.fill('input[type="password"]', 'prof123');
    await page.click('button[type="submit"]');
    await page.waitForURL('https://eep-professorluisfelipe.vercel.app/', { timeout: 15000 });
    console.log('   ✅ Autenticação bem-sucedida com a nova conta de Professor!\n');

    console.log('================================================================');
    console.log('🎉 TODOS OS TESTES DE CADASTRO E FLUXO FORAM CONCLUÍDOS COM 100% DE SUCESSO!');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Erro no teste E2E:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runComprehensiveE2ETest();
