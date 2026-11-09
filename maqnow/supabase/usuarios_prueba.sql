-- =====================================================================================
-- MAQNOW · Usuarios de prueba (SOLO para probar; bórralos antes de abrir la web al público)
--
-- Ejecutar en Supabase → SQL Editor DESPUÉS de schema.sql, seed.sql y ofertas_reales.sql.
-- Se puede repetir: si el usuario ya existe, no lo duplica.
--
--   Cliente    → cliente@prueba.maqnow.es    / Prueba1234!   (empresa "Obras de Prueba S.L.")
--   Proveedor  → proveedor@prueba.maqnow.es  / Prueba1234!   (ficha "Alquileres de Prueba S.L.", homologada,
--                                                             Málaga, todas las familias de maquinaria)
--
-- El email queda confirmado: se puede entrar directamente sin abrir ningún correo.
-- =====================================================================================

create or replace function pg_temp.crear_usuario_prueba(p_email text, p_password text, p_meta jsonb)
returns uuid language plpgsql as $$
declare v_id uuid;
begin
  select id into v_id from auth.users where email = p_email;
  if v_id is not null then return v_id; end if;
  v_id := gen_random_uuid();
  -- el disparador on_auth_user_created crea el perfil y la empresa (cliente) o la ficha (proveedor)
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
    '{"provider": "email", "providers": ["email"]}', p_meta, now(), now(),
    '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text, jsonb_build_object('sub', v_id::text, 'email', p_email, 'email_verified', true),
          'email', now(), now(), now());
  return v_id;
end $$;

do $$
declare
  v_cliente   uuid;
  v_proveedor uuid;
  v_prov      uuid;
begin
  -- Cliente
  v_cliente := pg_temp.crear_usuario_prueba('cliente@prueba.maqnow.es', 'Prueba1234!', jsonb_build_object(
    'full_name', 'Cliente de Prueba', 'role', 'cliente', 'company', 'Obras de Prueba S.L.',
    'cif', 'B00000099', 'phone', '600 000 099', 'province', 'Málaga'));

  -- Proveedor
  v_proveedor := pg_temp.crear_usuario_prueba('proveedor@prueba.maqnow.es', 'Prueba1234!', jsonb_build_object(
    'full_name', 'Proveedor de Prueba', 'role', 'proveedor', 'company', 'Alquileres de Prueba S.L.',
    'phone', '600 000 098', 'province', 'Málaga', 'city', 'Málaga',
    'families', (select jsonb_agg(id) from public.families)));

  -- Ficha del proveedor lista para recibir solicitudes: homologada, con buena valoración
  -- (así entra entre los proveedores contactados) y con todas las familias de maquinaria
  select provider_id into v_prov from public.provider_members where user_id = v_proveedor;
  update public.providers
     set status = 'homologado', rating = 5, response_min = 10, assistance_hours = 2, base_km = 5
   where id = v_prov;
  update public.provider_internal set reliability = 100, level = 'A', source = 'Usuario de prueba' where provider_id = v_prov;
  insert into public.provider_families (provider_id, family_id) select v_prov, id from public.families on conflict do nothing;
  insert into public.provider_provinces (provider_id, province) values (v_prov, 'Málaga') on conflict do nothing;

  raise notice 'Cliente: % · Proveedor: % (ficha %)', v_cliente, v_proveedor, v_prov;
end $$;

-- Comprobación: deben salir los dos usuarios con su rol y su empresa
select p.email, p.role,
       coalesce(c.name, pr.name) as empresa,
       pr.status as estado_proveedor
  from public.profiles p
  left join public.client_members cm on cm.user_id = p.id
  left join public.clients c on c.id = cm.client_id
  left join public.provider_members pm on pm.user_id = p.id
  left join public.providers pr on pr.id = pm.provider_id
 where p.email in ('cliente@prueba.maqnow.es', 'proveedor@prueba.maqnow.es');

-- Para borrarlos más adelante:
--   delete from auth.users where email in ('cliente@prueba.maqnow.es', 'proveedor@prueba.maqnow.es');
--   (la empresa y la ficha de proveedor quedan; bórralas desde el panel o con delete en clients / providers)
