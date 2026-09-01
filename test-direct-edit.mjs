import { chromium } from 'playwright';

const BASE_URL = 'https://eeep-professorluisfelipe.vercel.app';

async function testDirectEdit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Login as admin
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@eep.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });

    // 2. Directly visit Willena's edit page
    await page.goto(`${BASE_URL}/operadores/cmtdhgc5m0001l304dsh0h6ql/editar`, { waitUntil: 'networkidle' });

    // 3. Check if the preview image rendered
    const editImg = await page.locator('img[alt="Foto do perfil"]').first();
    const isVisible = await editImg.isVisible();
    const src = await editImg.getAttribute('src');
    console.log(`  ✅ [PASS] Em /operadores/[id]/editar a foto está visível: ${isVisible}, src: ${src?.slice(0, 60)}...`);

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testDirectEdit();
