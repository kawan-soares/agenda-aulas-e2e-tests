// Esse arquivo testa direto na API (não pela interface), do mesmo jeito que
// se faria com Postman ou Karate — útil pra validar regra de negócio crítica
// de forma rápida e sem depender de renderização de tela.
//
// Regra testada: o backend NUNCA pode deixar dois alunos reservarem o mesmo
// horário. É a garantia mais importante do sistema inteiro.

const API_URL = 'http://localhost:8080';

describe('Regra de negócio: impedir reserva duplicada (via API)', () => {
  const timestamp = Date.now();
  const teacher = {
    name: `Professor API ${timestamp}`,
    email: `professor.api.${timestamp}@teste.com`,
    phone: '11977776666',
    password: 'senha123',
    role: 'TEACHER',
  };
  const studentA = {
    name: 'Aluno A',
    email: `aluno.a.${timestamp}@teste.com`,
    phone: '11977775555',
    password: 'senha123',
    role: 'STUDENT',
  };
  const studentB = {
    name: 'Aluno B',
    email: `aluno.b.${timestamp}@teste.com`,
    phone: '11977774444',
    password: 'senha123',
    role: 'STUDENT',
  };

  let teacherToken;
  let studentAToken;
  let studentBToken;
  let availabilityId;

  it('prepara os três usuários e um horário disponível', () => {
    cy.request('POST', `${API_URL}/api/auth/register`, teacher).then((res) => {
      teacherToken = res.body.token;

      const start = new Date();
      start.setDate(start.getDate() + 5);
      start.setHours(10, 0, 0, 0);
      const end = new Date(start);
      end.setHours(11, 0, 0, 0);

      cy.request({
        method: 'POST',
        url: `${API_URL}/api/availability`,
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: { startTime: start.toISOString(), endTime: end.toISOString() },
      }).then((slotRes) => {
        availabilityId = slotRes.body.id;
        expect(slotRes.body.status).to.eq('AVAILABLE');
      });
    });

    cy.request('POST', `${API_URL}/api/auth/register`, studentA).then((res) => {
      studentAToken = res.body.token;
    });
    cy.request('POST', `${API_URL}/api/auth/register`, studentB).then((res) => {
      studentBToken = res.body.token;
    });
  });

  it('aluno A consegue reservar o horário normalmente', () => {
    cy.request({
      method: 'POST',
      url: `${API_URL}/api/bookings`,
      headers: { Authorization: `Bearer ${studentAToken}` },
      body: { availabilityId },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.status).to.eq('CONFIRMED');
    });
  });

  it('aluno B NÃO consegue reservar o mesmo horário — backend deve recusar', () => {
    cy.request({
      method: 'POST',
      url: `${API_URL}/api/bookings`,
      headers: { Authorization: `Bearer ${studentBToken}` },
      body: { availabilityId },
      failOnStatusCode: false, // esperamos um erro de propósito aqui
    }).then((res) => {
      expect(res.status).to.eq(409); // Conflict
      expect(res.body.message).to.include('já foi reservado');
    });
  });

  it('aluno B também não consegue cancelar a reserva do aluno A', () => {
    cy.request({
      method: 'GET',
      url: `${API_URL}/api/bookings/me`,
      headers: { Authorization: `Bearer ${studentAToken}` },
    }).then((res) => {
      const bookingId = res.body[0].id;

      cy.request({
        method: 'DELETE',
        url: `${API_URL}/api/bookings/${bookingId}`,
        headers: { Authorization: `Bearer ${studentBToken}` },
        failOnStatusCode: false,
      }).then((cancelRes) => {
        expect(cancelRes.status).to.eq(409);
      });
    });
  });
});
