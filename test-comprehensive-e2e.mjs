import { chromium } from 'playwright';

const BASE_URL = 'https://eeep-professorluisfelipe.vercel.app';

async function runTests() {
  console.log('🚀 Starting Comprehensive E2E Test Suite for EEEP Professor Luís Felipe...\n');
  const browser = await chromium.launch({ headless: true });
  let totalTests = 0;
  let passedTests = 0;

  async function assert(condition, description) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${description}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
    }
  }

  try {
    // =========================================================================
    // 1. TESTE DO PERFIL DIRETOR (Admin) - Desktop
    // =========================================================================
    console.log('--- 👑 1. TESTANDO PERFIL DIRETOR (admin@eep.com) - Desktop ---');
    const contextDesktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await contextDesktop.newPage();

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@eep.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });

    const title = await page.textContent('body');
    await assert(title.includes('Dir. Roberto') || title.includes('Administrador') || title.includes('Início'), 'Login do Diretor e Saudação na Página Inicial');

    // Test PDT Page
    await page.goto(`${BASE_URL}/pdt`, { waitUntil: 'networkidle' });
    const pdtContent = await page.textContent('body');
    await assert(pdtContent.includes('Projeto Professor Diretor de Turma') && pdtContent.includes('Dossiês dos Alunos'), 'Módulo PDT: Listagem de turmas, atendimentos e atas de conselho');

    // Test Simulados Page
    await page.goto(`${BASE_URL}/simulados`, { waitUntil: 'networkidle' });
    const simuladosContent = await page.textContent('body');
    await assert(simuladosContent.includes('Simulados') && simuladosContent.includes('SPAECE'), 'Módulo Simulados: SPAECE / ENEM e Descritores');

    // Test Estágio Page
    await page.goto(`${BASE_URL}/estagio`, { waitUntil: 'networkidle' });
    const estagioContent = await page.textContent('body');
    await assert(estagioContent.includes('Estágio Curricular Supervisionado'), 'Módulo Estágio: Painel de alunos estagiários');

    // Test Empresas de Estágio
    await page.goto(`${BASE_URL}/estagio/empresas`, { waitUntil: 'networkidle' });
    const empresasContent = await page.textContent('body');
    await assert(empresasContent.includes('Empresas Parceiras & Conveniadas'), 'Módulo Estágio: Cadastro e diretório de empresas');

    // Test Reserva de Espaços
    await page.goto(`${BASE_URL}/imobilizados/espacos`, { waitUntil: 'networkidle' });
    const espacosContent = await page.textContent('body');
    await assert(espacosContent.includes('Reserva de Espaços Pedagógicos') && espacosContent.includes('LEI'), 'Módulo Reservas: Agendamento de LEI e Laboratórios');

    // Test Relatório Consolidado de Reservas
    await page.goto(`${BASE_URL}/imobilizados/relatorio`, { waitUntil: 'networkidle' });
    const relatorioReservasContent = await page.textContent('body');
    await assert(relatorioReservasContent.includes('Relatório Consolidado de Reservas') && relatorioReservasContent.includes('Imprimir Relatório'), 'Relatório Geral Consolidado de Ocupação com botão de Impressão');

    // Test Gestão Estratégica & Busca Ativa
    await page.goto(`${BASE_URL}/gestao`, { waitUntil: 'networkidle' });
    const gestaoContent = await page.textContent('body');
    await assert(gestaoContent.includes('Painel Estratégico de Gestão Escolar') && gestaoContent.includes('Radar de Busca Ativa'), 'Painel de Gestão Estratégica & Radar de Busca Ativa (Abandono Zero)');

    await contextDesktop.close();

    // =========================================================================
    // 2. TESTE DO PERFIL PROFESSOR - Mobile (390x844) & Desktop
    // =========================================================================
    console.log('\n--- 👨‍🏫 2. TESTANDO PERFIL PROFESSOR (professor@eep.com) - Mobile & Desktop ---');
    const contextMobileProf = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const pageProf = await contextMobileProf.newPage();

    await pageProf.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await pageProf.fill('input[type="email"]', 'professor@eep.com');
    await pageProf.fill('input[type="password"]', 'prof123');
    await pageProf.click('button[type="submit"]');
    await pageProf.waitForURL(`${BASE_URL}/`, { timeout: 15000 });

    const profHome = await pageProf.textContent('body');
    await assert(profHome.includes('Prof. Carlos') || profHome.includes('Carlos'), 'Saudação personalizada com apelido do Professor');

    // Test Responsive Header & Sidebar Drawer
    const menuBtn = pageProf.locator('button[aria-label="Abrir menu"], button:has(svg.lucide-menu)');
    if (await menuBtn.count() > 0) {
      await menuBtn.first().click();
      await pageProf.waitForTimeout(300);
      const drawerContent = await pageProf.textContent('aside');
      await assert(drawerContent.includes('Frequência') && drawerContent.includes('RAC') && drawerContent.includes('PDT'), 'Menu responsivo mobile (Drawer) funcionando com todos os atalhos');
    }

    // Test Frequência page for Professor
    await pageProf.goto(`${BASE_URL}/frequencia`, { waitUntil: 'networkidle' });
    const freqContent = await pageProf.textContent('body');
    await assert(freqContent.includes('Lançamento de Frequência') && freqContent.includes('Turma'), 'Professor acessa tela de chamada');

    // Test RAC page for Professor
    await pageProf.goto(`${BASE_URL}/rac`, { waitUntil: 'networkidle' });
    const racProfContent = await pageProf.textContent('body');
    await assert(racProfContent.includes('Registros de RAC'), 'Professor acessa tela de RAC');

    // Verify Restricted areas are not in Professor's sidebar
    const pageProfHtml = await pageProf.content();
    await assert(!pageProfHtml.includes('/configuracoes') && !pageProfHtml.includes('/operadores'), 'Módulos restritos (Operadores, Configurações) protegidos e ocultos para Professor');

    await contextMobileProf.close();

    // =========================================================================
    // 3. TESTE DO PERFIL SECRETÁRIO (secretario@eep.com)
    // =========================================================================
    console.log('\n--- 📁 3. TESTANDO PERFIL SECRETÁRIO (secretario@eep.com) ---');
    const contextSec = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageSec = await contextSec.newPage();

    await pageSec.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await pageSec.fill('input[type="email"]', 'secretario@eep.com');
    await pageSec.fill('input[type="password"]', 'sec123');
    await pageSec.click('button[type="submit"]');
    await pageSec.waitForURL(`${BASE_URL}/`, { timeout: 15000 });

    // Test RAC allowed for Secretário
    await pageSec.goto(`${BASE_URL}/rac`, { waitUntil: 'networkidle' });
    const secRacContent = await pageSec.textContent('body');
    await assert(secRacContent.includes('Registros de RAC') && secRacContent.includes('Novo Registro RAC'), 'Secretário possui permissão liberada para gerenciar e lançar RAC');

    // Test Alunos and Relatórios for Secretário
    await pageSec.goto(`${BASE_URL}/relatorios`, { waitUntil: 'networkidle' });
    const secRelContent = await pageSec.textContent('body');
    await assert(secRelContent.includes('Central de Relatórios') || secRelContent.includes('Relatório'), 'Secretário acessa Central de Relatórios');

    await contextSec.close();

    // =========================================================================
    // 4. TESTE DO PERFIL OUTROS (outros@eep.com) - Mobile
    // =========================================================================
    console.log('\n--- 👥 4. TESTANDO PERFIL OUTROS (outros@eep.com) - Mobile & Permissões ---');
    const contextOutros = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
    });
    const pageOutros = await contextOutros.newPage();

    await pageOutros.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await pageOutros.fill('input[type="email"]', 'outros@eep.com');
    await pageOutros.fill('input[type="password"]', 'outros123');
    await pageOutros.click('button[type="submit"]');
    await pageOutros.waitForURL(`${BASE_URL}/`, { timeout: 15000 });

    // Test Ocorrências allowed for Outros
    await pageOutros.goto(`${BASE_URL}/ocorrencias`, { waitUntil: 'networkidle' });
    const outrosOcorrContent = await pageOutros.textContent('body');
    await assert(outrosOcorrContent.includes('Registro de Ocorrências') && outrosOcorrContent.includes('Nova Ocorrência'), 'Perfil Outros possui permissão liberada para registrar Ocorrências');

    // Test Imobilizados for Outros
    await pageOutros.goto(`${BASE_URL}/imobilizados`, { waitUntil: 'networkidle' });
    const outrosImobContent = await pageOutros.textContent('body');
    await assert(outrosImobContent.includes('Imobilizados & Equipamentos'), 'Perfil Outros acessa módulo de Imobilizados e Reservas');

    // Test Meu Perfil for Outros
    await pageOutros.goto(`${BASE_URL}/perfil`, { waitUntil: 'networkidle' });
    const outrosPerfilContent = await pageOutros.textContent('body');
    await assert(outrosPerfilContent.includes('Meu Perfil') && outrosPerfilContent.includes('Apelido'), 'Perfil Outros gerencia seu apelido, foto e senha pessoal');

    await contextOutros.close();

  } catch (error) {
    console.error('Fatal error during E2E testing:', error);
  } finally {
    await browser.close();
    console.log(`\n========================================================`);
    console.log(`📊 RESULTADO FINAL DOS TESTES: ${passedTests}/${totalTests} (${Math.round((passedTests/totalTests)*100)}% de aprovação)`);
    console.log(`========================================================\n`);
  }
}

runTests();
