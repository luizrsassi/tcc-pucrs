import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendBaseUrl = 'http://localhost:5173';
const backendBaseUrl = 'http://localhost:5000';

test.describe.serial('Página de Criação de Clube via Perfil', () => {
    let clubName = ''
    test.beforeEach('Fazer login', async ({ page, request }) => {
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
    });
    
    test('Criar o clube de teste', async({page}) => {
        await page.goto(`${frontendBaseUrl}/profile`);   
        await expect(page).toHaveURL(/.*\/profile/);
        await page.getByRole('tab', { name: 'Clubes' }).click();

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

        // await expect(page.getByText('Criar Novo Clube')).not.toBeVisible();
        // await expect(page.getByText('Clube criado com sucesso!')).toBeVisible();

        // await page.getByRole('button', { name: 'Sair' }).click();
    });

    test('Deve criar um encontro para o clube de teste', async ({page}) => {
        await page.goto(frontendBaseUrl, { waitUntil: 'load' });

        await page.getByRole('link', { name: clubName }).click();
        await page.getByRole('button', { name: 'Novo Encontro' }).click();
        await page.getByRole('textbox', { name: 'Título' }).click();
        await page.getByRole('textbox', { name: 'Título' }).fill('Encontro teste');
        await page.getByLabel('Livro*').selectOption('67eec88f849761d630577494');
        await page.getByRole('textbox', { name: 'Descrição' }).click();
        await page.getByRole('textbox', { name: 'Descrição' }).fill('Descrição do encontro teste');
        await page.getByRole('textbox', { name: 'Localização' }).click();
        await page.getByRole('textbox', { name: 'Localização' }).fill('Local: teste');
        await page.getByRole('textbox', { name: 'Data e Horário' }).click();
        await page.getByRole('textbox', { name: 'Data e Horário' }).fill('2050-05-19T19:00');
        await page.getByRole('button', { name: 'Criar Encontro' }).click();

        const successAlert = page.locator('.chakra-alert');
        await expect(successAlert).toContainText('Encontro criado!');
    });

    test('Deve editar o encontro de teste', async ({page}) => {
        await page.goto(frontendBaseUrl);

        await page.getByRole('link', { name: clubName }).click();

        await expect(page.getByRole('link', { name: 'AGENDADO Clube de Teste' })).toBeVisible();
        
        await page.getByRole('button', { name: 'Editar encontro' }).click();
        await page.getByRole('textbox', { name: 'Título' }).click();
        await page.getByRole('textbox', { name: 'Título' }).fill('Novo encontro de teste');
        await page.getByRole('textbox', { name: 'Descrição' }).click();
        await page.getByRole('textbox', { name: 'Descrição' }).fill('Nova descrição');
        await page.getByRole('button', { name: 'Salvar Alterações' }).click();

        const successAlert = page.locator('.chakra-alert');
        await expect(successAlert).toContainText('Encontro atualizado!');
    });

    test('Deve comentar na página do encontro teste', async ({page}) => {
        await page.goto(frontendBaseUrl);

        await page.getByRole('link', { name: clubName }).click();

        await expect(page.getByRole('link', { name: 'AGENDADO Clube de Teste' })).toBeVisible();
        
        await page.getByRole('link', { name: 'AGENDADO Clube de Teste' }).click();

        await page.getByRole('textbox', { name: 'Adicione seu comentário...' }).click();
        await page.getByRole('textbox', { name: 'Adicione seu comentário...' }).fill('Comentário de teste.');
        await page.getByRole('button', { name: 'Enviar' }).click();

        const successAlert = page.locator('.chakra-alert');
        await expect(successAlert).toContainText('Mensagem enviada!');
    });

    test('Deve deletar o encontro teste', async ({page}) => {
        await page.goto(frontendBaseUrl);

        await page.getByRole('link', { name: clubName }).click();

        await expect(page.getByRole('link', { name: 'AGENDADO Clube de Teste' })).toBeVisible();

        await page.getByRole('button', { name: 'Deletar encontro' }).click();
        await page.getByRole('button', { name: 'Excluir' }).click();

        const successAlert = page.locator('.chakra-alert');
        await expect(successAlert).toContainText('Encontro excluído!');
    });

    test('Deve deletar o clube de teste', async ({page}) => {
        await page.goto(`${frontendBaseUrl}/profile`);   
        await expect(page).toHaveURL(/.*\/profile/);
        await page.getByRole('tab', { name: 'Clubes' }).click();

        await expect(page.locator('div').filter({ hasText: 'Clube de Teste Playwright' }).last()).toBeVisible();
        await page.locator('div').filter({ hasText: 'Clube de Teste Playwright' }).last().getByLabel('Excluir clube').click();
        await page.getByRole('button', { name: 'Excluir' }).click();
        await page.getByRole('button', { name: 'Sair' }).click();
    });
   
});