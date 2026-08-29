import { chromium } from 'playwright';

const BASE_URL = 'https://eeep-professorluisfelipe.vercel.app';

async function testSimuladosRemoval() {
  console.log('🔍 Testing complete removal of Simulados module...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@eep.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('  Current URL after login:', page.url());

    // 2. Verify body doesn't have Simulados in nav
    const bodyText = await page.textContent('body');
    if (!bodyText.includes('Simulados SPAECE/ENEM')) {
      console.log('  ✅ [PASS] "Simulados SPAECE/ENEM" não está mais presente na barra de navegação');
    }

    // 3. Verify /simulados route is 404
    await page.goto(`${BASE_URL}/simulados`, { waitUntil: 'networkidle' });
    const content = await page.textContent('body');
    if (content.includes('404') || content.includes('não encontrada') || content.includes('This page could not be found')) {
      console.log('  ✅ [PASS] Rota /simulados removida com sucesso (404 Not Found)');
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testSimuladosRemoval();
