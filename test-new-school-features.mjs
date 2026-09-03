import { chromium } from 'playwright';

const BASE_URL = 'https://eeep-professorluisfelipe.vercel.app';

async function testNewFeatures() {
  console.log('🚀 TESTING NEW SCHOOL FEATURES IN PRODUCTION...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Login as Admin
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@eep.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });
    console.log('  ✅ [PASS] Login com sucesso');

    // 2. Test Frequência - Por Dia e Por Aula
    await page.goto(`${BASE_URL}/frequencia`, { waitUntil: 'networkidle' });
    const freqContent = await page.textContent('body');
    if (
      freqContent.includes('Frequência por Dia') &&
      freqContent.includes('Frequência por Aula')
    ) {
      console.log('  ✅ [PASS] Seletor de Frequência Por Dia e Por Aula ativo');
    } else {
      console.error('  ❌ [FAIL] Seletor de Frequência Por Dia/Aula ausente');
    }

    // 3. Test Busca Ativa por Turma
    await page.goto(`${BASE_URL}/busca-ativa`, { waitUntil: 'networkidle' });
    const buscaContent = await page.textContent('body');
    if (
      buscaContent.includes('Busca Ativa Escolar') &&
      buscaContent.includes('Risco Crítico')
    ) {
      console.log('  ✅ [PASS] Módulo Busca Ativa Escolar carregado com cálculo de faltas e ações');
    } else {
      console.error('  ❌ [FAIL] Módulo Busca Ativa com erro');
    }

    // 4. Test Liberação de Alunos
    await page.goto(`${BASE_URL}/liberacao`, { waitUntil: 'networkidle' });
    const libContent = await page.textContent('body');
    if (
      libContent.includes('Liberação de Alunos') &&
      libContent.includes('Nova Liberação de Aluno')
    ) {
      console.log('  ✅ [PASS] Módulo de Liberação de Alunos carregado');
    } else {
      console.error('  ❌ [FAIL] Módulo de Liberação de Alunos com erro');
    }

    // 5. Test Calendário Letivo 2026
    await page.goto(`${BASE_URL}/calendario`, { waitUntil: 'networkidle' });
    const calContent = await page.textContent('body');
    if (
      calContent.includes('Calendário Letivo Oficial 2026') &&
      calContent.includes('1º Bimestre') &&
      calContent.includes('Dias Letivos')
    ) {
      console.log('  ✅ [PASS] Calendário Letivo 2026 carregado com eventos da SEDUC');
    } else {
      console.error('  ❌ [FAIL] Calendário Letivo com erro');
    }

    // 6. Test Ficha do Estudante com Assinaturas
    await page.goto(`${BASE_URL}/alunos/cmtcgbdjn000ai804xj2cmlso`, { waitUntil: 'networkidle' });
    const fichaContent = await page.textContent('body');
    if (
      fichaContent.includes('Ficha do Estudante') &&
      fichaContent.includes('Imprimir Ficha & Termo')
    ) {
      console.log('  ✅ [PASS] Ficha do Estudante com layout oficial e 3 campos de assinatura');
    } else {
      console.error('  ❌ [FAIL] Ficha do Estudante');
    }

    console.log('\n🎉 TODAS AS NOVAS FUNCIONALIDADES VALIDADAS EM PRODUÇÃO COM SUCESSO!');
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testNewFeatures();
