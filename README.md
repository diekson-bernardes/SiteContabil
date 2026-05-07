# ContaCliente

Plataforma web de comunicação entre escritório de contabilidade e clientes.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS 3**
- **Supabase** (Auth + PostgreSQL + RLS)

---

## Estrutura de pastas

```
src/
├── app/
│   ├── (auth)/login/          # Página de login
│   └── (dashboard)/           # Área autenticada
│       ├── layout.tsx          # Layout com sidebar + header
│       ├── dashboard/          # Dashboard com indicadores
│       ├── clientes/           # Cadastro e gestão de clientes
│       │   └── [id]/           # Detalhe do cliente
│       ├── comunicacao/        # Chat escritório ↔ cliente
│       ├── obrigacoes/         # Controle de obrigações/tarefas
│       ├── financeiro/         # Honorários
│       └── configuracoes/      # Config do escritório e usuários
├── components/
│   ├── ui/                    # Button, Input, Badge, Card, Modal, Table
│   ├── layout/                # Sidebar, Header
│   └── dashboard/             # StatsCard, RecentActivity
├── lib/
│   ├── supabase/client.ts     # Supabase browser client
│   ├── supabase/server.ts     # Supabase server client (RSC/actions)
│   └── utils.ts               # cn, formatDate, formatCurrency, etc.
└── types/index.ts             # Tipos TypeScript do domínio
supabase/migrations/
└── 001_initial_schema.sql     # Schema completo com RLS
```

---

## Instalação

### 1. Pré-requisitos

- Node.js >= 20
- pnpm, npm ou yarn
- Conta no Supabase (https://supabase.com)

### 2. Clonar e instalar dependências

```bash
git clone <repo>
cd SiteContabil
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha `.env.local` com os valores do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

Os valores estão em: **Supabase Dashboard -> Settings -> API**.

### 4. Aplicar o schema SQL

**Opção A – Supabase Dashboard (recomendado)**

1. Acesse o projeto no Supabase
2. Va em **SQL Editor**
3. Cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Clique em **Run**

**Opção B – Supabase CLI**

```bash
npm install -g supabase
supabase login
supabase link --project-ref <seu-project-ref>
supabase db push
```

### 5. Criar o primeiro usuário admin

No **SQL Editor** do Supabase, após criar um usuário via Dashboard -> Authentication -> Users:

```sql
update profiles
set role = 'admin'
where email = 'seu@email.com';
```

### 6. Executar em desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000

---

## Módulos

| Módulo | Rota | Perfis |
|---|---|---|
| Dashboard | `/dashboard` | admin, staff, client |
| Clientes | `/clientes` | admin, staff |
| Comunicação | `/comunicacao` | admin, staff, client |
| Obrigações | `/obrigacoes` | admin, staff, client |
| Financeiro | `/financeiro` | admin, staff, client |
| Configurações | `/configuracoes` | admin |

## Perfis de acesso

| Perfil | Descrição |
|---|---|
| `admin` | Acesso total ao sistema |
| `staff` | Acesso a clientes, obrigações e financeiro |
| `client` | Visualiza apenas seus dados e pode enviar mensagens |

---

## Próximos passos sugeridos

- [ ] Implementar middleware de autenticação (middleware.ts)
- [ ] Conectar páginas ao Supabase (substituir dados mock)
- [ ] Upload de anexos via Supabase Storage
- [ ] Notificações em tempo real via Supabase Realtime
- [ ] Geração de PDF de honorários
- [ ] Deploy na Vercel