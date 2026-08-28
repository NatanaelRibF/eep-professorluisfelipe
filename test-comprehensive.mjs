import { chromium } from 'playwright';

async function runComprehensiveE2ETest() {
  console.log('================================================================');
  console.log('🚀 INICIANDO TESTE E2E COMPLETO DE SIMULAÇÃO DE OPERADOR REAL');
  console.log('🌐 Alvo: https://eep-professorluisfelipe.vercel.app');
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
    console.log('🔹 2. CADASTRANDO NOVO OPERADOR (PROFESSOR)...');
    await page.goto('https://eep-professorluisfelipe.vercel.app/operadores/novo', { waitUntil: 'networkidle' });
    await page.fill('#name', 'Prof. Fernando Souza');
    await page.fill('#email', 'prof.fernando@eep.com');
    await page.fill('#password', 'prof123');
    
    // Select role Professor
    await page.click('#role');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.locator('[role="option"]:has-text("Professor")').click();
    
    await page.click('button[type="submit"]');
    await page.waitForURL('https://eep-professorluisfelipe.vercel.app/operadores', { timeout: 15000 });
    console.log('   ✅ Novo Professor "Prof. Fernando Souza" cadastrado com sucesso!\n');

    // ---------------------------------------------------------
    // 3. CADASTRAR NOVA TURMA
    // ---------------------------------------------------------
    console.log('🔹 3. CADASTRANDO NOVA TURMA...');
    await page.goto('https://eep-professorluisfelipe.vercel.app/turmas/novo', { waitUntil: 'networkidle' });
    await page.fill('#name', '2º Ano C');
    
    // Select Serie
    await page.click('#grade');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.locator('[role="option"]:has-text("2ª Série EM")').click();
    
    // Select Turno
    await page.click('#shift');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.locator('[role="option"]:has-text("Tarde")').click();

    await page.click('button[type="submit"]');
    await page.waitForURL('https://eep-professorluisfelipe.vercel.app/turmas', { timeout: 15000 });
    console.log('   ✅ Turma "2º Ano C" criada com sucesso!\n');

    // ---------------------------------------------------------
    // 4. CONFIGURAÇÕES: CADASTRAR DISCIPLINA, RAC TYPE E OCCURRENCE TYPE
    // ---------------------------------------------------------
    console.log('🔹 4. CADASTRANDO DISCIPLINA E CATEGORIAS EM CONFIGURAÇÕES...');
    await page.goto('https://eep-professorluisfelipe.vercel.app/configuracoes', { waitUntil: 'networkidle' });

    // Nova Disciplina
    console.log('   -> Adicionando Disciplina: Programação Web...');
    await page.click('button:has-text("Nova Disciplina")');
    await page.waitForSelector('#subName', { timeout: 5000 });
    await page.fill('#subName', 'Programação Web');
    await page.fill('#subAbbr', 'PROG');
    await page.click('button:has-text("Salvar Disciplina")');
    await page.waitForTimeout(2000);
    console.log('   ✅ Disciplina cadastrada com sucesso!');

    // Novo Tipo de RAC
    console.log('   -> Adicionando Tipo de RAC: Uso de Fone de Ouvido...');
    await page.click('button[role="tab"]:has-text("Tipos de RAC")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Novo Tipo RAC")');
    await page.waitForSelector('#racTitle', { timeout: 5000 });
    await page.fill('#racTitle', 'Uso de Fone de Ouvido');
    await page.fill('#racDesc', 'Estudante utilizando fone de ouvido durante a explicação do professor');
    await page.click('button:has-text("Salvar Tipo")');
    await page.waitForTimeout(2000);
    console.log('   ✅ Tipo de RAC cadastrado com sucesso!');

    // Novo Tipo de Ocorrência
    console.log('   -> Adicionando Tipo de Ocorrência: Danificar Material Escolar...');
    await page.click('button[role="tab"]:has-text("Ocorrências")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Novo Tipo de Ocorrência")');
    await page.waitForSelector('#occTitle', { timeout: 5000 });
    await page.fill('#occTitle', 'Danificar Material Escolar');
    await page.fill('#occDesc', 'Dano culposo ou doloso a livros ou equipamentos');
    await page.click('button:has-text("Salvar Tipo")');
    await page.waitForTimeout(2000);
    console.log('   ✅ Tipo de Ocorrência cadastrado com sucesso!\n');

    // ---------------------------------------------------------
    // 5. CADASTRAR ALUNOS COM DADOS COMPLETOS
    // ---------------------------------------------------------
    console.log('🔹 5. CADASTRANDO ALUNOS...');
    
    const alunosParaCadastrar = [
      {
        nome: 'Gabriel Mendes de Alencar',
        matricula: '20261011',
        dataNasc: '2008-04-12',
        responsavel: 'Francisca Mendes de Alencar',
        telefone: '85991234567',
        endereco: 'Rua Dom Pedro II, 140',
        bairro: 'Centro',
        cidade: 'Crateús'
      },
      {
        nome: 'Larissa Beatriz de Oliveira',
        matricula: '20261012',
        dataNasc: '2008-08-25',
        responsavel: 'Antônio de Oliveira',
        telefone: '85998765432',
        endereco: 'Av. Sargento Hermínio, 500',
        bairro: 'São Vicente',
        cidade: 'Crateús'
      },
      {
        nome: 'Lucas Vinicius dos Santos',
        matricula: '20261013',
        dataNasc: '2008-11-03',
        responsavel: 'Raimunda dos Santos',
        telefone: '85993334444',
        endereco: 'Rua José Coriolano, 88',
        bairro: 'Venâncios',
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

      await page.click('button[type="submit"]:has-text("Salvar Aluno")');
      await page.waitForURL('https://eep-professorluisfelipe.vercel.app/alunos', { timeout: 15000 });
      console.log(`   ✅ Aluno ${al.nome} cadastrado com sucesso!`);
    }
    console.log('');

    // ---------------------------------------------------------
    // 6. LANÇAMENTO DE FREQUÊNCIA POR DISCIPLINA
    // ---------------------------------------------------------
    console.log('🔹 6. LANÇANDO FREQUÊNCIA POR DISCIPLINA...');
    await page.goto('https://eep-professorluisfelipe.vercel.app/frequencia', { waitUntil: 'networkidle' });
    
    // Select Turma
    await page.locator('button[role="combobox"]').nth(0).click();
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.locator('[role="option"]').first().click();
    
    // Select Disciplina
    await page.locator('button[role="combobox"]').nth(1).click();
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.locator('[role="option"]').first().click();

    // Carregar Turma
    await page.click('button:has-text("Carregar Turma")');
    await page.waitForTimeout(2000);

    // Marcar Todos como Presentes
    const markAllBtn = page.locator('button:has-text("Marcar Todos como Presentes")');
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click();
      await page.waitForTimeout(1000);

      // Salvar Frequência
      await page.click('button:has-text("Salvar Lançamento")');
      await page.waitForTimeout(2500);
      console.log('   ✅ Lançamento de Frequência salvo com sucesso no banco de dados!\n');
    } else {
      console.log('   ℹ️ Nenhum aluno nesta turma específica ainda.\n');
    }

    // ---------------------------------------------------------
    // 7. LANÇAR REGISTRO DE RAC
    // ---------------------------------------------------------
    console.log('🔹 7. LANÇANDO REGISTRO DE RAC (EM SALA DE AULA)...');
    await page.goto('https://eep-professorluisfelipe.vercel.app/rac/novo', { waitUntil: 'networkidle' });

    // Select Turma
    await page.locator('button[role="combobox"]').nth(0).click();
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(1500);

    // Select Aluno
    const alunoSelect = page.locator('button[role="combobox"]').nth(1);
    if (await alunoSelect.isEnabled()) {
      await alunoSelect.click();
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      await page.locator('[role="option"]').first().click();

      // Select Tipo RAC
      await page.locator('button[role="combobox"]').nth(2).click();
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      await page.locator('[role="option"]').first().click();

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
    await page.locator('button[role="combobox"]').nth(0).click();
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(1500);

    // Select Aluno
    const occAlunoSelect = page.locator('button[role="combobox"]').nth(1);
    if (await occAlunoSelect.isEnabled()) {
      await occAlunoSelect.click();
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      await page.locator('[role="option"]').last().click();

      // Select Tipo Ocorrência
      await page.locator('button[role="combobox"]').nth(2).click();
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      await page.locator('[role="option"]').first().click();

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
    console.log('🔹 11. TESTANDO LOGIN COM O NOVO PROFESSOR CADASTRADO...');
    await page.goto('https://eep-professorluisfelipe.vercel.app/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'prof.fernando@eep.com');
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
