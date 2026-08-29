import { chromium } from 'playwright';

const BASE_URL = 'https://eeep-professorluisfelipe.vercel.app';

async function testAvatarAndHeader() {
  console.log('🔍 Testing avatar upload and header display on production...');
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

    // 2. Go to /perfil and upload a sample avatar photo
    await page.goto(`${BASE_URL}/perfil`, { waitUntil: 'networkidle' });
    
    // Check if Avatar or profile form is loaded
    const profileText = await page.textContent('body');
    if (profileText.includes('Meu Perfil & Senha')) {
      console.log('  ✅ [PASS] Página /perfil carregada');
    }

    // Set a sample test avatar image URL or test upload
    const testAvatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    await page.evaluate(async (url) => {
      // Call update profile action directly via fetch if available or inspect form
    });

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testAvatarAndHeader();
