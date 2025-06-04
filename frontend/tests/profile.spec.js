import { test, expect } from '@playwright/test';

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max); 
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

test.describe.serial('Testes de criação e edição de usuários', () => {

    const userName = 'Novo Usuário Playwright' + Date.now();
    const newName = 'Nome atualizado'
    const userEmail = `novousuario${getRandomIntInclusive(1, 100)}@usuario.com`;
    const newEmail = `mariag${getRandomIntInclusive(1, 100)}1@gmail.com`
    const userPassword = 'SenhaSegura123';

    test('1. Criar novo usuário', async ({ page }) => {
        await page.goto('/register');
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

    test('2. Editar novo usuário', async ({ page }) => {
        await page.goto('/login');
        await page.fill('[data-cy="email-input"]', userEmail);
        await page.fill('[data-cy="password-input"]', userPassword);
        await page.click('button:has-text("Entrar")');

        const successAlert = page.locator('.chakra-alert');
        await expect(successAlert).toContainText('Login realizado com sucesso!');

        await expect(page).toHaveURL('/');
        
        await page.goto('/profile');   
        await expect(page).toHaveURL(/.*\/profile/);
        await page.getByRole('textbox', { name: 'Nome completo' }).click();
        await page.getByRole('textbox', { name: 'Nome completo' }).fill(newName);
        await page.getByRole('textbox', { name: 'E-mail' }).click();
        await page.getByRole('textbox', { name: 'E-mail' }).fill(newEmail);

        await page.getByRole('button', { name: 'Salvar Alterações' }).click();
        
        const chakraAlertSuccess = page.locator('.chakra-alert');
        await expect(chakraAlertSuccess).toBeVisible();
        await expect(chakraAlertSuccess).toContainText('Perfil atualizado com sucesso!');

        await page.getByRole('button', { name: 'Sair' }).click();
    });

    test('3. Excluir novo usuário', async ({ page }) => {

        await page.goto('/login');
        await page.fill('[data-cy="email-input"]', newEmail);
        await page.fill('[data-cy="password-input"]', userPassword);
        await page.click('button:has-text("Entrar")');


        const successAlert = page.locator('.chakra-alert');
        await expect(successAlert).toContainText('Login realizado com sucesso!');

        await expect(page).toHaveURL('/');
        
        await page.goto('/profile');   
        await expect(page).toHaveURL(/.*\/profile/);

        await page.getByRole('button', { name: 'Excluir Perfil' }).click();
        await page.getByRole('button', { name: 'Excluir' }).click();
        
        const chakraAlertSuccess = page.locator('.chakra-alert');
        await expect(chakraAlertSuccess).toBeVisible();
        await expect(chakraAlertSuccess).toContainText('Conta excluídaSua conta foi removida com sucesso');
    });
});