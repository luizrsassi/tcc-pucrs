import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendBaseUrl = 'http://localhost:5173';
const backendBaseUrl = 'http://localhost:5000';
let clubName = ''

test.describe.serial('Página de Criação de Clube via Perfil', () => {
    
    test.beforeEach(async ({ page, request }) => {
        await page.goto(frontendBaseUrl);
        await page.evaluate(() => localStorage.clear());

        const loginResponse = await request.post(`${backendBaseUrl}/api/users/login`, {
            data: {
                email: 'joao@example.com',
                password: 'senha123'
            }
        });
        const loginBody = await loginResponse.json();
        const realToken = loginBody.token;

        await page.evaluate(token => {
            localStorage.setItem('token', token);
        }, realToken);

        await page.goto(`${frontendBaseUrl}/profile`);   
        await expect(page).toHaveURL(/.*\/profile/);
        await page.getByRole('tab', { name: 'Clubes' }).click();
    });

    test('1. Deve abrir o modal de criação de clube e exibir os campos do formulário corretamente', async ({ page }) => {
        
        await page.getByRole('button', { name: 'Criar Clube', exact: true }).click();
        
        await expect(page.getByText('Criar Novo Clube')).toBeVisible();

        await expect(page.getByLabel('Imagem de Capa')).toBeVisible();
        await expect(page.locator('[data-cy="banner"]')).toBeVisible();

        await expect(page.getByLabel('Nome do Clube')).toBeVisible();
        await expect(page.locator('[data-cy="club-name"]')).toBeVisible();

        await expect(page.getByLabel('Descrição')).toBeVisible();
        await expect(page.locator('[data-cy="club-description"]')).toBeVisible();
        
        await expect(page.locator('[data-cy="create-button"]')).toHaveText('Criar Clube');
        await expect(page.locator('[data-cy="create-button"]')).toBeEnabled();
        
        await expect(page.locator('[data-cy="cancel-button"]')).toHaveText('Cancelar');
        await expect(page.locator('[data-cy="cancel-button"]')).toBeVisible();

        await page.getByRole('button', { name: 'Cancelar' }).click();
        await page.getByRole('button', { name: 'Sair' }).click();
    });

    test('2. Deve criar um novo clube com sucesso preenchendo o formulário', async ({ page }) => {
        await page.getByRole('button', { name: 'Criar Clube', exact: true }).click();
        await expect(page.getByText('Criar Novo Clube')).toBeVisible();

        clubName = 'Clube de Teste Playwright ' + Date.now();
        const clubDescription = 'Esta é uma descrição de teste para o novo clube criado pelo Playwright.';
        const rule1 = 'Regra número 1 para o clube de teste.';
        const rule2 = 'Regra número 2, também importante.';
        const fileName = 'test-banner.webp';
        const filePath = path.join(__dirname, '../../uploads/test-img/', fileName);

        await page.locator('[data-cy="banner"]').setInputFiles(filePath);

        await page.locator('[data-cy="club-name"]').fill(clubName);

        await page.locator('[data-cy="club-description"]').fill(clubDescription);

        await page.getByRole('textbox', { name: 'Regras do Clube' }).fill(rule1);
        
        await page.getByRole('button', { name: 'Adicionar Regra' }).click();
        await page.getByRole('textbox', { name: 'Regra #' }).click();
        await page.getByRole('textbox', { name: 'Regra #' }).fill(rule2);

        await page.locator('[data-cy="create-button"]').getByText('Criar Clube').click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('Criar Novo Clube')).not.toBeVisible();
        await expect(page.getByText('Clube criado com sucesso!')).toBeVisible();

        await page.getByRole('button', { name: 'Sair' }).click();
    });

    test('3. Deve editar o clube criado anteriormente.', async ({page}) => {
        await page.waitForLoadState('networkidle');
        await expect(page.locator('div').filter({ hasText: clubName }).last()).toBeVisible();
        await page.locator('div').filter({ hasText: 'Clube de Teste Playwright' }).last().getByLabel('Editar clube').click();        
        await page.getByRole('textbox', { name: 'Nome do Clube' }).click();
        await page.getByRole('textbox', { name: 'Nome do Clube' }).fill('Clube de Teste Playwright' + Date.now());
        await page.getByRole('textbox', { name: 'Descrição' }).click();
        await page.getByRole('textbox', { name: 'Descrição' }).fill('Esta é uma descrição editada.');
        await page.getByRole('button', { name: 'Adicionar Regra' }).click();
        await page.getByRole('textbox', { name: 'Regras do Clube' }).click();
        await page.getByRole('textbox', { name: 'Regras do Clube' }).fill('regra 1');
        await page.getByRole('button', { name: 'Adicionar Regra' }).click();
        await page.getByRole('textbox', { name: 'Regra #' }).click();
        await page.getByRole('textbox', { name: 'Regra #' }).fill('regra 2');
        await page.getByRole('button', { name: 'Salvar Alterações' }).click();
    });

    test('4. Deve deletar o clube com o nome "Clube de Teste Playwright"', async ({page}) => {
        await page.waitForLoadState('networkidle');
        await expect(page.locator('div').filter({ hasText: 'Clube de Teste Playwright' }).last()).toBeVisible();
        await page.locator('div').filter({ hasText: 'Clube de Teste Playwright' }).last().getByLabel('Excluir clube').click();
        await page.getByRole('button', { name: 'Excluir' }).click();
        await page.getByRole('button', { name: 'Sair' }).click();
    });
   
});