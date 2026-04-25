# Asset Management

Sistema de gestão de ativos e equipamentos desenvolvido com **Node.js/Express/Prisma** (backend) e **React/TypeScript/Tailwind** (frontend).

## Funcionalidades

- **Autenticação**: JWT com access token + refresh token
- **Gestão de Utilizadores**: 3 perfis (admin, técnico, funcionário)
- **Gestão de Equipamentos**: CRUD completo com estados (disponível, em uso, manutenção, etc.)
- **Agendamentos**: Funcionários agendam, admin aprova/conclui
- **Empréstimos**: Criação e devolução de equipamentos
- **Manutenções**: Admin e técnico gerem manutenções
- **Transferências**: Movimentação de equipamentos entre setores
- **Anomalias**: Reporte e resolução de problemas
- **Setores**: Gestão de departamentos/áreas
- **Notificações**: Sistema de notificações em tempo real
- **Dashboard**: Estatísticas e gráficos de performance
- **Relatórios**: Exportação de dados

---

## Tech Stack

| Camada | Tecnologias |
|--------|-------------|
| **Backend** | Node.js, Express, Prisma ORM, PostgreSQL, JWT, Zod, Jest |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Radix UI, Recharts |
| **DevOps** | Docker (frontend), GitHub |

---

## Setup do Projeto

### 1. Requisitos

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) 14+
- [Git](https://git-scm.com/)

### 2. Clonar o repositório

```bash
git clone https://github.com/Migueljosu/asset_management.git
cd asset_management
```

### 3. Configurar o Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar ficheiro .env
cp .env.example .env   # ou crie manualmente
```

Edite o ficheiro `.env` com as suas credenciais do PostgreSQL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/asset_management?schema=public"
JWT_SECRET="sua_chave_secreta_jwt_aqui"
JWT_REFRESH_SECRET="sua_chave_refresh_aqui"
```

**Exemplo com PostgreSQL local:**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/asset_management?schema=public"
JWT_SECRET="asset_management_secret_key_2026"
JWT_REFRESH_SECRET="asset_management_refresh_key_2026"
```

### 4. Configurar a Base de Dados

```bash
# Rodar as migrations (cria as tabelas)
npm run db:migrate

# Popular com dados iniciais (seed)
npm run db:seed
```

O seed cria automaticamente:

- 3 utilizadores: **admin**, **técnico**, **funcionário**
- 12 setores/departamentos
- 25 equipamentos variados (laptops, desktops, monitores, servidores, etc.)

### 5. Iniciar o Backend

```bash
# Modo desenvolvimento (com hot-reload)
npm run dev

# Ou modo produção
node src/server.js
```

O backend ficará disponível em: **<http://localhost:3000>**

Documentação Swagger: **<http://localhost:3000/api/docs>**

### 6. Configurar o Frontend

Num novo terminal:

```bash
cd frontend

# Instalar dependências
npm install

# Criar ficheiro .env
cp .env.example .env   # ou crie manualmente
```

Edite o `.env`:

```env
VITE_API_URL=http://localhost:3000
```

Inicie o frontend:

```bash
npm run dev
```

O frontend ficará disponível em: **<http://localhost:5173>**

---

## Comandos Úteis

### Backend

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor em modo desenvolvimento |
| `npm test` | Executa testes unitários com cobertura |
| `npm run test:watch` | Executa testes em modo watch |
| `npm run db:migrate` | Aplica as migrations na base de dados |
| `npm run db:seed` | Popula a BD com dados iniciais |
| `npm run db:reset` | Reseta a BD e aplica seed |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:studio` | Abre o Prisma Studio (GUI da BD) |

### Frontend

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Compila para produção |
| `npm run preview` | Pré-visualiza build de produção |
| `npm run format` | Formata código com Prettier |

---

## Credenciais Padrão (Seed)

Após rodar o seed, use estas credenciais para login:

| Perfil | Email | Senha |
|--------|-------|-------|
| **Admin** | `admin@asset.com` | `12345678` |
| **Técnico** | `tecnico@asset.com` | `12345678` |
| **Funcionário** | `funcionario@asset.com` | `12345678` |

---

## Permissões por Perfil

| Funcionalidade | Admin | Técnico | Funcionário |
|----------------|-------|---------|-------------|
| Dashboard | ✅ | ✅ | ✅ (pessoal) |
| Equipamentos | ✅ CRUD | ❌ Não vê | ✅ Lista read-only |
| Anomalias | ✅ Tudo | ✅ Resolver | ✅ Registar |
| Manutenções | ✅ Tudo | ✅ Criar/Concluir | ❌ |
| Agendamentos | ✅ Aprovar/Concluir | ❌ | ✅ Criar/Cancelar |
| Empréstimos | ✅ Tudo | ❌ | ❌ |
| Transferências | ✅ Tudo | ❌ | ❌ |
| Setores | ✅ CRUD | ❌ | ❌ |
| Utilizadores | ✅ CRUD | ❌ | ❌ |
| Relatórios | ✅ Tudo | ❌ | ❌ |
| Configurações | ✅ Tudo | ❌ | ❌ |

---

## Estrutura do Projeto

```
asset_management/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Modelos da base de dados
│   │   ├── migrations/        # Migrations versionadas
│   │   └── seed.js            # Dados iniciais
│   ├── src/
│   │   ├── config/            # Configurações (Swagger, etc.)
│   │   ├── controllers/       # Lógica de negócio
│   │   ├── middlewares/       # Auth, rate limit, roles
│   │   ├── routes/            # Rotas da API
│   │   ├── validators/        # Validação Zod
│   │   ├── utils/             # Prisma, JWT, Logger
│   │   └── __tests__/         # Testes automatizados
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── features/          # Módulos por funcionalidade
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── context/           # AuthContext, AppContext
│   │   ├── routes/            # React Router
│   │   └── pages/             # Páginas principais
│   └── package.json
│
└── README.md
```

---

## API Endpoints

A documentação completa da API está disponível via Swagger em:

**`http://localhost:3000/api/docs`**

Principais endpoints:

| Recurso | Base URL |
|---------|----------|
| Auth | `/api/auth` |
| Utilizadores | `/api/users` |
| Equipamentos | `/api/equipment` |
| Setores | `/api/sectors` |
| Agendamentos | `/api/schedules` |
| Empréstimos | `/api/loans` |
| Manutenções | `/api/maintenance` |
| Transferências | `/api/transfers` |
| Anomalias | `/api/anomalies` |
| Notificações | `/api/notifications` |
| Dashboard | `/api/dashboard` |

---

## Testes

```bash
cd backend
npm test
```

Resultado esperado:

```
Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
```

---

## Docker (Frontend)

```bash
cd frontend
docker build -t asset-management-frontend .
docker run -p 5173:5173 asset-management-frontend
```

---

## Licença

MIT
