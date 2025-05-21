describe('Testes de Login', () => {
    beforeEach(() => {
        cy.visit('/login')
    })

    it('Deve exibir validação de campos obrigatórios', () => {
        cy.get('[data-cy="submit-button"]').click()
        cy.contains('button', 'Entrar').click()

        cy.get('[data-cy="email-input"]').then(($input) => {
        expect($input[0].validationMessage).to.contain('Preencha este campo.')
        })
        
        cy.get('[data-cy="password-input"]').then(($input) => {
        expect($input[0].validationMessage).to.contain('Preencha este campo.')
        })
    })

    it('Deve permitir alternar visibilidade da senha', () => {
        cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'password')
        
        cy.get('[data-cy="submit-button"]').click()
        cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'text')
        
        cy.get('[data-cy="submit-button"]').click()
        cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'password')
    })

    it('Deve mostrar erro de credenciais inválidas', () => {
        cy.get('[data-cy="email-input"]').type('email@invalido.com')
        cy.get('[data-cy="password-input"]').type('senhaerrada')
        
        cy.contains('button', 'Entrar').click()

        cy.get('.chakra-alert')
        .should('contain', 'Login ou senha incorretos.')
        .and('be.visible')

        cy.contains('Entrando...').should('not.exist')
        cy.get('[data-cy="submit-button"]').should('be.enabled')
    })

    it('Deve realizar login com sucesso', () => {
        cy.get('[data-cy="email-input"]').type('joao@example.com')
        cy.get('[data-cy="password-input"]').type('senha123')
        cy.contains('button', 'Entrar').click()

        cy.get('.chakra-alert').should('contain', 'Login realizado com sucesso!')
        cy.location('pathname').should('eq', '/')
    })

    it('Deve navegar para página de registro', () => {
        cy.contains('Registre-se').click()
        cy.location('pathname').should('eq', '/register')
    })

})
