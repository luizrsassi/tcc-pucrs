import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

test.describe('Testes de Registro', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/register');
    });

    test('Deve exibir pedido de preenchimento de campos obrigatórios', async ({ page }) => {
        await page.click('button:has-text("Criar Conta")');

        const chakraAlert = page.locator('.chakra-alert');
        await expect(chakraAlert).toBeVisible();
        await expect(chakraAlert).toContainText('Preencha todos os campos obrigatórios');
    });

    test('Deve permitir alternar visibilidade da senha', async ({ page }) => {
        const passwordInput = page.locator('input[name="password"]');
        const showButton = page.locator('button:has-text("Mostrar")');
        const hideButton = page.locator('button:has-text("Esconder")');

        await expect(passwordInput).toHaveAttribute('type', 'password');

        await showButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');

        await hideButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('Deve permitir upload de foto de perfil', async ({ page }) => {
        // Define o diretório atual do arquivo de teste em ambiente ESM
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);

        const filePath = path.resolve(__dirname, '../../uploads/test-img', 'avatar.png');

        await page.setInputFiles('[data-cy="upload-file-input"]', filePath);

        const profileAvatarImg = page.locator('[data-cy="profile-avatar"] img');
        await expect(profileAvatarImg).toHaveAttribute('src', /^(?!$)/);
    });

    test('Deve registrar novo usuário com sucesso', async ({ page }) => {
        const userName = 'Novo Usuário Playwright';
        const userEmail = `novo${Date.now()}@usuario.com`;
        const userPassword = 'SenhaSegura123';
        const registerApiUrl = 'http://localhost:5000/api/users/register';

        await page.route(registerApiUrl, async route => {
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    message: 'Usuário registrado com sucesso'
                }),
            });
        });

        await page.fill('input[name="name"]', userName);
        await page.fill('input[name="email"]', userEmail);
        await page.fill('input[name="password"]', userPassword);
        
        await expect(page.locator('input[name="password"]')).toHaveValue(userPassword);

        const createAccountButton = page.locator('button:has-text("Criar Conta")');
        await expect(createAccountButton).toBeEnabled();
        await createAccountButton.click();

        const chakraAlertSuccess = page.locator('.chakra-alert');
        await expect(chakraAlertSuccess).toBeVisible();
        await expect(chakraAlertSuccess).toContainText('Usuário registrado com sucesso!');

        await expect(page.locator('input[name="name"]')).toHaveValue('');
        await expect(page.locator('input[name="email"]')).toHaveValue('');
        await expect(page.locator('input[name="password"]')).toHaveValue('');
    });

    test('Deve mostrar erro de email já cadastrado', async ({ page }) => {
        const registerApiUrl = 'http://localhost:5000/api/users/register';

        await page.route(registerApiUrl, async route => {
            await route.fulfill({
                status: 409, // Conflito
                contentType: 'application/json',
                body: JSON.stringify({
                    success: false,
                    error: 'Email já cadastrado'
                }),
            });
        });

        await page.fill('input[name="name"]', 'Usuário Existente');
        await page.fill('input[name="email"]', 'existente@email.com');
        await page.fill('input[name="password"]', 'Senha123');
        await page.click('button:has-text("Criar Conta")');

        const chakraAlertError = page.locator('.chakra-alert');
        await expect(chakraAlertError).toBeVisible();
        await expect(chakraAlertError).toContainText('Email já cadastrado');
    });

    test('Deve navegar para página de login', async ({ page }) => {
        
        await page.click('text=Faça login aqui');
        
        await expect(page).toHaveURL('/login');
    });
});