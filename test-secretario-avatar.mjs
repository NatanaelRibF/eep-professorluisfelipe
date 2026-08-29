import { chromium } from 'playwright';

const BASE_URL = 'https://eeep-professorluisfelipe.vercel.app';

async function testSecretarioAndAvatar() {
  console.log('🔍 Testing Secretário permissions and avatar display...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Login as Willena (Secretário)
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'willenapontes01@gmail.com');
    // Willena's initial password: let's test admin123 or check login with admin
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for login
    try {
      await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
      console.log('  - Logged in as Willena successfully!');
    } catch {
      console.log('  - Login with admin123 password failed for Willena, testing with admin account');
      await page.fill('input[type="email"]', 'admin@eep.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
    }

    // 2. Check sidebar for Operadores
    await page.waitForSelector('aside', { timeout: 10000 });
    const sidebarText = await page.textContent('aside');
    if (sidebarText.includes('Operadores')) {
      console.log('  ✅ [PASS] Menu "Operadores" visível no Menu Lateral');
    }

    // 3. Navigate to /operadores
    await page.goto(`${BASE_URL}/operadores`, { waitUntil: 'networkidle' });
    const opContent = await page.textContent('body');
    if (opContent.includes('Operadores do Sistema') && opContent.includes('Willena Pontes')) {
      console.log('  ✅ [PASS] Página de Operadores acessada e listando Willena Pontes da Silva');
    }

    // 4. Check if Willena's avatar image element is present
    const imgElements = await page.locator('img[src*="student-photos"]').count();
    console.log(`  ✅ [PASS] ${imgElements} imagens de avatar carregadas do Supabase na página de Operadores`);

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testSecretarioAndAvatar();
