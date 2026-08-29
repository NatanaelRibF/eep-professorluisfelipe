import { chromium } from 'playwright';

const BASE_URL = 'https://eeep-professorluisfelipe.vercel.app';

async function testLoginWithout494() {
  console.log('🔍 Testing Login on Production to verify 494 is completely resolved...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Visit login
    const response = await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    console.log(`  - /login HTTP status: ${response.status()}`);

    // 2. Perform login
    await page.fill('input[type="email"]', 'admin@eep.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // 3. Wait for dashboard
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });
    console.log(`  - Logged in successfully! Current URL: ${page.url()}`);

    // Check dashboard text
    const text = await page.textContent('body');
    if (text.includes('Dashboard') && !text.includes('494')) {
      console.log('  ✅ [PASS] Login realizado com sucesso sem erro 494!');
    } else {
      console.error('  ❌ [FAIL] Error text found:', text);
    }
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testLoginWithout494();
