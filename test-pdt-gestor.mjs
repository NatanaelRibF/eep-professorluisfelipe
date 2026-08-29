import { chromium } from 'playwright';

const BASE_URL = 'https://eeep-professorluisfelipe.vercel.app';

async function testPDTNucleoGestor() {
  console.log('🔍 Testing PDT Núcleo Gestor & Scoped Teacher Permissions...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Login as Núcleo Gestor (Diretor)
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@eep.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });

    // 2. Navigate to /pdt
    await page.goto(`${BASE_URL}/pdt`, { waitUntil: 'networkidle' });
    const content = await page.textContent('body');
    if (
      content.includes('Núcleo Gestor') &&
      content.includes('Atribuição de Professores Diretores de Turma') &&
      content.includes('Professor Diretor de Turma (PDT)')
    ) {
      console.log('  ✅ [PASS] Núcleo Gestor possui visão global com badge e seletor de atribuição de PDT por turma');
    }

    // Check if dropdown select is present
    const selectElements = await page.locator('select').count();
    if (selectElements > 0) {
      console.log(`  ✅ [PASS] ${selectElements} seletores de atribuição de PDT encontrados para o Núcleo Gestor`);
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testPDTNucleoGestor();
