import { chromium } from 'playwright';

const BASE_URL = 'https://eeep-professorluisfelipe.vercel.app';

async function testSchoolYearAndSignOut() {
  console.log('🔍 Testing Turmas School Year filter and SignOut redirect...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@eep.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });

    // 2. Check Turmas Page Filter
    await page.goto(`${BASE_URL}/turmas`, { waitUntil: 'networkidle' });
    const turmasContent = await page.textContent('body');
    if (turmasContent.includes('Ano Letivo') && turmasContent.includes('Ano Vigente')) {
      console.log('  ✅ [PASS] Tela Turmas e Séries exibe seletor de Ano Letivo com destaque para o Ano Vigente');
    }

    // 3. Test Logout Button (Sidebar or Header)
    const logoutBtn = page.locator('button:has-text("Sair")').first();
    await logoutBtn.click();
    await page.waitForURL(url => url.pathname.includes('/login'), { timeout: 10000 });
    const currentUrl = page.url();
    console.log(`  - Redirecionado após logout para: ${currentUrl}`);
    if (currentUrl.startsWith(BASE_URL) && currentUrl.includes('/login')) {
      console.log('  ✅ [PASS] Botão Sair redireciona perfeitamente para o domínio de produção (/login)');
    } else {
      console.error(`  ❌ [FAIL] Logout redirecionou para URL inesperada: ${currentUrl}`);
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testSchoolYearAndSignOut();
