import { defineConfig, devices } from '@playwright/test';

/**
 * Leia as variáveis de ambiente de um arquivo .env.
 * Para mais informações, veja https://playwright.dev/docs/test-configuration#use-environment-variables
 */
// require('dotenv').config(); // Descomente esta linha se você usa variáveis de ambiente no .env para o baseUrl ou credenciais

/**
 * Veja https://playwright.dev/docs/test-configuration para detalhes completos.
 */
export default defineConfig({
  // O diretório onde seus arquivos de teste estão.
  testDir: './tests',

  // Ignorar arquivos dentro da pasta node_modules
  testIgnore: '**/node_modules/**',

  // Ordem de execução dos testes: 'parallel' (padrão) ou 'serial'.
  fullyParallel: true,

  // Permite 3 retries (tentativas) para testes que falharem.
  retries: process.env.CI ? 2 : 0, // 2 retries em CI, 0 localmente

  // O número máximo de workers (processos paralelos) que o Playwright usará.
  workers: process.env.CI ? 1 : undefined, // 1 worker em CI para evitar sobrecarga, undefined (automático) localmente

  // Repórter a ser usado. Veja https://playwright.dev/docs/test-reporters
  reporter: 'html', // Gera um relatório HTML interativo após a execução.

  // Configuração global para o projeto.
  use: {
    // URL base para seus testes. Isso permite usar `await page.goto('/login')` em vez de `await page.goto('http://localhost:3000/login')`.
    baseURL: 'http://localhost:5173', // <-- Mude para a URL e porta do seu frontend!

    // Coleta o trace de cada teste que falhar. Isso é ótimo para depuração.
    // 'on-first-retry' significa que ele será coletado apenas se o teste falhar e for re-tentado.
    trace: 'on-first-retry',

    // Modo headless (sem interface gráfica do navegador) por padrão.
    // Defina como false para ver o navegador durante a execução local.
    // headless: false, // <-- Descomente para ver o navegador localmente

    // Define o fuso horário para os testes (importante para datas).
    // timezoneId: 'America/Sao_Paulo', // Exemplo para o seu fuso horário local

    // Define o idioma para os testes.
    // locale: 'pt-BR',
  },

  /* Configure os projetos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }, // Usa as configurações padrão do Chrome de desktop
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }, // Safari (macOS)
    },

    /* Testes em dispositivos móveis */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Testes em navegadores específicos para CI/CD (se necessário) */
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
  ],

  /* Configurações para um setup global (executado uma vez antes de todos os testes)
   * Use isso para, por exemplo, popular ou limpar seu banco de dados MongoDB para testes.
   * Veja https://playwright.dev/docs/test-global-setup-teardown
   */
  // globalSetup: require.resolve('./tests/global-setup'), // Caminho para um arquivo de setup global
  // globalTeardown: require.resolve('./tests/global-teardown'), // Caminho para um arquivo de teardown global
});