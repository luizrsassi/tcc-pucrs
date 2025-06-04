import { test, expect } from '@playwright/test';

test.describe.serial('Testes de Login', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login', { waitUntil: 'networkidle' });
    });

    test('Deve permitir alternar visibilidade da senha', async ({ page }) => {
        const passwordInput = page.locator('[data-cy="password-input"]');
        const submitButton = page.locator('[data-cy="submit-button"]'); 

        await expect(passwordInput).toHaveAttribute('type', 'password');

        await submitButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');

        await submitButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('Deve mostrar erro de credenciais inválidas', async ({ page }) => {
        await page.fill('[data-cy="email-input"]', 'email@invalido.com');
        await page.fill('[data-cy="password-input"]', 'senhaerrada');

        await page.click('button:has-text("Entrar")');

        const errorAlert = page.locator('.chakra-alert');
        await expect(errorAlert).toContainText('Login ou senha incorretos.');
        await expect(errorAlert).toBeVisible();

        await expect(page.locator('text=Entrando...')).not.toBeVisible();
        
        await expect(page.locator('[data-cy="submit-button"]')).toBeEnabled();
    });

    test('Deve realizar login com sucesso', async ({ page }) => {
        await page.fill('[data-cy="email-input"]', 'joao@example.com');
        await page.fill('[data-cy="password-input"]', 'senha123');
        await page.click('button:has-text("Entrar")');

        const successAlert = page.locator('.chakra-alert');
        await expect(successAlert).toContainText('Login realizado com sucesso!');

        await expect(page).toHaveURL('/');
    });

    test('Deve navegar para página de registro', async ({ page }) => {
        await page.click('text=Registre-se');
        await expect(page).toHaveURL('/register');
    });
});