# Agenda Aulas — Testes E2E (Cypress)

Suíte de testes automatizados do [Agenda Aulas](https://github.com/kawan-soares/agenda-aulas-backend),
cobrindo autenticação, cadastro, criação de horários e o fluxo completo de reserva de aula —
incluindo a regra de negócio mais crítica do sistema: **impedir que dois alunos reservem o mesmo horário.**

## Por que esse repositório existe

Testar a própria aplicação, com um processo real de QA (não só "escrever código bonito"), é a
melhor forma de provar experiência com automação de testes: cenários pensados a partir de como o
usuário realmente usa o sistema, não só os caminhos óbvios.

## O que está coberto

| Arquivo | O que testa |
|---|---|
| `auth.cy.js` | Cadastro, login, logout, e-mail duplicado, senha errada, rota protegida sem login |
| `booking-flow.cy.js` | Fluxo completo pela interface: professor cria horário → aluno reserva → aluno cancela → horário volta a ficar livre |
| `business-rules-api.cy.js` | Testa direto na API (como se fosse Postman/Karate): impede reserva duplicada do mesmo horário, mesmo em condição de corrida entre dois alunos |

## Como rodar

### Pré-requisitos

O **backend** e o **frontend** do Agenda Aulas precisam estar rodando localmente antes de rodar os testes:

```bash
# Terminal 1 — backend (porta 8080)
cd agenda-aulas
mvn spring-boot:run

# Terminal 2 — frontend (porta 5173)
cd agenda-aulas-frontend
npm install
npm run dev
```

### Instalar e rodar os testes

```bash
npm install
npm run cy:open    # abre a interface visual do Cypress (recomendado pra explorar)
# ou
npm run cy:run     # roda tudo direto no terminal, sem abrir navegador
```

## Decisões de teste que valem explicar

- **`data-cy` em vez de classe CSS ou texto** — os seletores usados nos testes (`[data-cy=...]`)
  foram adicionados de propósito nos componentes React, separados de estilo e de texto visível.
  Isso evita que uma mudança de design ou de copy quebre o teste sem motivo real.
- **E-mails únicos por execução** (`Date.now()`) — permite rodar a suíte várias vezes seguidas
  sem esbarrar na regra de e-mail único do banco.
- **Teste de regra de negócio direto na API** — o cenário de reserva duplicada é testado sem
  passar pela interface, porque o que importa validar ali é a garantia do banco de dados/backend,
  não a tela. Testar pela UI nesse caso só deixaria o teste mais lento e mais frágil.

## Próximos passos possíveis

- Rodar essa suíte automaticamente a cada push via GitHub Actions (CI)
- Adicionar testes de acessibilidade básica (cypress-axe)
- Testes de carga simples na API de disponibilidade (k6 ou Artillery)
