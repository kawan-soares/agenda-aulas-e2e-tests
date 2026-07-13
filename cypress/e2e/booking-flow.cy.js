// Fluxo completo: professor cria um horário, aluno vê e reserva, aluno cancela.
// Esse é o caminho de negócio mais importante do sistema — se algo aqui quebrar,
// o produto inteiro perde sentido, então é o teste mais valioso do conjunto.

describe('Fluxo completo de reserva de aula', () => {
  const timestamp = Date.now();
  const teacher = {
    name: `Professor Teste ${timestamp}`,
    email: `professor.${timestamp}@teste.com`,
    phone: '11999990000',
    password: 'senha123',
    role: 'TEACHER',
  };
  const student = {
    name: 'Aluno Teste',
    email: `aluno.${timestamp}@teste.com`,
    phone: '11999991111',
    password: 'senha123',
    role: 'STUDENT',
  };

  it('professor cadastra, faz login e cria um horário disponível', () => {
    cy.registerUser(teacher);
    cy.url().should('include', '/app');
    cy.get('[data-cy=teacher-dashboard]').should('be.visible');

    cy.futureDateTimeLocal(3, 14).then((start) => {
      cy.futureDateTimeLocal(3, 15).then((end) => {
        cy.get('[data-cy=slot-start-time]').type(start);
        cy.get('[data-cy=slot-end-time]').type(end);
        cy.get('[data-cy=create-slot-submit]').click();
      });
    });

    cy.get('[data-cy=my-slots-section]').should('contain', 'livre');
  });

  it('aluno cadastra, vê o horário do professor e reserva', () => {
    cy.registerUser(student);
    cy.url().should('include', '/app');
    cy.get('[data-cy=student-dashboard]').should('be.visible');

    cy.get('[data-cy=available-slots-section]').should('contain', teacher.name);
    cy.contains('[data-cy=available-slots-section] .schedule-item', teacher.name)
      .find('[data-cy=book-slot-button]')
      .click();

    // depois de reservar, o horário sai da lista de disponíveis...
    cy.get('[data-cy=available-slots-section]').should('not.contain', teacher.name);
    // ...e aparece nas reservas do aluno, confirmado
    cy.get('[data-cy=my-bookings-section]').should('contain', teacher.name);
    cy.get('[data-cy=my-bookings-section]').should('contain', 'confirmado');
  });

  it('aluno cancela a reserva e o horário volta a ficar disponível', () => {
    cy.loginUser(student.email, student.password);
    cy.contains('[data-cy=my-bookings-section] .schedule-item', teacher.name)
      .find('[data-cy=cancel-booking-button]')
      .click();
    cy.contains('[data-cy=my-bookings-section] .schedule-item', teacher.name)
      .should('contain', 'cancelado');
  });

  it('depois do cancelamento, o horário aparece disponível de novo pra outros alunos', () => {
    cy.loginUser(teacher.email, teacher.password);
    cy.get('[data-cy=my-slots-section]').should('contain', 'livre');
  });
});
