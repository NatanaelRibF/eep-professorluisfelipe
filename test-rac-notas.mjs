import { chromium } from 'playwright';

const BASE_URL = 'https://eeep-professorluisfelipe.vercel.app';

async function testRACNotasAndPermissions() {
  console.log('🔍 Testing RAC Grades Bulletin & Updated Permissions...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Login as Diretor
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@eep.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });

    // 2. Check /rac/notas page
    await page.goto(`${BASE_URL}/rac/notas`, { waitUntil: 'networkidle' });
    const content = await page.textContent('body');
    if (
      content.includes('Boletim de Notas de RAC') &&
      content.includes('10,0 pontos') &&
      content.includes('Tolerância') &&
      content.includes('Bimestre')
    ) {
      console.log('  ✅ [PASS] Tela /rac/notas carregada com sucesso com regra de 10 pontos e tolerância dos 4 primeiros RACs');
    } else {
      console.error('  ❌ [FAIL] Missing RAC notas content');
    }

    // 3. Check /rac page button to Boletim
    await page.goto(`${BASE_URL}/rac`, { waitUntil: 'networkidle' });
    const racContent = await page.textContent('body');
    if (racContent.includes('Boletim de Notas do RAC')) {
      console.log('  ✅ [PASS] Botão de acesso rápido ao Boletim de Notas do RAC visível em /rac');
    }

    // 4. Check /relatorios page 5th card
    await page.goto(`${BASE_URL}/relatorios`, { waitUntil: 'networkidle' });
    const relContent = await page.textContent('body');
    if (relContent.includes('Notas do RAC')) {
      console.log('  ✅ [PASS] Central de Relatórios possui card direto para Notas do RAC');
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testRACNotasAndPermissions();
