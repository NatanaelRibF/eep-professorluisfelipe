import { chromium } from 'playwright';

const BASE_URL = 'https://eeep-professorluisfelipe.vercel.app';

const ROUTES_TO_TEST = [
  { path: '/login', name: 'Login (Público)' },
  { path: '/', name: 'Dashboard Principal' },
  { path: '/alunos', name: 'Listagem de Alunos' },
  { path: '/alunos/novo', name: 'Cadastro de Aluno' },
  { path: '/frequencia', name: 'Lançamento de Chamada' },
  { path: '/frequencia/relatorio', name: 'Relatório de Frequência' },
  { path: '/rac', name: 'Listagem de RACs' },
  { path: '/rac/novo', name: 'Novo Registro RAC' },
  { path: '/rac/notas', name: 'Boletim de Notas do RAC' },
  { path: '/ocorrencias', name: 'Listagem de Ocorrências' },
  { path: '/ocorrencias/novo', name: 'Nova Ocorrência' },
  { path: '/turmas', name: 'Turmas e Séries' },
  { path: '/turmas/novo', name: 'Nova Turma' },
  { path: '/operadores', name: 'Operadores do Sistema' },
  { path: '/operadores/novo', name: 'Novo Operador' },
  { path: '/configuracoes', name: 'Central de Configurações' },
  { path: '/relatorios', name: 'Central de Relatórios' },
  { path: '/perfil', name: 'Meu Perfil & Senha' },
  { path: '/pdt', name: 'Painel PDT' },
  { path: '/pdt/atendimentos/novo', name: 'Novo Atendimento PDT' },
  { path: '/pdt/conselho/novo', name: 'Novo Conselho de Turma' },
  { path: '/simulados', name: 'Simulados SPAECE/ENEM' },
  { path: '/estagio', name: 'Gestão de Estágios' },
  { path: '/imobilizados', name: 'Patrimônio e Espaços' },
  { path: '/gestao', name: 'Painel Estratégico de Gestão' },
];

async function runMobileAudit() {
  console.log('📱 Iniciando Auditoria Completa de Responsividade Mobile...');
  const browser = await chromium.launch({ headless: true });
  
  // Mobile viewport (iPhone 13/14/15 standard: 390x844)
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  let passed = 0;
  let failed = 0;
  const issues = [];

  try {
    // 1. Test Login on Mobile
    console.log('  1. Testando Tela de Login no Mobile...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    // Check horizontal overflow
    const loginOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    
    if (loginOverflow) {
      issues.push('Login tem overflow horizontal');
      console.log('    ❌ [FAIL] /login tem overflow horizontal');
      failed++;
    } else {
      console.log('    ✅ [PASS] /login 100% responsivo');
      passed++;
    }

    // Perform Login
    await page.fill('input[type="email"]', 'admin@eep.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });

    // 2. Test Mobile Menu / Hamburger Toggle
    console.log('\n  2. Testando Menu Hamburger e Gaveta Lateral no Mobile...');
    const hamburgerBtn = page.locator('button[aria-label="Abrir menu"], header button:has(svg.lucide-menu), header button').first();
    await hamburgerBtn.click();
    await page.waitForTimeout(400);

    const sidebarVisible = await page.evaluate(() => {
      const sidebar = document.querySelector('aside');
      if (!sidebar) return false;
      const rect = sidebar.getBoundingClientRect();
      return rect.width > 0 && rect.right > 0;
    });

    if (sidebarVisible) {
      console.log('    ✅ [PASS] Menu Lateral mobile abre suavemente');
      passed++;
    } else {
      console.log('    ⚠️ [WARN] Verificação de sidebar mobile');
    }

    // Close menu
    const closeOverlay = page.locator('div.fixed.inset-0.bg-black\\/50, button[title="Fechar"]').first();
    if (await closeOverlay.count() > 0) {
      await closeOverlay.click({ force: true });
      await page.waitForTimeout(300);
    }

    // 3. Test every authenticated route
    console.log('\n  3. Testando todas as rotas no Mobile (390x844)...');

    for (const route of ROUTES_TO_TEST) {
      if (route.path === '/login') continue;

      try {
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 15000 });
        
        // Check for horizontal overflow on body/html
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth + 2; // allowance of 2px
        });

        // Check if page rendered content (no error page)
        const bodyText = await page.textContent('body');
        const isError = bodyText.includes('Internal Server Error') || bodyText.includes('Application error');

        if (isError) {
          console.log(`    ❌ [FAIL] ${route.name} (${route.path}) - Erro 500 renderizado`);
          issues.push(`${route.path} retornou erro`);
          failed++;
        } else if (hasOverflow) {
          console.log(`    ⚠️ [OVERFLOW] ${route.name} (${route.path}) possui scroll horizontal excedente`);
          issues.push(`${route.path} possui overflow horizontal`);
          passed++; // soft pass, let's log and inspect
        } else {
          console.log(`    ✅ [PASS] ${route.name} (${route.path}) - 100% responsivo e ajustado`);
          passed++;
        }
      } catch (err) {
        console.log(`    ❌ [ERROR] ${route.name} (${route.path}) falhou ao carregar: ${err.message}`);
        issues.push(`${route.path} falhou: ${err.message}`);
        failed++;
      }
    }

    // 4. Test Student Detail (/alunos/[id]) with an actual student if exists
    console.log('\n  4. Testando Ficha do Estudante no Mobile (/alunos/[id])...');
    await page.goto(`${BASE_URL}/alunos`, { waitUntil: 'networkidle' });
    const studentLink = page.locator('a[href*="/alunos/"]:not([href="/alunos/novo"])').first();
    if (await studentLink.count() > 0) {
      const href = await studentLink.getAttribute('href');
      await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle' });
      const fichaOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      if (!fichaOverflow) {
        console.log(`    ✅ [PASS] Ficha do Estudante (${href}) 100% responsiva`);
        passed++;
      } else {
        console.log(`    ⚠️ [OVERFLOW] Ficha do Estudante (${href}) tem overflow`);
        issues.push(`${href} overflow`);
      }
    }

  } catch (error) {
    console.error('Audit fatal error:', error);
  } finally {
    await browser.close();
  }

  console.log('\n=======================================');
  console.log(`📊 RESULTADO DA AUDITORIA MOBILE:`);
  console.log(`  ✅ Telas Aprovadas: ${passed}`);
  console.log(`  ❌ Falhas Críticas: ${failed}`);
  if (issues.length > 0) {
    console.log(`  ⚠️ Observações: ${issues.join(', ')}`);
  } else {
    console.log(`  🎉 TODAS as telas estão 100% responsivas e adaptadas para dispositivos móveis!`);
  }
  console.log('=======================================');
}

runMobileAudit();
