-- =====================================================================================
-- MAQNOW · Ofertas reales de proveedores
--
-- Ejecutar en Supabase → SQL Editor DESPUÉS de schema.sql y seed.sql (se puede repetir sin romper nada).
--
-- Qué añade:
--   1. Datos de entrega en la solicitud (dirección, contacto en obra, referencia de pedido).
--   2. Un enlace privado por proveedor y solicitud (offer_links), que va en el email de aviso.
--      Lleva al proveedor a su panel; si aún no tiene cuenta, la crea vinculada a su ficha.
--      Solo el equipo MAQNOW puede leer esos enlaces.
--   3. La página del enlace (resumen de la petición) y el alta vinculada a la ficha del proveedor.
--   La oferta SIEMPRE se envía desde el panel del proveedor.
--   4. Tiempo real: el cliente ve llegar las ofertas sin recargar.
-- =====================================================================================

-- ---------- 1. Datos de entrega ----------
alter table public.requests add column if not exists address       text;
alter table public.requests add column if not exists contact_name  text;
alter table public.requests add column if not exists contact_phone text;
alter table public.requests add column if not exists order_ref     text;

-- ---------- 2. Enlaces privados por proveedor ----------
create table if not exists public.offer_links (
  token       uuid primary key default gen_random_uuid(),
  request_id  uuid not null,
  provider_id uuid not null,
  opened_at   timestamptz,                             -- el proveedor abrió el enlace
  created_at  timestamptz not null default now(),
  unique (request_id, provider_id),
  foreign key (request_id, provider_id) references public.request_contacts (request_id, provider_id) on delete cascade
);
alter table public.offer_links enable row level security;

drop policy if exists "enlaces: solo el equipo" on public.offer_links;
create policy "enlaces: solo el equipo" on public.offer_links for select to authenticated
  using (public.is_staff());
revoke all on public.offer_links from anon, authenticated;
grant select on public.offer_links to authenticated;

-- Cada proveedor contactado recibe su enlace automáticamente
create or replace function public.on_contact_created() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.offer_links (request_id, provider_id) values (new.request_id, new.provider_id)
  on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_contact_created on public.request_contacts;
create trigger on_contact_created after insert on public.request_contacts
  for each row execute function public.on_contact_created();

-- Enlaces para contactos que ya existían
insert into public.offer_links (request_id, provider_id)
select request_id, provider_id from public.request_contacts
on conflict do nothing;

-- ---------- 3. Página del enlace del email ----------
-- El email a cada proveedor es solo un aviso: el enlace lleva a una página con el resumen de la petición
-- y de ahí a su panel, donde envía la oferta. Si el proveedor aún no tiene cuenta, el mismo enlace
-- le permite crearla ya vinculada a su ficha (ver handle_new_user más abajo).
drop function if exists public.offer_link_submit(uuid, public.offer_availability, integer, numeric, numeric, numeric, text);

