-- =====================================================================================
-- MAQNOW · Esquema de base de datos (PostgreSQL 15+ / Supabase)
--
-- Cómo usarlo en Supabase:
--   1. SQL Editor → pega y ejecuta este archivo (schema.sql).
--   2. Ejecuta después seed.sql (catálogo de maquinaria y proveedores iniciales).
--   3. Crea tu usuario desde la web y hazte superadmin (una sola vez):
--        update public.profiles set role = 'superadmin' where email = 'tu@email.com';
--
-- Seguridad: TODAS las tablas tienen RLS activado. El navegador solo oculta botones;
-- quien decide qué puede leer o cambiar cada usuario son las políticas de este archivo.
-- Roles: cliente · proveedor · agente · administracion · superadmin
-- =====================================================================================

-- ---------- Tipos ----------
create type public.app_role          as enum ('cliente', 'proveedor', 'agente', 'administracion', 'superadmin');
create type public.provider_scope    as enum ('nacional', 'local');
create type public.provider_status   as enum ('pendiente', 'homologado', 'suspendido');
create type public.request_status    as enum ('buscando', 'ofertas', 'aceptada', 'cancelada');
create type public.offer_availability as enum ('si', 'parcial', 'no');
create type public.delivery_mode     as enum ('transporte_incluido', 'recogida_en_proveedor');
create type public.rental_status     as enum ('reservada', 'en_alquiler', 'baja_solicitada', 'finalizada');
create type public.commission_status as enum ('pendiente', 'liquidada');
create type public.incident_status   as enum ('abierta', 'en_curso', 'resuelta');
create type public.machine_status    as enum ('operativa', 'alquilada', 'mantenimiento');

-- ---------- Numeración legible (MAQ-000241, ALQ-00119…) ----------
create sequence public.seq_client   start 1;
create sequence public.seq_request  start 1;
create sequence public.seq_rental   start 1;
create sequence public.seq_incident start 1;
create sequence public.seq_invoice  start 1;
create sequence public.seq_machine  start 1;

-- =====================================================================================
-- USUARIOS Y EMPRESAS
-- =====================================================================================

-- Un perfil por usuario de Supabase Auth. El rol vive aquí, nunca en el navegador.
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  phone       text,
  role        public.app_role not null default 'cliente',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Empresas que alquilan (constructoras, instaladores, autónomos…)
create table public.clients (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique default 'CLI-' || lpad(nextval('public.seq_client')::text, 4, '0'),
  name           text not null,
  cif            text,
  contact_name   text,
  phone          text,
  email          text,
  payment_method text not null default 'Transferencia a 30 días',
  credit_limit   numeric(12, 2) not null default 6000 check (credit_limit >= 0),
  avg_pay_days   integer not null default 30 check (avg_pay_days >= 0),
  created_at     timestamptz not null default now()
);

