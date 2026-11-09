-- =====================================================================================
-- MAQNOW · Ofertas reales de proveedores
--
-- Ejecutar en Supabase → SQL Editor DESPUÉS de schema.sql y seed.sql (se puede repetir sin romper nada).
--
-- Qué añade:
--   1. Datos de entrega en la solicitud (dirección, contacto en obra, referencia de pedido).
--   2. Un enlace privado por proveedor y solicitud (offer_links). Con él, el proveedor ve la petición
--      y envía su precio sin tener cuenta. Solo el equipo MAQNOW puede leer esos enlaces.
--   3. Funciones públicas para la página del enlace: ver la petición y enviar la oferta.
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

-- ---------- 3. Página del enlace (sin cuenta) ----------
-- Devuelve la petición tal como la ve el proveedor: qué, dónde y cuándo. Sin datos del cliente
-- hasta que acepte su oferta.
create or replace function public.offer_link_view(p_token uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  l public.offer_links;
  r public.requests;
  p public.providers;
  o public.offers;
  v_rental public.rentals;
begin
  select * into l from public.offer_links where token = p_token;
  if not found then return null; end if;
  update public.offer_links set opened_at = coalesce(opened_at, now()) where token = p_token;
  select * into r from public.requests where id = l.request_id;
  select * into p from public.providers where id = l.provider_id;
  select * into o from public.offers where request_id = l.request_id and provider_id = l.provider_id;
  select * into v_rental from public.rentals where request_id = l.request_id;
  return jsonb_build_object(
    'code', r.code,
    'status', r.status,
    'open', r.status in ('buscando', 'ofertas'),
    'won', v_rental.provider_id = l.provider_id,
    'provider', jsonb_build_object('name', p.name, 'base_km', p.base_km, 'assistance_hours', p.assistance_hours, 'payment_terms', p.payment_terms),
    'municipality', r.municipality, 'province', r.province, 'postal_code', r.postal_code,
    'start_date', r.start_date, 'days', r.days, 'indefinite', r.indefinite,
    'delivery', r.delivery, 'urgent', r.urgent, 'notes', r.notes,
    'items', coalesce((select jsonb_agg(jsonb_build_object('family', i.family_id, 'family_name', f.name, 'type', i.machine_type, 'qty', i.quantity, 'specs', i.specs))
                         from public.request_items i join public.families f on f.id = i.family_id where i.request_id = r.id), '[]'::jsonb),
    'offer', case when o.id is null then null else jsonb_build_object(
      'availability', o.availability, 'delay_days', o.delay_days, 'price', o.price, 'transport', o.transport,
      'deposit', o.deposit, 'notes', o.notes, 'updated_at', o.updated_at) end,
    -- datos de entrega: solo si su oferta ha sido la elegida
    'site', case when v_rental.provider_id = l.provider_id then jsonb_build_object(
      'address', r.address, 'contact_name', r.contact_name, 'contact_phone', r.contact_phone, 'order_ref', r.order_ref,
      'client', (select name from public.clients c where c.id = r.client_id)) else null end
  );
end $$;

-- El proveedor envía (o corrige) su oferta mientras la solicitud está abierta
create or replace function public.offer_link_submit(
  p_token uuid, p_availability public.offer_availability, p_delay_days integer,
  p_price numeric, p_transport numeric, p_deposit numeric default null, p_notes text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  l public.offer_links;
  r public.requests;
  p public.providers;
begin
  select * into l from public.offer_links where token = p_token;
  if not found then raise exception 'Enlace no válido'; end if;
  select * into r from public.requests where id = l.request_id for update;
  if r.status not in ('buscando', 'ofertas') then raise exception 'Esta solicitud ya está cerrada'; end if;
  if p_availability <> 'no' and coalesce(p_price, 0) <= 0 then raise exception 'Indica el precio del alquiler'; end if;
  if coalesce(p_price, 0) < 0 or coalesce(p_transport, 0) < 0 or coalesce(p_deposit, 0) < 0 then raise exception 'Los importes no pueden ser negativos'; end if;
  select * into p from public.providers where id = l.provider_id;
  insert into public.offers (request_id, provider_id, availability, delay_days, price, transport, deposit,
                             delivery_date, distance_km, assistance_hours, payment_terms, notes)
  values (l.request_id, l.provider_id, p_availability,
          case when p_availability = 'parcial' then greatest(1, coalesce(p_delay_days, 1)) else 0 end,
          case when p_availability = 'no' then 0 else round(p_price, 2) end,
          case when p_availability = 'no' then 0 else round(coalesce(p_transport, 0), 2) end,
          case when p_availability = 'no' then 0 else round(coalesce(p_deposit, greatest(150, round(p_price * 0.3 / 50) * 50)), 2) end,
          r.start_date + case when p_availability = 'parcial' then greatest(1, coalesce(p_delay_days, 1)) else 0 end,
          p.base_km, p.assistance_hours, p.payment_terms, nullif(trim(coalesce(p_notes, '')), ''))
  on conflict (request_id, provider_id) do update set
    availability = excluded.availability, delay_days = excluded.delay_days, price = excluded.price,
    transport = excluded.transport, deposit = excluded.deposit, delivery_date = excluded.delivery_date,
    notes = excluded.notes;
end $$;

revoke execute on function public.offer_link_view(uuid) from public;
revoke execute on function public.offer_link_submit(uuid, public.offer_availability, integer, numeric, numeric, numeric, text) from public;
grant execute on function public.offer_link_view(uuid) to anon, authenticated;
grant execute on function public.offer_link_submit(uuid, public.offer_availability, integer, numeric, numeric, numeric, text) to anon, authenticated;

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
