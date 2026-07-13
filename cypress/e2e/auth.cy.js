// Testes de autenticação. Cobrem tanto o caminho feliz quanto os erros mais
// prováveis de acontecer na mão de um usuário real.

describe('Autenticação', () => {
  const timestamp = Date.now();
  const user = {
    name: 'Usuário Autenticação',
    email: `auth.${timestamp}@teste.com`,
    phone: '11988887777',
    password: 'senha123',
    role: 'STUDENT',
  };

  it('a landing page carrega e mostra a chamada principal', () => {
    cy.visit('/');
    cy.contains('Marcar aula').should('be.visible');
    cy.get('[data-cy=hero-register-cta]').should('be.visible');
  });

  it('cadastro com dados válidos leva direto pro dashboard', () => {
    cy.registerUser(user);
    cy.url().should('include', '/app');
    cy.get('[data-cy=dashboard-greeting]').should('contain', user.name);
  });

  it('cadastro com e-mail já usado mostra mensagem de erro', () => {
    cy.registerUser(user); // mesmo e-mail de novo, de propósito
    cy.get('[data-cy=register-error]').should('be.visible');
    cy.url().should('include', '/cadastro'); // não deve navegar pra frente
  });

  it('login com senha errada mostra mensagem de erro', () => {
    cy.loginUser(user.email, 'senha-errada-de-proposito');
    cy.get('[data-cy=login-error]').should('be.visible');
    cy.url().should('include', '/entrar');
  });

  it('login com credenciais corretas funciona', () => {
    cy.loginUser(user.email, user.password);
    cy.url().should('include', '/app');
    cy.get('[data-cy=dashboard-greeting]').should('contain', user.name);
  });

  it('logout volta pra tela de login', () => {
    cy.loginUser(user.email, user.password);
    cy.get('[data-cy=logout-button]').click();
    cy.url().should('include', '/entrar');
  });

  it('acessar /app sem estar logado redireciona pro login', () => {
    cy.visit('/app');
    cy.url().should('include', '/entrar');
  });
});
