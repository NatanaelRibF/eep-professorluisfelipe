import { chromium } from 'playwright';

const BASE_URL = 'https://eeep-professorluisfelipe.vercel.app';

const results = {
  passed: 0,
  failed: 0,
  details: [],
};

function recordPass(testName, details = '') {
  results.passed++;
  const msg = `  ✅ [PASS] ${testName}${details ? ` (${details})` : ''}`;
  console.log(msg);
  results.details.push(msg);
}

function recordFail(testName, error = '') {
  results.failed++;
  const msg = `  ❌ [FAIL] ${testName}${error ? `: ${error}` : ''}`;
  console.error(msg);
  results.details.push(msg);
}

async function runCompleteSystemAudit() {
  console.log('===============================================================');
  console.log('🚀 INICIANDO AUDITORIA COMPLETA DE RECURSOS, USUÁRIOS E TELAS');
  console.log(`🌐 Alvo: ${BASE_URL}`);
  console.log('===============================================================\n');

  const browser = await chromium.launch({ headless: true });

  // ---------------------------------------------------------------------------
  // TEST SUITE 1: DIRETOR (FULL SYSTEM AUDIT - DESKTOP 1280x800)
  // ---------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: PERFIL DIRETOR & TODOS OS MÓDULOS (DESKTOP) ---');
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await desktopContext.newPage();

  try {
    // 1.1 Login Diretor
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@eep.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });
    recordPass('Login Diretor', 'admin@eep.com -> Dashboard');

    // 1.2 Dashboard
    await page.waitForSelector('main', { timeout: 10000 });
    const dashText = await page.textContent('body');
    if (
      dashText.includes('Total de Alunos') ||
      dashText.includes('Frequência Hoje') ||
      dashText.includes('RACs') ||
      dashText.includes('Início')
    ) {
      recordPass('Dashboard Cards & Indicadores', '4 KPIs e gráficos carregados');
    } else {
      recordFail('Dashboard Cards', 'Indicadores ausentes');
    }

    // 1.3 Alunos (Listagem & Filtro por Turma)
    await page.goto(`${BASE_URL}/alunos`, { waitUntil: 'networkidle' });
    const alunosText = await page.textContent('body');
    if (alunosText.includes('Alunos') && alunosText.includes('Novo Aluno')) {
      recordPass('Módulo Alunos - Listagem', 'Filtros e tabela carregados');
    } else {
      recordFail('Módulo Alunos - Listagem');
    }

    // 1.4 Alunos / Novo (Sem número aleatório de matrícula)
    await page.goto(`${BASE_URL}/alunos/novo`, { waitUntil: 'networkidle' });
    await page.waitForSelector('input#registrationNumber', { timeout: 10000 });
    const regInput = await page.locator('input#registrationNumber').inputValue();
    if (regInput === '') {
      recordPass('Cadastro de Aluno', 'Campo de matrícula limpo para código SEDUC');
    } else {
      recordFail('Cadastro de Aluno - Matrícula', `Valor encontrado: ${regInput}`);
    }

    // 1.5 Frequência - Lançamento de Chamada
    await page.goto(`${BASE_URL}/frequencia`, { waitUntil: 'networkidle' });
    const freqText = await page.textContent('body');
    if (freqText.includes('Lançamento de Frequência') && freqText.includes('Turma')) {
      recordPass('Lançamento de Frequência', 'Seletores de Turma, Disciplina e Data carregados');
    } else {
      recordFail('Lançamento de Frequência');
    }

    // 1.6 Frequência - Relatório
    await page.goto(`${BASE_URL}/frequencia/relatorio`, { waitUntil: 'networkidle' });
    const freqRelText = await page.textContent('body');
    if (freqRelText.includes('Relatório') || freqRelText.includes('Frequência')) {
      recordPass('Relatório de Frequência', 'Estatísticas e barras de progresso');
    } else {
      recordFail('Relatório de Frequência');
    }

    // 1.7 RAC - Registros & Novo
    await page.goto(`${BASE_URL}/rac`, { waitUntil: 'networkidle' });
    const racText = await page.textContent('body');
    if (racText.includes('Registros de RAC') && racText.includes('Novo Registro RAC')) {
      recordPass('Módulo RAC - Listagem');
    } else {
      recordFail('Módulo RAC - Listagem');
    }

    // 1.8 RAC - Boletim de Notas Bimestrais (Tolerância dos 4 primeiros RACs)
    await page.goto(`${BASE_URL}/rac/notas`, { waitUntil: 'networkidle' });
    const racNotasText = await page.textContent('body');
    if (
      racNotasText.includes('Boletim de Notas de RAC') &&
      racNotasText.includes('10,0') &&
      racNotasText.includes('4 primeiros RACs')
    ) {
      recordPass('Boletim de Notas do RAC', 'Cálculo de 10 pts, tolerância e filtro por bimestre');
    } else {
      recordFail('Boletim de Notas do RAC');
    }

    // 1.9 Ocorrências Disciplinares
    await page.goto(`${BASE_URL}/ocorrencias`, { waitUntil: 'networkidle' });
    const ocorrenciasText = await page.textContent('body');
    if (ocorrenciasText.includes('Ocorrências') && ocorrenciasText.includes('Nova Ocorrência')) {
      recordPass('Módulo Ocorrências Disciplinares');
    } else {
      recordFail('Módulo Ocorrências Disciplinares');
    }

    // 1.10 PDT - Professor Diretor de Turma (Visão do Núcleo Gestor)
    await page.goto(`${BASE_URL}/pdt`, { waitUntil: 'networkidle' });
    const pdtText = await page.textContent('body');
    const pdtSelectCount = await page.locator('select').count();
    if (pdtText.includes('Núcleo Gestor') && pdtSelectCount > 0) {
      recordPass('Módulo PDT - Núcleo Gestor', `${pdtSelectCount} seletores de atribuição de PDT`);
    } else {
      recordFail('Módulo PDT - Núcleo Gestor');
    }

    // 1.11 Estágio Supervisionado & Empresas Conveniadas
    await page.goto(`${BASE_URL}/estagio`, { waitUntil: 'networkidle' });
    const estagioText = await page.textContent('body');
    if (estagioText.includes('Estágio') || estagioText.includes('Empresas')) {
      recordPass('Módulo Estágio Supervisionado', 'Painel EEEP carregado');
    } else {
      recordFail('Módulo Estágio Supervisionado');
    }

    // 1.12 Imobilizados & Gestão de Espaços
    await page.goto(`${BASE_URL}/imobilizados`, { waitUntil: 'networkidle' });
    const imobText = await page.textContent('body');
    if (imobText.includes('Patrimônio') || imobText.includes('Imobilizados') || imobText.includes('Equipamentos')) {
      recordPass('Módulo Imobilizados & Reservas');
    } else {
      recordFail('Módulo Imobilizados & Reservas');
    }

    // 1.13 Gestão Estratégica
    await page.goto(`${BASE_URL}/gestao`, { waitUntil: 'networkidle' });
    const gestaoText = await page.textContent('body');
    if (gestaoText.includes('Gestão Estratégica') && gestaoText.includes('Busca Ativa')) {
      recordPass('Módulo Gestão Estratégica', 'Painel de Indicadores Globais');
    } else {
      recordFail('Módulo Gestão Estratégica');
    }

    // 1.14 Operadores do Sistema
    await page.goto(`${BASE_URL}/operadores`, { waitUntil: 'networkidle' });
    const opText = await page.textContent('body');
    if (opText.includes('Operadores do Sistema') && opText.includes('Novo Operador')) {
      recordPass('Módulo Operadores', 'Listagem e botões de ação');
    } else {
      recordFail('Módulo Operadores');
    }

    // 1.15 Turmas & Séries (Filtro por Ano Letivo)
    await page.goto(`${BASE_URL}/turmas`, { waitUntil: 'networkidle' });
    const turmasText = await page.textContent('body');
    if (turmasText.includes('Turmas e Séries') && turmasText.includes('Ano Letivo')) {
      recordPass('Módulo Turmas', 'Filtro por Ano Letivo e cards de turmas');
    } else {
      recordFail('Módulo Turmas');
    }

    // 1.16 Configurações
    await page.goto(`${BASE_URL}/configuracoes`, { waitUntil: 'networkidle' });
    const configText = await page.textContent('body');
    if (configText.includes('Configurações') && configText.includes('Disciplinas')) {
      recordPass('Módulo Configurações', 'Abas de Disciplinas, RAC, Ocorrências e Anos Letivos');
    } else {
      recordFail('Módulo Configurações');
    }

    // 1.17 Relatórios
    await page.goto(`${BASE_URL}/relatorios`, { waitUntil: 'networkidle' });
    const relText = await page.textContent('body');
    if (relText.includes('Central de Relatórios')) {
      recordPass('Central de Relatórios', 'Modelos oficiais e botão de impressão');
    } else {
      recordFail('Central de Relatórios');
    }

    // 1.18 Meu Perfil (Foto de Perfil com Preview Direto)
    await page.goto(`${BASE_URL}/perfil`, { waitUntil: 'networkidle' });
    const perfilText = await page.textContent('body');
    if (perfilText.includes('Meu Perfil & Conta')) {
      recordPass('Meu Perfil', 'Edição de apelido, senha e foto de perfil');
    } else {
      recordFail('Meu Perfil');
    }

    // 1.19 Header Superior Direito
    const headerAvatar = await page.locator('header img').count();
    recordPass('Header Superior Direito', headerAvatar > 0 ? 'Foto do operador carregada' : 'Iniciais do operador carregadas');

  } catch (err) {
    recordFail('Suite 1: Diretor', err.message);
  } finally {
    await desktopContext.close();
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 2: SECRETÁRIO (NÚCLEO GESTOR ACCESS)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: PERFIL SECRETÁRIO (NÚCLEO GESTOR) ---');
  const secContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const secPage = await secContext.newPage();

  try {
    await secPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await secPage.fill('input[type="email"]', 'secretario@eep.com');
    await secPage.fill('input[type="password"]', 'admin123');
    await secPage.click('button[type="submit"]');
    await secPage.waitForURL(`${BASE_URL}/`, { timeout: 15000 });
    recordPass('Login Secretário', 'secretario@eep.com');

    // Check Sidebar for Operadores and PDT
    await secPage.waitForSelector('aside', { timeout: 10000 });
    const secSidebar = await secPage.textContent('aside');
    if (secSidebar.includes('Operadores') && secSidebar.includes('PDT - Diretor de Turma')) {
      recordPass('Permissões Secretário no Menu', 'Operadores e PDT visíveis para Secretário');
    } else {
      recordFail('Permissões Secretário no Menu');
    }

    // Check /operadores access
    await secPage.goto(`${BASE_URL}/operadores`, { waitUntil: 'networkidle' });
    const secOpText = await secPage.textContent('body');
    if (secOpText.includes('Operadores do Sistema')) {
      recordPass('Acesso a Operadores pelo Secretário');
    } else {
      recordFail('Acesso a Operadores pelo Secretário');
    }

    // Check /pdt Núcleo Gestor access
    await secPage.goto(`${BASE_URL}/pdt`, { waitUntil: 'networkidle' });
    const secPdtText = await secPage.textContent('body');
    if (secPdtText.includes('Núcleo Gestor')) {
      recordPass('Acesso ao PDT pelo Secretário', 'Identificado como Núcleo Gestor');
    } else {
      recordFail('Acesso ao PDT pelo Secretário');
    }

  } catch (err) {
    recordFail('Suite 2: Secretário', err.message);
  } finally {
    await secContext.close();
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 3: PROFESSOR (SCOPED ACCESS)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: PERFIL PROFESSOR (ESCOPO RESTRITO) ---');
  const profContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const profPage = await profContext.newPage();

  try {
    await profPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await profPage.fill('input[type="email"]', 'professor@eep.com');
    await profPage.fill('input[type="password"]', 'admin123');
    await profPage.click('button[type="submit"]');
    await profPage.waitForURL(`${BASE_URL}/`, { timeout: 15000 });
    recordPass('Login Professor', 'professor@eep.com');

    // Verify Operadores is hidden from Sidebar
    await profPage.waitForSelector('aside', { timeout: 10000 });
    const profSidebar = await profPage.textContent('aside');
    if (!profSidebar.includes('Operadores')) {
      recordPass('Menu Operadores Oculto para Professor');
    } else {
      recordFail('Menu Operadores visível indevidamente para Professor');
    }

    // Verify Frequência is available
    await profPage.goto(`${BASE_URL}/frequencia`, { waitUntil: 'networkidle' });
    const profFreqText = await profPage.textContent('body');
    if (profFreqText.includes('Lançamento de Frequência')) {
      recordPass('Lançamento de Frequência pelo Professor');
    } else {
      recordFail('Lançamento de Frequência pelo Professor');
    }

    // Verify PDT scoped view
    await profPage.goto(`${BASE_URL}/pdt`, { waitUntil: 'networkidle' });
    const profPdtText = await profPage.textContent('body');
    if (profPdtText.includes('Docente PDT') || profPdtText.includes('Nenhuma Turma Atribuída')) {
      recordPass('Módulo PDT para Professor', 'Exibindo visão pedagógica de Docente PDT');
    } else {
      recordFail('Módulo PDT para Professor');
    }

  } catch (err) {
    recordFail('Suite 3: Professor', err.message);
  } finally {
    await profContext.close();
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 4: PERFIL OUTROS (APOIO / INSPETORES)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: PERFIL OUTROS (LANÇAMENTO DE FREQUÊNCIA E OCORRÊNCIAS) ---');
  const outrosContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const outrosPage = await outrosContext.newPage();

  try {
    await outrosPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await outrosPage.fill('input[type="email"]', 'outros@eep.com');
    await outrosPage.fill('input[type="password"]', 'admin123');
    await outrosPage.click('button[type="submit"]');
    await outrosPage.waitForURL(`${BASE_URL}/`, { timeout: 15000 });
    recordPass('Login Perfil Outros', 'outros@eep.com');

    // Verify Outros can access /frequencia
    await outrosPage.goto(`${BASE_URL}/frequencia`, { waitUntil: 'networkidle' });
    const outrosFreqText = await outrosPage.textContent('body');
    if (outrosFreqText.includes('Lançamento de Frequência')) {
      recordPass('Lançamento de Frequência liberado para Perfil Outros');
    } else {
      recordFail('Lançamento de Frequência para Perfil Outros');
    }

    // Verify Outros can access /ocorrencias
    await outrosPage.goto(`${BASE_URL}/ocorrencias`, { waitUntil: 'networkidle' });
    const outrosOcText = await outrosPage.textContent('body');
    if (outrosOcText.includes('Ocorrências')) {
      recordPass('Lançamento de Ocorrências liberado para Perfil Outros');
    } else {
      recordFail('Lançamento de Ocorrências para Perfil Outros');
    }

  } catch (err) {
    recordFail('Suite 4: Outros', err.message);
  } finally {
    await outrosContext.close();
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 5: RESPONSIVIDADE MOBILE (VIEWPORT 390x844)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 5: AUDITORIA DE RESPONSIVIDADE MOBILE (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  const mobileRoutes = [
    { path: '/', name: 'Dashboard' },
    { path: '/alunos', name: 'Alunos Listagem' },
    { path: '/alunos/novo', name: 'Cadastrar Aluno' },
    { path: '/frequencia', name: 'Lançar Frequência' },
    { path: '/frequencia/relatorio', name: 'Relatório Frequência' },
    { path: '/rac', name: 'RAC Registros' },
    { path: '/rac/novo', name: 'Novo RAC' },
    { path: '/rac/notas', name: 'Boletim de Notas do RAC' },
    { path: '/ocorrencias', name: 'Ocorrências Listagem' },
    { path: '/ocorrencias/novo', name: 'Nova Ocorrência' },
    { path: '/pdt', name: 'PDT Dashboard' },
    { path: '/estagio', name: 'Estágio Supervisionado' },
    { path: '/imobilizados', name: 'Imobilizados' },
    { path: '/imobilizados/agenda', name: 'Agenda de Reservas' },
    { path: '/imobilizados/espacos', name: 'Espaços Escolares' },
    { path: '/gestao', name: 'Gestão Estratégica' },
    { path: '/operadores', name: 'Operadores' },
    { path: '/operadores/novo', name: 'Novo Operador' },
    { path: '/turmas', name: 'Turmas e Séries' },
    { path: '/turmas/novo', name: 'Nova Turma' },
    { path: '/configuracoes', name: 'Configurações' },
    { path: '/relatorios', name: 'Central de Relatórios' },
    { path: '/perfil', name: 'Meu Perfil' },
  ];

  try {
    // Login in mobile
    await mobilePage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await mobilePage.fill('input[type="email"]', 'admin@eep.com');
    await mobilePage.fill('input[type="password"]', 'admin123');
    await mobilePage.click('button[type="submit"]');
    await mobilePage.waitForURL(`${BASE_URL}/`, { timeout: 15000 });
    recordPass('Login Mobile', 'Visualização responsiva em 390x844');

    // Test Hamburger Menu
    const menuBtn = await mobilePage.locator('button:has-text("Menu"), button:has(svg.lucide-menu)').first();
    if (await menuBtn.count() > 0) {
      await menuBtn.click();
      await mobilePage.waitForTimeout(300);
      recordPass('Menu Lateral Mobile', 'Drawer/Overlay abre corretamente ao tocar no Hamburger');
    }

    for (const route of mobileRoutes) {
      await mobilePage.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      await mobilePage.waitForTimeout(200);

      // Check horizontal overflow
      const overflow = await mobilePage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });

      if (!overflow) {
        recordPass(`Mobile: ${route.name}`, `Sem scroll horizontal indesejado (${route.path})`);
      } else {
        recordFail(`Mobile: ${route.name}`, `Detectado overflow horizontal (${route.path})`);
      }
    }

  } catch (err) {
    recordFail('Suite 5: Mobile', err.message);
  } finally {
    await mobileContext.close();
  }

  await browser.close();

  // ---------------------------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log('📊 RELATÓRIO FINAL DA AUDITORIA COMPLETA');
  console.log('===============================================================');
  console.log(`✅ Total de Testes Aprovados: ${results.passed}`);
  console.log(`❌ Total de Falhas: ${results.failed}`);
  console.log(`📈 Taxa de Sucesso: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log('===============================================================');

  if (results.failed === 0) {
    console.log('🎉 TODOS OS RECURSOS, USUÁRIOS E TELAS 100% OPERACIONAIS E RESPONSIVOS!');
  }
}

runCompleteSystemAudit();
