// cypress/e2e/register.cy.js
describe('Testes de Registro', () => {
    beforeEach(() => {
        cy.visit('/register')
    })

    it('Deve exibir pedido de preenchimento de campos obrigatórios', () => {
        cy.contains('button', 'Criar Conta').click()

        cy.get('.chakra-alert')
        .should('contain', 'Preencha todos os campos obrigatórios')
        .and('be.visible')
    })

    it('Deve permitir alternar visibilidade da senha', () => {
        cy.get('input[name="password"]')
        .should('have.attr', 'type', 'password')

        cy.contains('button', 'Mostrar').click()
        cy.get('input[name="password"]')
        .should('have.attr', 'type', 'text')

        cy.contains('button', 'Esconder').click()
        cy.get('input[name="password"]')
        .should('have.attr', 'type', 'password')
    })

    it('Deve permitir upload de foto de perfil', () => {
        cy.fixture('avatar.png', 'binary').then((fileContent) => {
            cy.get('[data-cy="upload-file-input"]').selectFile({
                contents: Cypress.Buffer.from(fileContent, 'binary'),
                fileName: 'avatar.png',
                mimeType: 'image/png'
            }, { force: true });
        });

        cy.get('[data-cy="profile-avatar"]')
            .find('img')
            .should('have.attr', 'src')
            .and('not.be.empty');
    })

    it('Deve registrar novo usuário com sucesso', () => {
        cy.intercept('POST', 'http://localhost:5000/api/users/register', { // <--- MUDEI A URL AQUI!
            statusCode: 201,
            body: {
                success: true,
                message: 'Usuário registrado com sucesso'
            }
        }).as('registerRequest');

        const userName = 'Novo Usuário';
        const userEmail = 'novo@usuario2.com';
        const userPassword = 'SenhaSegura123';

        cy.get('input[name="name"]').type(userName)
        cy.get('input[name="email"]').type(userEmail)
        cy.get('input[name="password"]').type(userPassword).should('have.value', userPassword);

        cy.contains('button', 'Criar Conta')
        .should('not.be.disabled')
        .click();

        cy.wait('@registerRequest', { timeout: 10000 }).then(interception => {
            const requestBodyString = interception.request.body;

            expect(requestBodyString).to.be.a('string');
            expect(requestBodyString).to.include(`Content-Disposition: form-data; name="name"\r\n\r\n${userName}`);
            expect(requestBodyString).to.include(`Content-Disposition: form-data; name="email"\r\n\r\n${userEmail}`);
            expect(requestBodyString).to.include(`Content-Disposition: form-data; name="password"\r\n\r\n${userPassword}`);
        });

        cy.get('.chakra-alert')
            .should('contain', 'Usuário registrado com sucesso!')
            .and('be.visible');

        cy.get('input[name="name"]').should('have.value', '');
        cy.get('input[name="email"]').should('have.value', '');
        cy.get('input[name="password"]').should('have.value', '');
    });

    it('Deve mostrar erro de email já cadastrado', () => {
        cy.intercept('POST', 'http://localhost:5000/api/users/register', {
        statusCode: 409,
        body: {
            success: false,
            error: 'Email já cadastrado'
        }
        }).as('registerRequest')

        cy.get('input[name="name"]').type('Usuário Existente')
        cy.get('input[name="email"]').type('existente@email.com')
        cy.get('input[name="password"]').type('Senha123')
        cy.contains('button', 'Criar Conta').click()

        cy.get('.chakra-alert')
        .should('contain', 'Email já cadastrado')
        .and('be.visible')
    })

    it('Deve navegar para página de login', () => {
        cy.contains('Faça login aqui').click()
        cy.location('pathname').should('eq', '/login')
    })
})