drop function if exists public.offer_link_view(uuid);
create or replace function public.offer_link_view(p_token uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  l public.offer_links;
  r public.requests;
  p public.providers;
  v_claimed boolean;
begin
  select * into l from public.offer_links where token = p_token;
  if not found then return null; end if;
  update public.offer_links set opened_at = coalesce(opened_at, now()) where token = p_token;
  select * into r from public.requests where id = l.request_id;
  select * into p from public.providers where id = l.provider_id;
  v_claimed := exists (select 1 from public.provider_members m where m.provider_id = p.id);
  return jsonb_build_object(
    'code', r.code,
    'open', r.status in ('buscando', 'ofertas'),
    'provider_id', p.id,
    'provider', p.name,
    'claimed', v_claimed,                                       -- el proveedor ya tiene cuenta
    'email', case when v_claimed then null else p.email end,    -- para rellenar el alta
    'offer_sent', exists (select 1 from public.offers o where o.request_id = l.request_id and o.provider_id = l.provider_id),
    'municipality', r.municipality, 'province', r.province,
    'start_date', r.start_date, 'days', r.days, 'urgent', r.urgent,
    'items', coalesce((select jsonb_agg(jsonb_build_object('type', i.machine_type, 'qty', i.quantity, 'family_name', f.name, 'specs', i.specs))
                         from public.request_items i join public.families f on f.id = i.family_id where i.request_id = r.id), '[]'::jsonb)
  );
end $$;
revoke execute on function public.offer_link_view(uuid) from public;
grant execute on function public.offer_link_view(uuid) to anon, authenticated;

-- Alta de usuario (sustituye a la de schema.sql): igual que antes, y además, si se registra desde
-- el enlace de un email (claim_token), la cuenta se vincula a la ficha de proveedor que ya existe
-- en vez de crear una nueva. Solo si esa ficha todavía no tiene ninguna cuenta.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta     jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role   public.app_role := case when meta ->> 'role' = 'proveedor' then 'proveedor' else 'cliente' end;
  v_name   text := coalesce(nullif(trim(meta ->> 'full_name'), ''), split_part(new.email, '@', 1));
  v_org    text := coalesce(nullif(trim(meta ->> 'company'), ''), v_name);
  v_id     uuid;
  v_claim  uuid;
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (new.id, new.email, v_name, meta ->> 'phone', v_role);
  if v_role = 'proveedor' then
    if coalesce(meta ->> 'claim_token', '') ~ '^[0-9a-fA-F-]{36}$' then
      select l.provider_id into v_claim
        from public.offer_links l
       where l.token = (meta ->> 'claim_token')::uuid
         and not exists (select 1 from public.provider_members m where m.provider_id = l.provider_id);
    end if;
    if v_claim is not null then
      insert into public.provider_members (provider_id, user_id) values (v_claim, new.id);
      update public.providers set contact_name = coalesce(nullif(contact_name, ''), v_name), phone = coalesce(nullif(phone, ''), meta ->> 'phone')
       where id = v_claim;
      return new;
    end if;
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

-- ---------- 4. Tiempo real (la RLS sigue filtrando qué ve cada uno) ----------
do $$
declare t text;
begin
  foreach t in array array['requests', 'request_contacts', 'offers', 'rentals'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
exception when undefined_object then null;  -- sin publicación de tiempo real: la web recarga cada 20 s
end $$;

-- ---------- 5. Avisos por email (función notify-providers + Resend) ----------
alter table public.offer_links add column if not exists notified_at timestamptz;  -- email con la solicitud enviado
alter table public.offer_links add column if not exists reminded_at timestamptz;  -- último recordatorio por email

-- ---------- 6. Envío por tipo de máquina ----------
-- La solicitud llega a un proveedor solo si tiene ese TIPO de máquina dado de alta en su flota
-- (misma familia y mismo tipo, p. ej. "Tijera eléctrica") para cada línea pedida.
-- Proveedores que aún no han dado de alta ninguna máquina (los de la base inicial, que todavía
-- no usan la plataforma): se les sigue enviando por familia, para no dejarlos fuera.
create or replace function public.provider_can_supply(p_provider uuid, p_request uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when exists (select 1 from public.machines m where m.provider_id = p_provider) then
      not exists (select 1 from public.request_items i
                   where i.request_id = p_request
                     and not exists (select 1 from public.machines m
                                      where m.provider_id = p_provider and m.family_id = i.family_id
                                        and lower(m.machine_type) = lower(i.machine_type)))
    else
      not exists (select 1 from public.request_items i
                   where i.request_id = p_request
                     and not exists (select 1 from public.provider_families pf where pf.provider_id = p_provider and pf.family_id = i.family_id))
  end
$$;

create or replace function public.dispatch_request(p_request uuid, p_max integer default 30) returns integer
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
     and public.provider_can_supply(p.id, r.id)
   order by p.rating * 20 + coalesce(pi.reliability, 80) desc
   limit greatest(1, least(p_max, 30))
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end $$;
revoke execute on function public.provider_can_supply(uuid, uuid) from public, anon;
grant execute on function public.dispatch_request(uuid, integer) to authenticated;