create table public.client_members (
  client_id uuid not null references public.clients (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  is_admin  boolean not null default false,          -- administra la cuenta de la empresa
  primary key (client_id, user_id)
);
create index on public.client_members (user_id);

-- Empresas alquiladoras
create table public.providers (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  scope            public.provider_scope not null default 'local',
  status           public.provider_status not null default 'pendiente',  -- solo los homologados reciben solicitudes
  city             text,
  province         text,
  base_km          integer not null default 10 check (base_km >= 0),     -- distancia orientativa de su base
  rating           numeric(2, 1) not null default 4.0 check (rating between 1 and 5),
  response_min     integer not null default 30 check (response_min > 0), -- tiempo de respuesta habitual
  assistance_hours integer not null default 4 check (assistance_hours > 0),
  payment_terms    text not null default 'Transferencia a 30 días',
  contact_name     text,
  phone            text,
  email            text,
  plan             text not null default 'Gratis',
  created_at       timestamptz not null default now()
);

-- Datos internos del proveedor: solo los ve el equipo MAQNOW (y la comisión, el propio proveedor)
create table public.provider_internal (
  provider_id    uuid primary key references public.providers (id) on delete cascade,
  commission_pct numeric(4, 2) not null default 5 check (commission_pct between 0 and 30),
  reliability    integer not null default 85 check (reliability between 0 and 100),
  notes          text
);

create table public.provider_members (
  provider_id uuid not null references public.providers (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  primary key (provider_id, user_id)
);
create index on public.provider_members (user_id);

-- =====================================================================================
-- CATÁLOGO: Familia → Tipo → Características
-- =====================================================================================
create table public.families (
  id        text primary key,           -- 'elevacion', 'tierras'…
  name      text not null,
  task      text not null,              -- "Trabajar en altura"
  base_day  numeric(8, 2) not null default 0,
  sort      integer not null default 0
);

create table public.machine_types (
  id        bigint generated always as identity primary key,
  family_id text not null references public.families (id) on delete cascade,
  name      text not null,
  sort      integer not null default 0,
  unique (family_id, name)
);

-- Preguntas propias de cada familia (altura, tonelaje, potencia…)
create table public.family_fields (
  id        bigint generated always as identity primary key,
  family_id text not null references public.families (id) on delete cascade,
  key       text not null,
  label     text not null,
  options   jsonb not null default '[]',
  sort      integer not null default 0,
  unique (family_id, key)
);

create table public.provider_families (
  provider_id uuid not null references public.providers (id) on delete cascade,
  family_id   text not null references public.families (id) on delete cascade,
  primary key (provider_id, family_id)
);

-- Provincias donde sirve un proveedor local (los nacionales sirven en todas)
create table public.provider_provinces (
  provider_id uuid not null references public.providers (id) on delete cascade,
  province    text not null,
  primary key (provider_id, province)
);

-- =====================================================================================
-- OBRAS, SOLICITUDES Y OFERTAS
-- =====================================================================================
create table public.sites (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  name         text not null,
  municipality text not null,
  province     text not null,
  postal_code  text,
  created_at   timestamptz not null default now()
);
create index on public.sites (client_id);

create table public.requests (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique default 'MAQ-' || lpad(nextval('public.seq_request')::text, 6, '0'),
  client_id    uuid not null references public.clients (id) on delete restrict,
  site_id      uuid references public.sites (id) on delete set null,
  created_by   uuid references public.profiles (id) on delete set null,
  municipality text not null,
  province     text not null,
  postal_code  text,
  start_date   date not null,
  days         integer not null check (days > 0),
  indefinite   boolean not null default false,       -- alquiler abierto hasta fin de obra
  delivery     public.delivery_mode not null default 'transporte_incluido',
  urgent       boolean not null default false,
  notes        text,
  status       public.request_status not null default 'buscando',
  by_agent     boolean not null default false,       -- la creó el equipo en nombre del cliente
  viewed_at    timestamptz,                          -- el cliente abrió el comparativo
  reminded_at  timestamptz,                          -- último recordatorio a proveedores
  created_at   timestamptz not null default now()
);
create index on public.requests (client_id, status);
create index on public.requests (status, created_at desc);

create table public.request_items (
  id           uuid primary key default gen_random_uuid(),
  request_id   uuid not null references public.requests (id) on delete cascade,
  family_id    text not null references public.families (id),
  machine_type text not null,
  quantity     integer not null default 1 check (quantity > 0),
  specs        jsonb not null default '{}'            -- {"altura": "16 m", "terreno": "Tierra"}
);
create index on public.request_items (request_id);

-- A qué proveedores se envió cada solicitud y cuándo respondieron
create table public.request_contacts (
  request_id   uuid not null references public.requests (id) on delete cascade,
  provider_id  uuid not null references public.providers (id) on delete cascade,
  sent_at      timestamptz not null default now(),
  reminded_at  timestamptz,
  responded_at timestamptz,
  primary key (request_id, provider_id)
);
create index on public.request_contacts (provider_id);

create table public.offers (
  id               uuid primary key default gen_random_uuid(),
  request_id       uuid not null references public.requests (id) on delete cascade,
  provider_id      uuid not null references public.providers (id) on delete cascade,
  availability     public.offer_availability not null,
  delay_days       integer not null default 0 check (delay_days >= 0),
  price            numeric(12, 2) not null default 0 check (price >= 0),      -- alquiler, sin IVA
  transport        numeric(12, 2) not null default 0 check (transport >= 0),
  deposit          numeric(12, 2) not null default 0 check (deposit >= 0),    -- fianza
  delivery_date    date,
  distance_km      integer check (distance_km >= 0),
  assistance_hours integer check (assistance_hours > 0),
  payment_terms    text,
  notes            text,
  created_by       uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (request_id, provider_id),
  foreign key (request_id, provider_id) references public.request_contacts (request_id, provider_id) on delete cascade
);
create index on public.offers (provider_id);

-- =====================================================================================
-- FLOTA Y PASAPORTE DIGITAL
-- =====================================================================================
create table public.machines (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique default 'RM-' || lpad(nextval('public.seq_machine')::text, 6, '0'),
  provider_id      uuid not null references public.providers (id) on delete cascade,
  family_id        text not null references public.families (id),
  machine_type     text not null,
  size_label       text,
  brand            text,
  model            text,
  year             integer check (year between 1980 and 2100),
  serial_number    text,
  hours            integer not null default 0 check (hours >= 0),
  status           public.machine_status not null default 'operativa',
  last_maintenance date,
  next_maintenance date,
  last_inspection  date,
  created_at       timestamptz not null default now()
);
create index on public.machines (provider_id, status);

create table public.machine_documents (
  id          uuid primary key default gen_random_uuid(),
  machine_id  uuid not null references public.machines (id) on delete cascade,
  doc_type    text not null,            -- 'Certificado CE', 'Seguro', 'Ficha técnica'…
  file_path   text,                     -- ruta en Supabase Storage (bucket "documentos")
  valid_until date,
  uploaded_at timestamptz not null default now(),
  unique (machine_id, doc_type)
);

-- =====================================================================================
-- ALQUILERES, INCIDENCIAS, VALORACIONES Y FACTURAS
-- =====================================================================================
create table public.rentals (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique default 'ALQ-' || lpad(nextval('public.seq_rental')::text, 5, '0'),
  request_id        uuid not null unique references public.requests (id) on delete restrict,
  offer_id          uuid not null references public.offers (id) on delete restrict,
  client_id         uuid not null references public.clients (id) on delete restrict,
  site_id           uuid references public.sites (id) on delete set null,
  provider_id       uuid not null references public.providers (id) on delete restrict,
  start_date        date not null,
  end_date          date not null,
  days              integer not null check (days > 0),
  indefinite        boolean not null default false,
  price             numeric(12, 2) not null check (price >= 0),
  transport         numeric(12, 2) not null default 0 check (transport >= 0),
  total             numeric(12, 2) generated always as (price + transport) stored,
  deposit           numeric(12, 2) not null default 0,
  payment_terms     text,
  saving            numeric(12, 2) not null default 0,   -- ahorro frente a la media de ofertas
  commission_pct    numeric(4, 2) not null,
  commission        numeric(12, 2) not null,             -- sobre el precio de alquiler
  commission_status public.commission_status not null default 'pendiente',
  status            public.rental_status not null default 'reservada',
  baja_date         date,                                -- recogida pedida por el cliente
  accepted_by       uuid references public.profiles (id) on delete set null,
  accepted_at       timestamptz not null default now(),
  check (end_date >= start_date)
);
create index on public.rentals (client_id, status);
create index on public.rentals (provider_id, status);

create table public.rental_machines (
  rental_id  uuid not null references public.rentals (id) on delete cascade,
  machine_id uuid not null references public.machines (id) on delete restrict,
  primary key (rental_id, machine_id)
);

create table public.incidents (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique default 'INC-' || lpad(nextval('public.seq_incident')::text, 5, '0'),
  rental_id   uuid not null references public.rentals (id) on delete cascade,
  type        text not null,
  description text,
  urgent      boolean not null default false,
  level       smallint not null default 2 check (level between 1 and 3),  -- 1 consulta · 2 incidencia · 3 avería urgente
  status      public.incident_status not null default 'abierta',
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);
create index on public.incidents (rental_id);
create index on public.incidents (status) where status <> 'resuelta';

create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  rental_id   uuid not null unique references public.rentals (id) on delete cascade,
  provider_id uuid not null references public.providers (id) on delete cascade,
  client_id   uuid not null references public.clients (id) on delete cascade,
  stars       smallint not null check (stars between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);
create index on public.reviews (provider_id);

create table public.invoices (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique default 'FAC-' || lpad(nextval('public.seq_invoice')::text, 5, '0'),
  rental_id   uuid not null unique references public.rentals (id) on delete restrict,
  client_id   uuid not null references public.clients (id) on delete restrict,
  provider_id uuid not null references public.providers (id) on delete restrict,
  issue_date  date not null default current_date,
  due_date    date not null,
  base        numeric(12, 2) not null check (base >= 0),
  vat_rate    numeric(4, 2) not null default 21,
  total       numeric(12, 2) generated always as (round(base * (1 + vat_rate / 100), 2)) stored,
  paid_at     timestamptz
);
create index on public.invoices (client_id);

-- Maquinaria habitual del cliente
create table public.favorites (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  family_id    text not null references public.families (id),
  machine_type text not null,
  specs        jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  unique (client_id, family_id, machine_type, specs)
);

-- Rastro de acciones sensibles (cambios de rol, homologaciones, liquidaciones…)
create table public.audit_log (
  id        bigint generated always as identity primary key,
  actor     uuid references public.profiles (id) on delete set null,
  action    text not null,
  entity    text not null,
  entity_id uuid,
  data      jsonb,
  at        timestamptz not null default now()
);

-- =====================================================================================
-- FUNCIONES DE PERMISOS (las usan las políticas RLS)
-- security definer + search_path fijo: leen `profiles` sin entrar en bucle con su propia RLS
-- =====================================================================================
create or replace function public.my_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and active
$$;

create or replace function public.has_role(variadic roles public.app_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.my_role() = any (roles), false)
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_role('agente', 'administracion', 'superadmin')
$$;

create or replace function public.is_client_member(p_client uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.client_members m join public.profiles p on p.id = m.user_id
                 where m.client_id = p_client and m.user_id = auth.uid() and p.active)
$$;

create or replace function public.is_provider_member(p_provider uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.provider_members m join public.profiles p on p.id = m.user_id
                 where m.provider_id = p_provider and m.user_id = auth.uid() and p.active)
$$;

-- ¿El usuario pertenece a un proveedor al que se envió esta solicitud?
create or replace function public.is_contacted_provider(p_request uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.request_contacts c where c.request_id = p_request and public.is_provider_member(c.provider_id))
$$;

create or replace function public.request_client(p_request uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select client_id from public.requests where id = p_request
$$;

-- =====================================================================================
-- DISPARADORES
-- =====================================================================================

-- Alta de usuario: crea el perfil y su empresa a partir de los datos del registro.
-- El rol del registro solo puede ser cliente o proveedor: nadie se hace del equipo por su cuenta.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta     jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role   public.app_role := case when meta ->> 'role' = 'proveedor' then 'proveedor' else 'cliente' end;
  v_name   text := coalesce(nullif(trim(meta ->> 'full_name'), ''), split_part(new.email, '@', 1));
  v_org    text := coalesce(nullif(trim(meta ->> 'company'), ''), v_name);
  v_id     uuid;
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (new.id, new.email, v_name, meta ->> 'phone', v_role);

  if v_role = 'proveedor' then
    insert into public.providers (name, scope, status, city, province, contact_name, phone, email)
    values (v_org, 'local', 'pendiente', meta ->> 'city', coalesce(nullif(meta ->> 'province', ''), 'Málaga'), v_name, meta ->> 'phone', new.email)
    returning id into v_id;
    insert into public.provider_internal (provider_id) values (v_id);
    insert into public.provider_members (provider_id, user_id) values (v_id, new.id);
    insert into public.provider_provinces (provider_id, province) values (v_id, coalesce(nullif(meta ->> 'province', ''), 'Málaga'));
    insert into public.provider_families (provider_id, family_id)
      select v_id, f.id from public.families f
      where jsonb_typeof(meta -> 'families') = 'array' and (meta -> 'families') ? f.id;
  else
    insert into public.clients (name, cif, contact_name, phone, email)
    values (v_org, nullif(meta ->> 'cif', ''), v_name, meta ->> 'phone', new.email)
    returning id into v_id;
    insert into public.client_members (client_id, user_id, is_admin) values (v_id, new.id, true);
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Solo un superadmin cambia roles o desactiva cuentas (aunque la política deje editar el perfil propio)
create or replace function public.protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.active is distinct from old.active)
     and auth.uid() is not null and not public.has_role('superadmin') then
    raise exception 'Solo un superadmin puede cambiar el rol o el estado de una cuenta';
  end if;
  if new.role is distinct from old.role or new.active is distinct from old.active then
    insert into public.audit_log (actor, action, entity, entity_id, data)
    values (auth.uid(), 'perfil.cambio', 'profiles', new.id, jsonb_build_object('rol', new.role, 'activa', new.active));
  end if;
  return new;
end $$;
create trigger protect_profile before update on public.profiles
  for each row execute function public.protect_profile();

-- Solo agente o superadmin homologan o suspenden a un proveedor
create or replace function public.protect_provider_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    if auth.uid() is not null and not public.has_role('agente', 'superadmin') then
      raise exception 'Solo el equipo MAQNOW puede cambiar el estado de homologación';
    end if;
    insert into public.audit_log (actor, action, entity, entity_id, data)
    values (auth.uid(), 'proveedor.estado', 'providers', new.id, jsonb_build_object('estado', new.status));
  end if;
  return new;
end $$;
create trigger protect_provider_status before update on public.providers
  for each row execute function public.protect_provider_status();

-- Al llegar o cambiar una oferta: marca la respuesta del proveedor y pasa la solicitud a "ofertas"
create or replace function public.on_offer_saved() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  update public.request_contacts set responded_at = coalesce(responded_at, now())
   where request_id = new.request_id and provider_id = new.provider_id;
  update public.requests set status = 'ofertas' where id = new.request_id and status = 'buscando';
  return new;
end $$;
create trigger on_offer_saved before insert or update on public.offers
  for each row execute function public.on_offer_saved();

-- =====================================================================================
-- OPERACIONES (RPC): los pasos que tocan varias tablas van en funciones, no en el navegador
-- =====================================================================================

-- Envía la solicitud a los proveedores compatibles: homologados, que sirven en la provincia
-- y cubren todas las familias pedidas. Hasta 10, ordenados por valoración y fiabilidad.
create or replace function public.dispatch_request(p_request uuid, p_max integer default 10) returns integer
language plpgsql security definer set search_path = public as $$
declare
  r public.requests;
  n integer;
begin
  select * into r from public.requests where id = p_request;
  if not found then raise exception 'Solicitud no encontrada'; end if;
  if not (public.is_client_member(r.client_id) or public.has_role('agente', 'superadmin')) then
    raise exception 'No tienes permiso sobre esta solicitud';
  end if;

  insert into public.request_contacts (request_id, provider_id)
  select r.id, p.id
    from public.providers p
    left join public.provider_internal pi on pi.provider_id = p.id
   where p.status = 'homologado'
     and (p.scope = 'nacional' or exists (select 1 from public.provider_provinces z where z.provider_id = p.id and z.province = r.province))
     and not exists (select 1 from public.request_items i
                      where i.request_id = r.id
                        and not exists (select 1 from public.provider_families pf where pf.provider_id = p.id and pf.family_id = i.family_id))
   order by p.rating * 20 + coalesce(pi.reliability, 80) desc
   limit greatest(1, least(p_max, 10))
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

-- El cliente acepta una oferta: nace el alquiler con su comisión y se cierra la solicitud
create or replace function public.accept_offer(p_offer uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  o public.offers;
  r public.requests;
  v_pct numeric;
  v_avg numeric;
  v_rental uuid;
begin
  select * into o from public.offers where id = p_offer;
  if not found then raise exception 'Oferta no encontrada'; end if;
  select * into r from public.requests where id = o.request_id for update;
  if not (public.is_client_member(r.client_id) or public.has_role('agente', 'superadmin')) then
    raise exception 'No tienes permiso para aceptar esta oferta';
  end if;
  if r.status not in ('buscando', 'ofertas') then raise exception 'La solicitud ya no admite ofertas'; end if;
  if o.availability = 'no' then raise exception 'Esa oferta no tiene disponibilidad'; end if;

  select coalesce(commission_pct, 5) into v_pct from public.provider_internal where provider_id = o.provider_id;
  select avg(price + transport) into v_avg from public.offers where request_id = r.id and availability <> 'no';

  insert into public.rentals (request_id, offer_id, client_id, site_id, provider_id, start_date, end_date, days, indefinite,
                              price, transport, deposit, payment_terms, saving, commission_pct, commission, accepted_by)
  values (r.id, o.id, r.client_id, r.site_id, o.provider_id,
          coalesce(o.delivery_date, r.start_date), coalesce(o.delivery_date, r.start_date) + r.days, r.days, r.indefinite,
          o.price, o.transport, o.deposit, o.payment_terms,
          greatest(0, round(coalesce(v_avg, 0) - (o.price + o.transport), 2)),
          coalesce(v_pct, 5), round(o.price * coalesce(v_pct, 5) / 100, 2), auth.uid())
  returning id into v_rental;

  update public.requests set status = 'aceptada' where id = r.id;
  return v_rental;
end $$;

-- El proveedor confirma la entrega en obra
create or replace function public.confirm_delivery(p_rental uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.rentals;
begin
  select * into t from public.rentals where id = p_rental for update;
  if not found then raise exception 'Alquiler no encontrado'; end if;
  if not (public.is_provider_member(t.provider_id) or public.has_role('agente', 'superadmin')) then raise exception 'Sin permiso'; end if;
  if t.status <> 'reservada' then raise exception 'El alquiler no está pendiente de entrega'; end if;
  update public.rentals set status = 'en_alquiler' where id = p_rental;
  update public.machines set status = 'alquilada' where id in (select machine_id from public.rental_machines where rental_id = p_rental);
  -- la factura se emite al iniciar el alquiler; vence según la forma de pago
  insert into public.invoices (rental_id, client_id, provider_id, issue_date, due_date, base)
  values (t.id, t.client_id, t.provider_id, current_date,
          current_date + case when t.payment_terms ~ '60' then 60 when t.payment_terms ~* 'contado' then 0 else 30 end, t.total)
  on conflict (rental_id) do nothing;
end $$;

-- El cliente da de baja la máquina (pide la recogida)
create or replace function public.request_baja(p_rental uuid, p_date date) returns void
language plpgsql security definer set search_path = public as $$
declare t public.rentals;
begin
  select * into t from public.rentals where id = p_rental for update;
  if not found then raise exception 'Alquiler no encontrado'; end if;
  if not (public.is_client_member(t.client_id) or public.has_role('agente', 'superadmin')) then raise exception 'Sin permiso'; end if;
  if t.status not in ('reservada', 'en_alquiler') then raise exception 'Este alquiler no se puede dar de baja'; end if;
  if p_date < current_date then raise exception 'La fecha de recogida no puede ser anterior a hoy'; end if;
  update public.rentals set status = 'baja_solicitada', baja_date = p_date where id = p_rental;
end $$;

-- El proveedor confirma la recogida: el alquiler finaliza y las máquinas vuelven a estar libres
create or replace function public.confirm_pickup(p_rental uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.rentals;
begin
  select * into t from public.rentals where id = p_rental for update;
  if not found then raise exception 'Alquiler no encontrado'; end if;
  if not (public.is_provider_member(t.provider_id) or public.has_role('agente', 'superadmin')) then raise exception 'Sin permiso'; end if;
  if t.status <> 'baja_solicitada' then raise exception 'El cliente todavía no ha pedido la baja'; end if;
  update public.rentals set status = 'finalizada', end_date = greatest(start_date, coalesce(baja_date, current_date)) where id = p_rental;
  update public.machines set status = 'operativa' where id in (select machine_id from public.rental_machines where rental_id = p_rental);
end $$;

-- =====================================================================================
-- VISTAS (security_invoker: respetan la RLS de quien consulta)
-- =====================================================================================

-- Comparativo: puntuación de cada oferta. Precio 30 · disponibilidad 25 · transporte 15 · valoración 15 · servicio 15
create or replace view public.offer_scores with (security_invoker = true) as
with base as (
  select o.*, (o.price + o.transport) as total,
         min(o.price + o.transport) over (partition by o.request_id) as min_total,
         coalesce((select avg(v.stars) from public.reviews v where v.provider_id = o.provider_id), p.rating) as provider_rating
    from public.offers o
    join public.providers p on p.id = o.provider_id
   where o.availability <> 'no'
)
select b.id as offer_id, b.request_id, b.provider_id, b.total, b.provider_rating,
       round(
           0.30 * (b.min_total / nullif(b.total, 0) * 100)
         + 0.25 * (case when b.availability = 'si' then 100 else greatest(40, 80 - 15 * b.delay_days) end)
         + 0.15 * (case when b.transport = 0 then 100 else greatest(20, 100 - coalesce(b.distance_km, 30) * 0.45) end)
         + 0.15 * (b.provider_rating / 5 * 100)
         + 0.15 * (case when coalesce(b.assistance_hours, 24) <= 2 then 100 when b.assistance_hours <= 4 then 88 when b.assistance_hours <= 12 then 70 else 52 end)
       )::integer as score,
       row_number() over (partition by b.request_id order by
           0.30 * (b.min_total / nullif(b.total, 0) * 100)
         + 0.25 * (case when b.availability = 'si' then 100 else greatest(40, 80 - 15 * b.delay_days) end)
         + 0.15 * (case when b.transport = 0 then 100 else greatest(20, 100 - coalesce(b.distance_km, 30) * 0.45) end)
         + 0.15 * (b.provider_rating / 5 * 100)
         + 0.15 * (case when coalesce(b.assistance_hours, 24) <= 2 then 100 when b.assistance_hours <= 4 then 88 when b.assistance_hours <= 12 then 70 else 52 end) desc,
           b.total asc) as position
  from base b;

-- Facturas con su estado calculado
create or replace view public.invoice_status with (security_invoker = true) as
select i.*, case when i.paid_at is not null then 'pagada' when i.due_date < current_date then 'vencida' else 'pendiente' end as status
  from public.invoices i;

-- Actividad de cada proveedor (para el ranking interno del CRM)
create or replace view public.provider_stats with (security_invoker = true) as
select p.id as provider_id, p.name,
       count(c.request_id)                                              as contacted,
       count(c.responded_at)                                            as responded,
       round(avg(extract(epoch from (c.responded_at - c.sent_at)) / 60)) as avg_response_min,
       (select count(*) from public.rentals t where t.provider_id = p.id)              as rentals_won,
       (select coalesce(sum(t.price), 0) from public.rentals t where t.provider_id = p.id)      as volume,
       (select coalesce(sum(t.commission), 0) from public.rentals t where t.provider_id = p.id) as commission,
       (select count(*) from public.incidents n join public.rentals t on t.id = n.rental_id where t.provider_id = p.id) as incidents,
       coalesce((select round(avg(v.stars), 1) from public.reviews v where v.provider_id = p.id), p.rating) as rating
  from public.providers p
  left join public.request_contacts c on c.provider_id = p.id
 group by p.id;

-- =====================================================================================
-- RLS: quién puede leer y escribir cada tabla
-- =====================================================================================
alter table public.profiles           enable row level security;
alter table public.clients            enable row level security;
alter table public.client_members     enable row level security;
alter table public.providers          enable row level security;
alter table public.provider_internal  enable row level security;
alter table public.provider_members   enable row level security;
alter table public.families           enable row level security;
alter table public.machine_types      enable row level security;
alter table public.family_fields      enable row level security;
alter table public.provider_families  enable row level security;
alter table public.provider_provinces enable row level security;
alter table public.sites              enable row level security;
alter table public.requests           enable row level security;
alter table public.request_items      enable row level security;
alter table public.request_contacts   enable row level security;
alter table public.offers             enable row level security;
alter table public.machines           enable row level security;
alter table public.machine_documents  enable row level security;
alter table public.rentals            enable row level security;
alter table public.rental_machines    enable row level security;
alter table public.incidents          enable row level security;
alter table public.reviews            enable row level security;
alter table public.invoices           enable row level security;
alter table public.favorites          enable row level security;
alter table public.audit_log          enable row level security;

-- ---------- Perfiles ----------
create policy "perfil: verlo uno mismo o el equipo" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff());
create policy "perfil: editar el propio" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());              -- rol y estado los protege el disparador
create policy "perfil: superadmin gestiona" on public.profiles for update to authenticated
  using (public.has_role('superadmin')) with check (public.has_role('superadmin'));

-- ---------- Clientes ----------
create policy "cliente: miembros, equipo y proveedores con solicitud suya" on public.clients for select to authenticated
  using (public.is_client_member(id) or public.is_staff()
         or exists (select 1 from public.requests r where r.client_id = clients.id and public.is_contacted_provider(r.id)));
create policy "cliente: lo edita su empresa o administración" on public.clients for update to authenticated
  using (public.is_client_member(id) or public.has_role('administracion', 'superadmin'))
  with check (public.is_client_member(id) or public.has_role('administracion', 'superadmin'));
create policy "cliente: alta por el equipo" on public.clients for insert to authenticated
  with check (public.has_role('agente', 'superadmin'));

create policy "miembros cliente: ver" on public.client_members for select to authenticated
  using (user_id = auth.uid() or public.is_client_member(client_id) or public.is_staff());
create policy "miembros cliente: gestiona superadmin" on public.client_members for all to authenticated
  using (public.has_role('superadmin')) with check (public.has_role('superadmin'));

-- ---------- Proveedores ----------
create policy "proveedor: homologados visibles, el resto para los suyos y el equipo" on public.providers for select to authenticated
  using (status = 'homologado' or public.is_provider_member(id) or public.is_staff());
create policy "proveedor: edita su ficha o el equipo" on public.providers for update to authenticated
  using (public.is_provider_member(id) or public.has_role('agente', 'superadmin'))
  with check (public.is_provider_member(id) or public.has_role('agente', 'superadmin'));  -- el estado lo protege el disparador
create policy "proveedor: alta por el equipo" on public.providers for insert to authenticated
  with check (public.has_role('agente', 'superadmin'));

create policy "interno proveedor: equipo y el propio proveedor" on public.provider_internal for select to authenticated
  using (public.is_staff() or public.is_provider_member(provider_id));
create policy "interno proveedor: lo cambia el equipo" on public.provider_internal for all to authenticated
  using (public.has_role('agente', 'administracion', 'superadmin')) with check (public.has_role('agente', 'administracion', 'superadmin'));

create policy "miembros proveedor: ver" on public.provider_members for select to authenticated
  using (user_id = auth.uid() or public.is_provider_member(provider_id) or public.is_staff());
create policy "miembros proveedor: gestiona superadmin" on public.provider_members for all to authenticated
  using (public.has_role('superadmin')) with check (public.has_role('superadmin'));

create policy "familias proveedor: ver" on public.provider_families for select to authenticated using (true);
create policy "familias proveedor: editar" on public.provider_families for all to authenticated
  using (public.is_provider_member(provider_id) or public.has_role('agente', 'superadmin'))
  with check (public.is_provider_member(provider_id) or public.has_role('agente', 'superadmin'));
create policy "provincias proveedor: ver" on public.provider_provinces for select to authenticated using (true);
create policy "provincias proveedor: editar" on public.provider_provinces for all to authenticated
  using (public.is_provider_member(provider_id) or public.has_role('agente', 'superadmin'))
  with check (public.is_provider_member(provider_id) or public.has_role('agente', 'superadmin'));

-- ---------- Catálogo: público para leer, superadmin para cambiar ----------
create policy "catálogo: leer" on public.families      for select to anon, authenticated using (true);
create policy "catálogo: leer" on public.machine_types for select to anon, authenticated using (true);
create policy "catálogo: leer" on public.family_fields for select to anon, authenticated using (true);
create policy "catálogo: editar" on public.families      for all to authenticated using (public.has_role('superadmin')) with check (public.has_role('superadmin'));
create policy "catálogo: editar" on public.machine_types for all to authenticated using (public.has_role('superadmin')) with check (public.has_role('superadmin'));
create policy "catálogo: editar" on public.family_fields for all to authenticated using (public.has_role('superadmin')) with check (public.has_role('superadmin'));

-- ---------- Obras ----------
create policy "obras: su empresa y el equipo" on public.sites for select to authenticated
  using (public.is_client_member(client_id) or public.is_staff());
create policy "obras: las gestiona su empresa" on public.sites for all to authenticated
  using (public.is_client_member(client_id) or public.has_role('agente', 'superadmin'))
  with check (public.is_client_member(client_id) or public.has_role('agente', 'superadmin'));

-- ---------- Solicitudes ----------
create policy "solicitud: cliente, equipo y proveedores contactados" on public.requests for select to authenticated
  using (public.is_client_member(client_id) or public.is_staff() or public.is_contacted_provider(id));
create policy "solicitud: la crea el cliente o un agente" on public.requests for insert to authenticated
  with check (public.is_client_member(client_id) or public.has_role('agente', 'superadmin'));
create policy "solicitud: la modifica el cliente o un agente" on public.requests for update to authenticated
  using (public.is_client_member(client_id) or public.has_role('agente', 'superadmin'))
  with check (public.is_client_member(client_id) or public.has_role('agente', 'superadmin'));

create policy "líneas: como su solicitud" on public.request_items for select to authenticated
  using (public.is_client_member(public.request_client(request_id)) or public.is_staff() or public.is_contacted_provider(request_id));
create policy "líneas: las escribe el cliente o un agente" on public.request_items for all to authenticated
  using (public.is_client_member(public.request_client(request_id)) or public.has_role('agente', 'superadmin'))
  with check (public.is_client_member(public.request_client(request_id)) or public.has_role('agente', 'superadmin'));

create policy "contactos: cliente, proveedor implicado y equipo" on public.request_contacts for select to authenticated
  using (public.is_client_member(public.request_client(request_id)) or public.is_provider_member(provider_id) or public.is_staff());
create policy "contactos: los gestiona un agente" on public.request_contacts for all to authenticated
  using (public.has_role('agente', 'superadmin')) with check (public.has_role('agente', 'superadmin'));

-- ---------- Ofertas ----------
create policy "oferta: su proveedor, el cliente de la solicitud y el equipo" on public.offers for select to authenticated
  using (public.is_provider_member(provider_id) or public.is_client_member(public.request_client(request_id)) or public.is_staff());
create policy "oferta: la envía el proveedor contactado mientras la solicitud está abierta" on public.offers for insert to authenticated
  with check ((public.is_provider_member(provider_id) or public.has_role('agente', 'superadmin'))
              and exists (select 1 from public.requests r where r.id = request_id and r.status in ('buscando', 'ofertas')));
create policy "oferta: la modifica su proveedor mientras la solicitud está abierta" on public.offers for update to authenticated
  using ((public.is_provider_member(provider_id) or public.has_role('agente', 'superadmin'))
         and exists (select 1 from public.requests r where r.id = request_id and r.status in ('buscando', 'ofertas')))
  with check (public.is_provider_member(provider_id) or public.has_role('agente', 'superadmin'));

-- ---------- Flota y documentación ----------
create policy "máquina: su proveedor, el equipo y el cliente que la tiene alquilada" on public.machines for select to authenticated
  using (public.is_provider_member(provider_id) or public.is_staff()
         or exists (select 1 from public.rental_machines rm join public.rentals t on t.id = rm.rental_id
                     where rm.machine_id = machines.id and public.is_client_member(t.client_id)));
create policy "máquina: la gestiona su proveedor" on public.machines for all to authenticated
  using (public.is_provider_member(provider_id) or public.has_role('agente', 'superadmin'))
  with check (public.is_provider_member(provider_id) or public.has_role('agente', 'superadmin'));

create policy "documento: como su máquina" on public.machine_documents for select to authenticated
  using (exists (select 1 from public.machines m where m.id = machine_id));          -- hereda la RLS de machines
create policy "documento: lo gestiona su proveedor" on public.machine_documents for all to authenticated
  using (exists (select 1 from public.machines m where m.id = machine_id and (public.is_provider_member(m.provider_id) or public.has_role('agente', 'superadmin'))))
  with check (exists (select 1 from public.machines m where m.id = machine_id and (public.is_provider_member(m.provider_id) or public.has_role('agente', 'superadmin'))));

-- ---------- Alquileres (se crean y cambian de estado solo con las funciones RPC) ----------
create policy "alquiler: cliente, proveedor y equipo" on public.rentals for select to authenticated
  using (public.is_client_member(client_id) or public.is_provider_member(provider_id) or public.is_staff());
create policy "alquiler: administración liquida y corrige" on public.rentals for update to authenticated
  using (public.has_role('administracion', 'superadmin')) with check (public.has_role('administracion', 'superadmin'));

create policy "máquinas del alquiler: ver" on public.rental_machines for select to authenticated
  using (exists (select 1 from public.rentals t where t.id = rental_id));             -- hereda la RLS de rentals
create policy "máquinas del alquiler: las asigna el proveedor" on public.rental_machines for all to authenticated
  using (exists (select 1 from public.rentals t where t.id = rental_id and (public.is_provider_member(t.provider_id) or public.has_role('agente', 'superadmin'))))
  with check (exists (select 1 from public.rentals t where t.id = rental_id and (public.is_provider_member(t.provider_id) or public.has_role('agente', 'superadmin'))));

-- ---------- Incidencias ----------
create policy "incidencia: ver quien ve el alquiler" on public.incidents for select to authenticated
  using (exists (select 1 from public.rentals t where t.id = rental_id));
create policy "incidencia: la abre el cliente" on public.incidents for insert to authenticated
  with check (exists (select 1 from public.rentals t where t.id = rental_id and (public.is_client_member(t.client_id) or public.has_role('agente', 'superadmin'))));
create policy "incidencia: la atiende el proveedor o un agente" on public.incidents for update to authenticated
  using (exists (select 1 from public.rentals t where t.id = rental_id and (public.is_provider_member(t.provider_id) or public.has_role('agente', 'superadmin'))))
  with check (exists (select 1 from public.rentals t where t.id = rental_id and (public.is_provider_member(t.provider_id) or public.has_role('agente', 'superadmin'))));

-- ---------- Valoraciones ----------
create policy "valoración: visible para usuarios" on public.reviews for select to authenticated using (true);
create policy "valoración: la pone el cliente al terminar" on public.reviews for insert to authenticated
  with check (public.is_client_member(client_id)
              and exists (select 1 from public.rentals t where t.id = rental_id and t.client_id = reviews.client_id
                           and t.provider_id = reviews.provider_id and t.status = 'finalizada'));

-- ---------- Facturas ----------
create policy "factura: cliente, proveedor y equipo" on public.invoices for select to authenticated
  using (public.is_client_member(client_id) or public.is_provider_member(provider_id) or public.is_staff());
create policy "factura: la gestiona administración" on public.invoices for all to authenticated
  using (public.has_role('administracion', 'superadmin')) with check (public.has_role('administracion', 'superadmin'));

-- ---------- Habituales ----------
create policy "habituales: de su empresa" on public.favorites for all to authenticated
  using (public.is_client_member(client_id)) with check (public.is_client_member(client_id));

-- ---------- Auditoría ----------
create policy "auditoría: solo superadmin" on public.audit_log for select to authenticated
  using (public.has_role('superadmin'));

-- =====================================================================================
-- PERMISOS DE ACCESO (la RLS filtra después fila a fila)
-- =====================================================================================
grant usage on schema public to anon, authenticated;
grant select on public.families, public.machine_types, public.family_fields to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke insert, update, delete on public.audit_log from authenticated;
revoke insert, delete on public.rentals from authenticated;

revoke execute on all functions in schema public from public, anon;
grant execute on function public.my_role(), public.has_role(public.app_role[]), public.is_staff(),
  public.is_client_member(uuid), public.is_provider_member(uuid), public.is_contacted_provider(uuid), public.request_client(uuid),
  public.dispatch_request(uuid, integer), public.accept_offer(uuid), public.confirm_delivery(uuid),
  public.request_baja(uuid, date), public.confirm_pickup(uuid) to authenticated;
