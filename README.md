# 🧪 Automação de Testes (E2E + API) — Sistema de Reservas

Projeto de portfólio focado em **automação de testes** para uma aplicação de **Sistema de Reservas**, validando:

- ✅ **Back-end (API)**: endpoints de autenticação e usuários (com validação de contrato/respostas)
- ✅ **Validação em Banco (PostgreSQL)**: conferência de persistência de dados (API + DB)
- 🔜 **Front-end (E2E)**: será adicionado após a suíte de API estar sólida (Page Objects)

A automação foi construída utilizando **Playwright como ferramenta única** (API + UI), com foco em boas práticas, organização e **relatórios com evidências (Attachments)**.

---

## 🚀 Stack

- **Playwright Test** (API testing + futuramente E2E)
- **TypeScript**
- **Node.js**
- **Relatórios**: HTML Report + **Attachments** (request/response/query/resultado do DB)

> App testada (dependência externa do projeto de testes): **Node/Express + Prisma + PostgreSQL**

---

## ✅ O que este projeto já cobre (estado atual)

### API
- Cadastro de usuário: `POST /auth/registro`
  - validações de campos (tipo obrigatório, tipo inválido, email inválido)
  - bloqueio de email duplicado
  - garantia de segurança: senha retornada **não pode** ser igual à senha enviada (hash)

- Login: `POST /auth/login`
  - login com sucesso (retorna **token + usuário**)
  - senha inválida
  - email inexistente
  - campos faltando (email/senha)

### Banco de Dados (PostgreSQL)
- No cadastro, o teste valida via query no DB se:
  - o usuário foi persistido
  - campos `nome/email/tipo/criadoEm` estão corretos
  - senha persistida **não é** a senha em texto plano
- Cleanup: ao final dos testes, remove o usuário criado para não “sujar” o banco

### Evidências no relatório (Attachments)
Para alguns cenários, o relatório salva:
- payload enviado (mascara senha)
- status/headers
- body de resposta
- SQL executado no DB
- resultado do SELECT no DB

---

## 📦 Requisitos

- Node.js **18+** (ou 20+)
- API rodando localmente (app do Sistema de Reservas)
- Banco PostgreSQL acessível (caso queira rodar os testes com validação DB)

---

## ⚙️ Configuração

1) Instale dependências:
```bash
npm install
Instale browsers do Playwright:

bash
Copiar código
npx playwright install
Crie um arquivo .env na raiz do projeto (ou copie o .env.example):

bash
Copiar código
cp .env.example .env
Variáveis de ambiente
Obrigatórias para API:

env
Copiar código
BASE_URL_API=http://localhost:3030
(Opcional) Para E2E futuramente:

env
Copiar código
BASE_URL_WEB=http://localhost:3000
Para validação no DB (PostgreSQL):

env
Copiar código
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=restaurante
DB_SSL=false
Ajuste os valores conforme seu ambiente.

▶️ Como executar os testes
Rodar todos os testes:

bash
Copiar código
npx playwright test
Rodar apenas testes de API:

bash
Copiar código
npx playwright test tests/api
Rodar um arquivo específico:

bash
Copiar código
npx playwright test tests/api/usuario.spec.ts
Abrir o relatório HTML:

bash
Copiar código
npx playwright show-report
📁 Estrutura do projeto (atual)
txt
Copiar código
src/
  api/
    client.ts                # cria o APIRequestContext (baseURL + headers)
    endpoints.ts             # centraliza rotas/endpoints
    auth.ts                  # ações de auth (registerUser/loginUser)
    factories/
      usuario.factory.ts     # geração de payloads (com overrides)
  db/
    client.ts                # conexão com Postgres (para asserts no DB)
  support/
    attachments.ts           # helpers para anexar evidências no report

tests/
  api/
    usuario.spec.ts          # testes de cadastro + validação DB + attachments
    login.spec.ts            # testes de login + cleanup + attachments

playwright.config.ts
.env.example
