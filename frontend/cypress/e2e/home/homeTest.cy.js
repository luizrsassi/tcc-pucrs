const mockClubs = [
  {
    _id: 'club1',
    name: 'Clube do Livro A',
    description: 'Descrição do Clube A',
    rules: ['Regra 1', 'Regra 2'],
    members: ['memberId1', 'memberId2', 'memberId3', 'memberId4', 'memberId5', 'memberId6', 'memberId7', 'memberId8', 'memberId9', 'memberId10'],
    admin: 'adminId1',
    banner: 'http://localhost:5000/uploads/banner_a.jpg',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    _id: 'club2',
    name: 'Clube do Livro B',
    description: 'Descrição do Clube B',
    rules: [],
    members: ['memberIdA', 'memberIdB', 'memberIdC', 'memberIdD', 'memberIdE'],
    admin: 'adminId2',
    banner: 'http://localhost:5000/uploads/banner_b.jpg',
    createdAt: '2024-02-15T11:00:00Z',
    updatedAt: '2024-02-15T11:00:00Z',
  },
];

describe('HomePage', () => {

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

        cy.intercept('GET', 'http://localhost:5000/api/clubs?*', (req) => {
            const requestedSearchTerm = req.query.search?.toString().toLowerCase() || '';

            if (!requestedSearchTerm) {
                // Resposta para a requisição inicial sem termo de busca
                req.reply({
                    statusCode: 200,
                    body: {
                        success: true,
                        data: {
                            clubs: mockClubs,
                            pagination: { currentPage: 1, totalPages: 1, totalItems: mockClubs.length }
                        },
                        message: 'Clubes listados com sucesso!'
                    },
                    delay: 100
                });
            } else {
                // Resposta para requisições com termo de busca (filtros)
                const filteredClubs = mockClubs.filter(club =>
                    club.name.toLowerCase().includes(requestedSearchTerm) ||
                    (club.description && club.description.toLowerCase().includes(requestedSearchTerm))
                );

                req.reply({
                    statusCode: 200,
                    body: {
                        success: true,
                        data: {
                            clubs: filteredClubs,
                            pagination: {
                                currentPage: 1,
                                totalPages: Math.ceil(filteredClubs.length / 10) || 1,
                                totalItems: filteredClubs.length
                            }
                        },
                        message: 'Clubes filtrados com sucesso!'
                    },
                    delay: 100
                });
            }
        }).as('getClubs');
    });

    

    it('1. Deve redirecionar para a página de login se o token de autenticação não estiver presente', () => {
        cy.clearLocalStorage(); 
        cy.visit('http://localhost:5173/'); 
        cy.url().should('include', '/login');
        cy.contains('h1', 'Clubes de Leitura da Comunidade').should('not.exist');
        cy.get('input[placeholder="Pesquisar clubes..."]').should('not.exist');
    });

    it('2. Deve exibir o Spinner de carregamento ao carregar os clubes', () => {
        cy.intercept('GET', 'http://localhost:5000/api/clubs/**', {
            statusCode: 200,
            body: [],
            delay: 1000
        }).as('getClubs');

        cy.visit('/');

        cy.get('[data-cy="loading-spinner"]').should('be.visible');

        cy.wait('@getClubs');

        cy.get('[data-cy="loading-spinner"]').should('not.exist'); 
    });

    it('3. Deve carregar e exibir a lista de clubes após o carregamento bem-sucedido', () => {

        cy.intercept('GET', 'http://localhost:5000/api/clubs/**', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    clubs: mockClubs,
                    pagination: {
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: mockClubs.length
                    }
                },
                message: 'Clubes listados com sucesso!'
            },
            delay: 100
        }).as('getClubsWithData');

        cy.visit('/');

        cy.wait('@getClubsWithData');

        cy.get('[data-cy="club-card"]').should('have.length', mockClubs.length);

        cy.contains('[data-cy="club-card-title"]', mockClubs[0].name).should('be.visible');
        cy.contains('[data-cy="club-card-description"]', mockClubs[0].description).should('be.visible');

        cy.get('[data-cy="loading-spinner"]').should('not.exist');

        cy.contains('Página 1 de 1').should('be.visible');
        cy.contains('button', 'Anterior').should('be.disabled');
        cy.contains('button', 'Próxima').should('be.disabled');
    });

    // it('4. Deve filtrar e exibir clubes com base no termo de busca', () => {
    //     const searchTerm = 'Livro';

    //     // *** CORREÇÃO AQUI: Ajustado o padrão da URL para corresponder ao que sua app envia ***
    //     cy.intercept('GET', 'http://localhost:5000/api/clubs/**/*', (req) => {
    //         const hasSearchParam = Object.prototype.hasOwnProperty.call(req.query, 'search');
    //         const requestedSearchTerm = req.query.search?.toString().toLowerCase() || '';

    //         // A lógica de `if (!hasSearchParam || requestedSearchTerm === '')`
    //         // ainda é válida para diferenciar a requisição inicial (com page/sort mas sem search)
    //         // da requisição com o termo de busca.
    //         if (!hasSearchParam || requestedSearchTerm === '') {
    //             req.reply({
    //                 statusCode: 200,
    //                 body: {
    //                     success: true,
    //                     data: {
    //                         clubs: mockClubs,
    //                         pagination: { currentPage: 1, totalPages: 1, totalItems: mockClubs.length }
    //                     },
    //                     message: 'Clubes listados com sucesso!'
    //                 },
    //                 delay: 50
    //             });
    //         } else {
    //             const filteredClubs = mockClubs.filter(club =>
    //                 club.name.toLowerCase().includes(requestedSearchTerm) ||
    //                 (club.description && club.description.toLowerCase().includes(requestedSearchTerm))
    //             );
    //             req.reply({
    //                 statusCode: 200,
    //                 body: {
    //                     success: true,
    //                     data: {
    //                         clubs: filteredClubs,
    //                         pagination: {
    //                             currentPage: 1,
    //                             totalPages: Math.ceil(filteredClubs.length / 10) || 1,
    //                             totalItems: filteredClubs.length
    //                         }
    //                     },
    //                     message: 'Clubes filtrados com sucesso!'
    //                 },
    //                 delay: 100
    //             });
    //         }
    //     }).as('getClubsFiltered');

    //     cy.visit('/');

    //     // O `cy.wait` agora deve corresponder, pois o interceptor é mais abrangente.
    //     // A asserção deve verificar a ausência do *parâmetro* 'search',
    //     // e não apenas que 'search=' não está na URL, porque outros parâmetros estarão lá.
    //     cy.wait('@getClubsFiltered')
    //         .its('request.query') // Pega o objeto de query parameters da requisição
    //         .should('have.property', 'search', ''); // Verifica se tem a propriedade 'search' e se seu valor é uma string vazia

    //     cy.log('Após a primeira requisição de clubes.');
    //     // cy.debug();

    //     cy.get('input[placeholder="Pesquisar clubes..."]').type(searchTerm);

    //     // A segunda asserção (para a busca) permanece a mesma e é mais robusta:
    //     cy.wait('@getClubsFiltered')
    //     .its('request.query')
    //     .should('have.property', 'search', searchTerm.toLowerCase());

    //     cy.log('Após a requisição de busca de clubes.');

    //     const expectedClubs = mockClubs.filter(club =>
    //         club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase()))
    //     );

    //     cy.get('[data-cy="club-card"]').should('have.length', expectedClubs.length);

    //     expectedClubs.forEach(club => {
    //         cy.contains('[data-cy="club-card-title"]', club.name).should('be.visible');
    //     });

    //     const nonMatchingClub = mockClubs.find(club =>
    //         !club.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    //         (!club.description || !club.description.toLowerCase().includes(searchTerm.toLowerCase()))
    //     );
    //     if (nonMatchingClub) {
    //         cy.contains('[data-cy="club-card-title"]', nonMatchingClub.name).should('not.exist');
    //     }

    //     cy.get('[data-cy="loading-spinner"]').should('not.exist');
    // });

   
});