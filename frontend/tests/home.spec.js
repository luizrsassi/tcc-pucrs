import { test, expect } from '@playwright/test';

const frontendBaseUrl = 'http://localhost:5173';
const backendBaseUrl = 'http://localhost:5000';

test.describe('HomePage', () => {

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
    });

    test('1. Deve redirecionar para a página de login se o token de autenticação não estiver presente', async ({ page }) => {
        await page.evaluate(() => localStorage.clear());
        await page.goto(frontendBaseUrl);
        await expect(page).toHaveURL(`${frontendBaseUrl}/login`);
        await expect(page.locator('h1:has-text("Clubes de Leitura da Comunidade")')).not.toBeVisible();
        await expect(page.locator('input[placeholder="Pesquisar clubes..."]')).not.toBeVisible();
    });

    test('2. Deve exibir o Spinner de carregamento ao carregar os clubes', async ({ page, request }) => {
        
        await page.unroute(`${backendBaseUrl}/api/clubs?*`);

        let responsePromise;

        await page.route(`${backendBaseUrl}/api/clubs?*`, async route => {
            responsePromise = new Promise(resolve => {
                setTimeout(async () => {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            success: true,
                            data: { clubs: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } },
                            message: 'Clubes listados com sucesso!'
                        }),
                    });
                    resolve();
                }, 1000);
            });
        });

        await page.goto('/');

        await expect(page.locator('[data-cy="loading-spinner"]')).toBeVisible();

        await page.waitForResponse(resp =>
            resp.url().includes(`${backendBaseUrl}/api/clubs/?page=1&search=&sortBy=createdAt&sortOrder=desc`) &&
            resp.request().method() === 'GET'
        );

        if (responsePromise) {
            responsePromise;
        }

        await expect(page.locator('[data-cy="loading-spinner"]')).not.toBeVisible();
    });

    test('3. Deve filtrar os clubes com base no termo de busca', async ({ page }) => {
        await page.goto(frontendBaseUrl);

        const searchTerm = 'Clube dos leitores';
        const emptyTerm = '';

        await page.getByRole('textbox', { name: 'Pesquisar clubes...' }).click();
        await page.getByRole('textbox', { name: 'Pesquisar clubes...' }).fill(searchTerm);
        await expect(page.locator('[data-cy="club-card"]')).toHaveCount(1);

        await page.getByRole('textbox', { name: 'Pesquisar clubes...' }).click();
        await page.getByRole('textbox', { name: 'Pesquisar clubes...' }).fill(emptyTerm);
        await expect(page.locator('[data-cy="club-card"]')).toHaveCount(2);
    });
});
