# 🧪 Automação de Testes (E2E + API) — Sistema de Reservas

Projeto de portfólio focado em **automação de testes** para uma aplicação de **Sistema de Reservas**, validando:
- ✅ **Front-end (E2E)**: fluxos reais do usuário (login, navegação, criação/consulta de reservas)
- ✅ **Back-end (API)**: validação de endpoints (auth, usuários, mesas, reservas)

A automação foi construída utilizando **Playwright** como ferramenta única (UI + API), com foco em boas práticas, organização e relatórios.

---

## 🚀 Stack
- **Playwright Test** (E2E + API)
- **Node.js**
- Relatórios: **HTML Report**, screenshots, traces e (opcional) vídeo
- (App) Backend: Node/Express + Prisma + PostgreSQL *(dependência do sistema testado)*

---

## 📦 Requisitos
- Node.js 18+ (ou 20+)
- API rodando localmente
- Front rodando localmente
- Banco PostgreSQL configurado (caso o backend dependa)

---

## ⚙️ Configuração
Crie um arquivo `.env` na raiz do projeto de testes (ou use `.env.example` como base):

```env
BASE_URL_WEB=http://localhost:3000
BASE_URL_API=http://localhost:3030
