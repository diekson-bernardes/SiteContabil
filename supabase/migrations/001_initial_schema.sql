-- ContaCliente - Schema inicial
-- Execute via Supabase Dashboard > SQL Editor ou supabase db push

-- ─── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enum types ──────────────────────────────────────────────────────────────
create type user_role           as enum ('admin', 'staff', 'client');
create type client_status       as enum ('active', 'inactive', 'pending');
create type message_status      as enum ('sent', 'read', 'archived');
create type obrigacao_status    as enum ('pending', 'in_progress', 'completed', 'overdue');
create type obrigacao_priority  as enum ('low', 'medium', 'high', 'critical');
create type honorario_status    as enum ('pending', 'paid', 'overdue', 'cancelled');

-- ─── profiles ────────────────────────────────────────────────────────────────
-- Extends auth.users with application-level data.
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role   not null default 'client',
  full_name   text        not null,
  email       text        not null unique,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── clients ─────────────────────────────────────────────────────────────────
create table clients (
  id                    uuid primary key default uuid_generate_v4(),
  profile_id            uuid references profiles(id) on delete set null,
  company_name          text        not null,
  cnpj                  char(14)    unique,
  cpf                   char(11)    unique,
  email                 text        not null,
  phone                 text,
  address               text,
  city                  text,
  state                 char(2),
  zip_code              text,
  status                client_status not null default 'active',
  responsible_staff_id  uuid references profiles(id) on delete set null,
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint cnpj_or_cpf check (cnpj is not null or cpf is not null)
);

create index clients_status_idx       on clients(status);
create index clients_staff_idx        on clients(responsible_staff_id);
create index clients_company_name_idx on clients(lower(company_name));

-- ─── messages ────────────────────────────────────────────────────────────────
create table messages (
  id            uuid primary key default uuid_generate_v4(),
  sender_id     uuid        not null references profiles(id) on delete cascade,
  recipient_id  uuid        not null references profiles(id) on delete cascade,
  client_id     uuid        references clients(id) on delete set null,
  subject       text        not null,
  body          text        not null,
  status        message_status not null default 'sent',
  parent_id     uuid        references messages(id) on delete set null,
  attachments   text[],
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index messages_sender_idx    on messages(sender_id);
create index messages_recipient_idx on messages(recipient_id);
create index messages_client_idx    on messages(client_id);
create index messages_parent_idx    on messages(parent_id);

-- ─── obrigacoes ──────────────────────────────────────────────────────────────
create table obrigacoes (
  id                uuid primary key default uuid_generate_v4(),
  client_id         uuid          not null references clients(id) on delete cascade,
  assigned_to       uuid          references profiles(id) on delete set null,
  title             text          not null,
  description       text,
  due_date          date          not null,
  competence_date   date,
  status            obrigacao_status   not null default 'pending',
  priority          obrigacao_priority not null default 'medium',
  category          text,
  completed_at      timestamptz,
  created_at        timestamptz   not null default now(),
  updated_at        timestamptz   not null default now()
);

create index obrigacoes_client_idx    on obrigacoes(client_id);
create index obrigacoes_due_date_idx  on obrigacoes(due_date);
create index obrigacoes_status_idx    on obrigacoes(status);
create index obrigacoes_assigned_idx  on obrigacoes(assigned_to);

-- ─── honorarios ──────────────────────────────────────────────────────────────
create table honorarios (
  id               uuid primary key default uuid_generate_v4(),
  client_id        uuid            not null references clients(id) on delete cascade,
  description      text            not null,
  amount           numeric(12, 2)  not null check (amount > 0),
  due_date         date            not null,
  payment_date     date,
  status           honorario_status not null default 'pending',
  reference_month  char(7),  -- format: YYYY-MM
  invoice_number   text,
  notes            text,
  created_at       timestamptz     not null default now(),
  updated_at       timestamptz     not null default now()
);

create index honorarios_client_idx   on honorarios(client_id);
create index honorarios_due_date_idx on honorarios(due_date);
create index honorarios_status_idx   on honorarios(status);

-- ─── Auto-update updated_at ──────────────────────────────────────────────────
create or replace function trigger_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on profiles   for each row execute function trigger_set_updated_at();
create trigger set_updated_at before update on clients    for each row execute function trigger_set_updated_at();
create trigger set_updated_at before update on messages   for each row execute function trigger_set_updated_at();
create trigger set_updated_at before update on obrigacoes for each row execute function trigger_set_updated_at();
create trigger set_updated_at before update on honorarios for each row execute function trigger_set_updated_at();

-- ─── Auto-create profile on signup ───────────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, role, full_name, email)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'client'),
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── Row-Level Security ───────────────────────────────────────────────────────
alter table profiles   enable row level security;
alter table clients    enable row level security;
alter table messages   enable row level security;
alter table obrigacoes enable row level security;
alter table honorarios enable row level security;

-- Helper: get current user role
create or replace function current_user_role()
returns user_role language sql security definer stable as $$
  select role from profiles where id = auth.uid();
$$;

-- profiles: users see their own profile; admin/staff see all
create policy "profiles_select" on profiles for select
  using (id = auth.uid() or current_user_role() in ('admin', 'staff'));

create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());

-- clients: admin/staff see all; client sees own linked record
create policy "clients_select" on clients for select
  using (
    current_user_role() in ('admin', 'staff')
    or profile_id = auth.uid()
  );

create policy "clients_insert" on clients for insert
  with check (current_user_role() in ('admin', 'staff'));

create policy "clients_update" on clients for update
  using (current_user_role() in ('admin', 'staff'));

-- messages: participants only
create policy "messages_select" on messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid() or current_user_role() = 'admin');

create policy "messages_insert" on messages for insert
  with check (sender_id = auth.uid());

-- obrigacoes: admin/staff full access; client sees own
create policy "obrigacoes_select" on obrigacoes for select
  using (
    current_user_role() in ('admin', 'staff')
    or client_id in (select id from clients where profile_id = auth.uid())
  );

create policy "obrigacoes_insert" on obrigacoes for insert
  with check (current_user_role() in ('admin', 'staff'));

create policy "obrigacoes_update" on obrigacoes for update
  using (current_user_role() in ('admin', 'staff'));

-- honorarios: admin/staff full; client sees own
create policy "honorarios_select" on honorarios for select
  using (
    current_user_role() in ('admin', 'staff')
    or client_id in (select id from clients where profile_id = auth.uid())
  );

create policy "honorarios_insert" on honorarios for insert
  with check (current_user_role() in ('admin', 'staff'));

create policy "honorarios_update" on honorarios for update
  using (current_user_role() in ('admin', 'staff'));
