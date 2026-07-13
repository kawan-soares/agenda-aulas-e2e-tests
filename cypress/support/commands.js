// Comandos reutilizáveis entre os testes.
// Centralizar aqui evita repetir o mesmo fluxo de cadastro/login em cada spec.

/**
 * Gera uma string de data/hora futura no formato aceito pelo <input type="datetime-local">
 * (ex: "2027-01-15T10:00"). O backend exige que o horário seja no futuro (@Future),
 * então nunca usamos uma data fixa — sempre relativa ao momento em que o teste roda.
 */
function futureDateTimeLocal(daysFromNow, hour) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
Cypress.Commands.add('futureDateTimeLocal', futureDateTimeLocal);

/**
 * Cadastra um novo usuário pela interface (não via API direto) — de propósito,
 * pra validar o fluxo real que o usuário final passa, não só o endpoint isolado.
 */
Cypress.Commands.add('registerUser', ({ name, email, phone, password, role }) => {
  cy.visit('/cadastro');
  cy.get('[data-cy=register-name]').type(name);
  cy.get('[data-cy=register-email]').type(email);
  cy.get('[data-cy=register-phone]').type(phone);
  cy.get('[data-cy=register-password]').type(password);
  cy.get('[data-cy=register-role]').select(role);
  cy.get('[data-cy=register-submit]').click();
});

/** Faz login pela interface com um usuário já existente. */
Cypress.Commands.add('loginUser', (email, password) => {
  cy.visit('/entrar');
  cy.get('[data-cy=login-email]').type(email);
  cy.get('[data-cy=login-password]').type(password);
  cy.get('[data-cy=login-submit]').click();
});

/** Gera um e-mail único por execução, pra não colidir com o índice único do banco. */
Cypress.Commands.add('uniqueEmail', (prefix = 'user') => {
  const stamp = Date.now();
  return cy.wrap(`${prefix}.${stamp}@teste.com`);
});
