import 'cypress-file-upload';

describe('Página de Criação de Clube via Perfil', () => {

    beforeEach(() => {
        cy.clearLocalStorage();

        cy.request('POST', 'http://localhost:5000/api/users/login', {
            email: 'joao@example.com',
            password: 'senha123'
        }).then((response) => {
            const realToken = response.body.token;
            cy.window().then((win) => {
                win.localStorage.setItem('token', realToken);
            });
        });

        cy.intercept('GET', 'http://localhost:5000/uploads/**/*.jpg', {
            statusCode: 200,
            body: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        }).as('mockBannerImage');

        cy.visit('/profile');
        cy.url().should('include', '/profile');

        cy.contains('button[role="tab"]', 'Clubes').click();

        
    });

    it('2.1. Deve abrir o modal de criação de clube e exibir os campos do formulário corretamente', () => {
        
        cy.get('button').contains('Criar Clube').click();
        cy.contains('Criar Novo Clube').should('be.visible');

        cy.get('label').contains('Imagem de Capa').should('be.visible');
        cy.get('[data-cy="banner"]').should('be.visible');

        cy.get('label').contains('Nome do Clube').should('be.visible');
        cy.get('[data-cy="club-name"]').should('be.visible');

        cy.get('label').contains('Descrição').should('be.visible');
        cy.get('[data-cy="club-description"]').should('be.visible');
        
        cy.get('[data-cy="create-button"]').contains('Criar Clube').should('be.visible').and('be.enabled');
        cy.get('[data-cy="cancel-button"]').contains('Cancelar').should('be.visible');
    });


    it('2.2. Deve criar um novo clube com sucesso preenchendo o formulário', () => {
        
        cy.get('button').contains('Criar Clube').click();
        cy.contains('Criar Novo Clube').should('be.visible');

        const clubName = 'Clube de Teste' + Date.now();
        const clubDescription = 'Esta é uma descrição de teste para o novo clube criado pelo Cypress.';
        const fileName = 'test-banner.webp';

        cy.fixture('test-banner.webp', 'base64').then(fileContent => {
            cy.get('[data-cy="banner"]').attachFile({
                fileContent: fileContent,
                fileName: fileName,
                mimeType: 'image/webp'
            });
        });

        cy.intercept('POST', 'http://localhost:5000/api/clubs/create', (req) => {
            
            req.reply({
                statusCode: 201,
                body: {
                    message: 'Clube criado com sucesso!',
                    club: {
                        _id: 'mockClubId' + Date.now(),
                        name: clubName,
                        description: clubDescription,
                        banner: 'path/to/mocked/banner.jpg',
                        owner: 'joao@example.com'
                    }
                },
            });
        }).as('createClub');

        cy.get('[data-cy="club-name"]').type(clubName);

        cy.get('[data-cy="club-description"]').type(clubDescription);

        cy.get('[data-cy="create-button"]').contains('Criar Clube').click();

        cy.wait('@createClub');

        cy.contains('Criar Novo Clube').should('not.exist');

    });

    it('2.3. Deve atualizar os dados de um clube existente com sucesso', () => {
        const updatedClubName = 'Clube Editado Cypress ' + Date.now();
        const updatedClubDescription = 'Esta é a descrição atualizada para o clube.';
        const updatedFileName = 'new-banner.png'; // Supondo um novo arquivo para upload, se aplicável

        // 1. Clicar no clube para abri-lo (assumindo que clicar no nome abre o modal de edição ou a página de detalhes com botão de edição)
        cy.get('[data-cy="club-list"]').contains(createdClubName).click(); // Assumindo que a lista está visível e o nome é clicável

        // Se clicar no nome abre uma página de detalhes e lá tem um botão de editar:
        // cy.get('[data-cy="edit-club-button"]').click();

        // 2. Verificar se o modal/página de edição está visível
        cy.contains('Editar Clube').should('be.visible'); // Adapte para o título do seu modal/página de edição

        // 3. Preencher os campos com os novos dados
        cy.get('[data-cy="club-name"]').clear().type(updatedClubName); // Limpa e digita o novo nome
        cy.get('[data-cy="club-description"]').clear().type(updatedClubDescription); // Limpa e digita a nova descrição

        // Opcional: Upload de uma nova imagem (se for permitido e necessário para o teste)
        // Certifique-se de ter 'new-banner.png' em cypress/fixtures/images/
        // cy.fixture('images/new-banner.png', 'base64').then(fileContent => {
        //     cy.get('[data-cy="banner"]').attachFile({
        //         fileContent: fileContent,
        //         fileName: updatedFileName,
        //         mimeType: 'image/png'
        //     });
        // });

        cy.intercept('PUT', `http://localhost:5000/api/clubs/${createdClubId}`, (req) => {
            
            req.reply({
                statusCode: 200, // Status 200 ou 204 para sucesso de atualização
                body: {
                    message: 'Clube atualizado com sucesso!',
                    club: {
                        _id: createdClubId,
                        name: updatedClubName,
                        description: updatedClubDescription,
                        banner: 'path/to/updated/banner.jpg',
                        owner: 'joao@example.com'
                    }
                },
            });
        }).as('updateClub');

        // 5. Clicar no botão de salvar/atualizar
        cy.get('[data-cy="save-changes-button"]').contains('Salvar Alterações').click(); // Adapte o texto do botão

        // 6. Esperar a requisição de atualização ser finalizada
        cy.wait('@updateClub');

        // 7. Asserções após a atualização:
        // 7.1. Verificar se o modal/página de edição foi fechado
        cy.contains('Editar Clube').should('not.exist'); // Assumindo que o modal fecha

        // 7.2. Verificar se o nome do clube na lista foi atualizado
        // Pode ser necessário recarregar a página ou navegar de volta para a lista,
        // se a atualização não for reativa na UI.
        cy.reload(); // Para garantir que a lista seja recarregada com os novos dados
        cy.contains('button[role="tab"]', 'Clubes').click(); // Re-seleciona a aba Clubes após o reload

        cy.get('[data-cy="club-list"]').should('contain', updatedClubName);
        cy.get('[data-cy="club-list"]').should('not.contain', initialClubName); // Verifica que o nome antigo sumiu
    });

});