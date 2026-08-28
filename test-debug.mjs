import { chromium } from 'playwright';

async function testDebug() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('Browser console:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('Browser error:', err));

  await page.goto('https://eep-professorluisfelipe.vercel.app/login');
  await page.fill('input[type="email"]', 'admin@eep.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('https://eep-professorluisfelipe.vercel.app/');

  await page.goto('https://eep-professorluisfelipe.vercel.app/operadores/novo');
  await page.fill('#name', 'Prof. Fernando Souza');
  await page.fill('#email', 'prof.fernando@eep.com');
  await page.fill('#password', 'prof123');

  await page.click('#role');
  await page.waitForTimeout(500);
  const options = await page.locator('[role="option"]').allTextContents();
  console.log('Available role options:', options);

  await page.locator('[role="option"]:has-text("Professor")').click();
  await page.waitForTimeout(500);

  console.log('Submitting form...');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);

  console.log('Current URL after submit:', page.url());
  const bodyText = await page.textContent('body');
  console.log('Body text includes error?:', bodyText.includes('Erro') || bodyText.includes('error'));

  await browser.close();
}

testDebug();
