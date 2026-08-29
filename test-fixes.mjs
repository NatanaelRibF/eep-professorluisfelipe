import { chromium } from 'playwright';

const BASE_URL = 'https://eeep-professorluisfelipe.vercel.app';

async function testFixes() {
  console.log('🔍 Testing SEDUC Matricula input and Subject Status Confirmation/Listing...');
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

    // 2. Check Aluno Novo Form
    await page.goto(`${BASE_URL}/alunos/novo`, { waitUntil: 'networkidle' });
    const regInput = page.locator('input#registrationNumber');
    const val = await regInput.inputValue();
    const placeholder = await regInput.getAttribute('placeholder');
    console.log(`  - Matrícula default value: "${val}" (Expected: empty)`);
    console.log(`  - Matrícula placeholder: "${placeholder}"`);
    if (val === '' && placeholder.includes('SEDUC')) {
      console.log('  ✅ [PASS] Campo de Matrícula/Código SEDUC limpo e com placeholder correto');
    } else {
      console.error('  ❌ [FAIL] Matrícula still populated or missing SEDUC placeholder');
    }

    // 3. Check Configurações Page
    await page.goto(`${BASE_URL}/configuracoes`, { waitUntil: 'networkidle' });
    const pageText = await page.textContent('body');
    if (pageText.includes('Grade de Disciplinas') && pageText.includes('Inativas') && pageText.includes('Ativas')) {
      console.log('  ✅ [PASS] Página de Configurações possui contadores e filtros de Ativas/Inativas');
    }

    // Click on a subject button to trigger confirmation modal
    const subjectBtn = page.locator('button[title*="desativar"]').first();
    if (await subjectBtn.count() > 0) {
      await subjectBtn.click();
      await page.waitForTimeout(300);
      const modalText = await page.textContent('body');
      if (modalText.includes('Confirmar Desativação') && modalText.includes('Você tem certeza que deseja desativar')) {
        console.log('  ✅ [PASS] Modal de confirmação de desativação abre com texto explicativo e botões');
      }
      // Click cancel
      await page.click('button:has-text("Cancelar")');
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testFixes();
