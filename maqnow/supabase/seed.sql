-- =====================================================================================
-- MAQNOW · Datos iniciales. Ejecutar DESPUÉS de schema.sql.
-- Generado a partir de src/data/catalog.js y src/data/providers.js (se puede volver a ejecutar).
-- =====================================================================================

-- ---------- Catálogo de maquinaria ----------
insert into public.families (id, name, task, base_day, sort) values
  ('elevacion', 'Plataformas elevadoras', 'Trabajar en altura', 85, 1),
  ('tierras', 'Movimiento de tierras', 'Excavar o mover tierras', 110, 2),
  ('manutencion', 'Carretillas y manipuladores', 'Mover cargas y palés', 90, 3),
  ('compactacion', 'Compactación', 'Compactar terreno o asfalto', 45, 4),
  ('energia', 'Generadores y energía', 'Electricidad o iluminación', 40, 5),
  ('herramientas', 'Herramientas y pequeña maquinaria', 'Pequeños trabajos y reformas', 22, 6),
  ('demolicion', 'Demolición', 'Demoler o picar', 180, 7),
  ('bombas', 'Bombas y equipos auxiliares', 'Achicar agua y auxiliares', 30, 8)
on conflict (id) do update set name = excluded.name, task = excluded.task, base_day = excluded.base_day, sort = excluded.sort;

insert into public.machine_types (family_id, name, sort) values
  ('elevacion', 'Tijera eléctrica', 1),
  ('elevacion', 'Tijera diésel', 2),
  ('elevacion', 'Brazo articulado eléctrico', 3),
  ('elevacion', 'Brazo articulado diésel', 4),
  ('elevacion', 'Brazo telescópico', 5),
  ('elevacion', 'Sobre oruga', 6),
  ('elevacion', 'Mástil vertical', 7),
  ('elevacion', 'Camión cesta', 8),
  ('tierras', 'Miniexcavadora', 1),
  ('tierras', 'Excavadora de cadenas', 2),
  ('tierras', 'Retroexcavadora', 3),
  ('tierras', 'Pala cargadora', 4),
  ('tierras', 'Minicargadora', 5),
  ('tierras', 'Dumper', 6),
  ('tierras', 'Zanjadora', 7),
  ('manutencion', 'Carretilla eléctrica', 1),
  ('manutencion', 'Carretilla diésel', 2),
  ('manutencion', 'Carretilla todoterreno', 3),
  ('manutencion', 'Manipulador telescópico', 4),
  ('manutencion', 'Manipulador rotativo', 5),
  ('manutencion', 'Transpaleta eléctrica', 6),
  ('manutencion', 'Apilador', 7),
  ('compactacion', 'Bandeja vibrante', 1),
  ('compactacion', 'Pisón', 2),
  ('compactacion', 'Rodillo dúplex', 3),
  ('compactacion', 'Rodillo tándem', 4),
  ('compactacion', 'Rodillo mixto', 5),
  ('compactacion', 'Compactador de zanjas', 6),
  ('energia', 'Generador insonorizado', 1),
  ('energia', 'Generador portátil', 2),
  ('energia', 'Torre de iluminación', 3),
  ('energia', 'Sistema híbrido / baterías', 4),
  ('energia', 'Cuadro eléctrico de obra', 5),
  ('energia', 'Compresor', 6),
  ('herramientas', 'Martillo demoledor', 1),
  ('herramientas', 'Cortadora de juntas', 2),
  ('herramientas', 'Hormigonera', 3),
  ('herramientas', 'Taladro de corona', 4),
  ('herramientas', 'Hidrolimpiadora', 5),
  ('herramientas', 'Aspirador industrial', 6),
  ('herramientas', 'Fratasadora', 7),
  ('herramientas', 'Maquinaria de jardinería', 8),
  ('demolicion', 'Robot de demolición', 1),
  ('demolicion', 'Miniexcavadora con martillo', 2),
  ('demolicion', 'Pinza demoledora', 3),
  ('demolicion', 'Cizalla hidráulica', 4),
  ('demolicion', 'Trituradora de escombro', 5),
  ('bombas', 'Bomba sumergible', 1),
  ('bombas', 'Motobomba', 2),
  ('bombas', 'Bomba de lodos', 3),
  ('bombas', 'Deshumidificador', 4),
  ('bombas', 'Calefactor de obra', 5),
  ('bombas', 'Caseta / módulo de obra', 6)
on conflict (family_id, name) do update set sort = excluded.sort;

insert into public.family_fields (family_id, key, label, options, sort) values
  ('elevacion', 'altura', 'Altura de trabajo', '["8 m","10 m","12 m","16 m","20 m","Más de 20 m"]'::jsonb, 1),
  ('elevacion', 'uso', 'Interior / exterior', '["Interior","Exterior","Ambos"]'::jsonb, 2),
  ('elevacion', 'terreno', 'Terreno', '["Pavimento","Tierra","Mixto","Pendiente"]'::jsonb, 3),
  ('tierras', 'peso', 'Tamaño / peso', '["Hasta 2 t","2 – 4 t","5 – 8 t","10 – 15 t","Más de 20 t"]'::jsonb, 1),
  ('tierras', 'implemento', 'Implemento', '["Cazo estándar","Cazo de limpieza","Martillo hidráulico","Ahoyador","Sin implemento"]'::jsonb, 2),
  ('tierras', 'acceso', 'Acceso a la obra', '["Amplio","Estrecho (menos de 1,5 m)","Interior"]'::jsonb, 3),
  ('manutencion', 'carga', 'Capacidad de carga', '["1,5 t","2,5 t","3,5 t","4 t","5 t o más"]'::jsonb, 1),
  ('manutencion', 'elevacion', 'Altura de elevación', '["Hasta 4 m","6 m","10 m","14 m","17 m o más"]'::jsonb, 2),
  ('manutencion', 'terreno', 'Terreno', '["Nave / pavimento","Obra","Mixto"]'::jsonb, 3),
  ('compactacion', 'tamano', 'Tamaño', '["Manual (hasta 100 kg)","100 – 500 kg","1 – 3 t","7 – 12 t","Más de 12 t"]'::jsonb, 1),
  ('compactacion', 'material', 'Material', '["Tierra / zahorra","Asfalto","Ambos"]'::jsonb, 2),
  ('energia', 'potencia', 'Potencia', '["Hasta 10 kVA","20 kVA","60 kVA","100 kVA","200 kVA o más"]'::jsonb, 1),
  ('energia', 'regimen', 'Régimen de uso', '["Puntual","Jornada de 8 h","Continuo 24 h"]'::jsonb, 2),
  ('energia', 'combustible', 'Combustible', '["Lo pongo yo","Con suministro incluido"]'::jsonb, 3),
  ('herramientas', 'tamano', 'Tamaño', '["Ligero","Medio","Pesado"]'::jsonb, 1),
  ('herramientas', 'alimentacion', 'Alimentación', '["Eléctrica 230 V","Batería","Gasolina"]'::jsonb, 2),
  ('demolicion', 'tamano', 'Tamaño de equipo', '["Compacto (interiores)","Medio","Grande"]'::jsonb, 1),
  ('demolicion', 'material', 'Material', '["Tabiquería / ladrillo","Hormigón","Hormigón armado","Estructura metálica"]'::jsonb, 2),
  ('bombas', 'tamano', 'Capacidad', '["Pequeña","Media","Grande"]'::jsonb, 1),
  ('bombas', 'fluido', 'Uso', '["Aguas limpias","Aguas sucias","Lodos","No aplica"]'::jsonb, 2)
on conflict (family_id, key) do update set label = excluded.label, options = excluded.options, sort = excluded.sort;

-- ---------- Proveedores iniciales ----------
-- Los nombres, el ámbito y las especialidades salen de la revisión de mercado.
-- Valoración, tiempos de respuesta, servicio técnico, condiciones y comisión son VALORES PROVISIONALES:
-- sustitúyelos por los reales al captar y homologar a cada proveedor.
do $$
declare v uuid;
begin
  if not exists (select 1 from public.providers where name = 'LOXAM') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms)
    values ('LOXAM', 'nacional', 'homologado', 'Málaga', 'Málaga', 9, 4.4, 35, 4, 'Transferencia a 30 días') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability) values (v, 5, 92);
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'tierras', 'manutencion', 'compactacion', 'energia', 'herramientas', 'demolicion', 'bombas']);
  end if;
  if not exists (select 1 from public.providers where name = 'mateco') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms)
    values ('mateco', 'nacional', 'homologado', 'Málaga', 'Málaga', 12, 4.6, 25, 2, 'Transferencia a 30 días') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability) values (v, 5, 95);
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'manutencion', 'tierras', 'energia']);
  end if;
  if not exists (select 1 from public.providers where name = 'GAM') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms)
    values ('GAM', 'nacional', 'homologado', 'Málaga', 'Málaga', 11, 4.5, 30, 4, 'Confirming') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability) values (v, 5, 93);
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'manutencion', 'tierras', 'energia', 'compactacion']);
  end if;
  if not exists (select 1 from public.providers where name = 'Kiloutou') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms)
    values ('Kiloutou', 'nacional', 'homologado', 'Málaga', 'Málaga', 14, 4.3, 45, 4, 'Transferencia a 30 días') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability) values (v, 5, 90);
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'tierras', 'manutencion', 'compactacion', 'energia', 'herramientas', 'demolicion', 'bombas']);
  end if;
  if not exists (select 1 from public.providers where name = 'Rentaire') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms)
    values ('Rentaire', 'nacional', 'homologado', 'Madrid', 'Madrid', 16, 4.1, 70, 12, 'Transferencia a 60 días') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability) values (v, 6, 86);
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'manutencion', 'tierras']);
  end if;
  if not exists (select 1 from public.providers where name = 'Jofemesa') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms)
    values ('Jofemesa', 'nacional', 'homologado', 'Sevilla', 'Sevilla', 18, 4.2, 55, 12, 'Pagaré') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability) values (v, 6, 88);
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'manutencion', 'tierras', 'compactacion']);
  end if;
  if not exists (select 1 from public.providers where name = 'Maquinsa') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms)
    values ('Maquinsa', 'local', 'homologado', 'Málaga', 'Málaga', 6, 4.5, 20, 2, 'Transferencia a 30 días') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability) values (v, 7, 91);
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['tierras', 'compactacion', 'herramientas', 'energia', 'bombas', 'demolicion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga', 'Cádiz', 'Granada', 'Córdoba', 'Sevilla']);
  end if;
  if not exists (select 1 from public.providers where name = 'Rino Alquileres') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms)
    values ('Rino Alquileres', 'local', 'homologado', 'Málaga', 'Málaga', 8, 4.3, 28, 4, 'Tarjeta / contado') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability) values (v, 7, 89);
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['tierras', 'compactacion', 'herramientas', 'demolicion', 'bombas']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga', 'Cádiz', 'Granada', 'Córdoba', 'Sevilla']);
  end if;
  if not exists (select 1 from public.providers where name = 'SIM SIMSUR') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms)
    values ('SIM SIMSUR', 'local', 'homologado', 'Málaga', 'Málaga', 10, 4.4, 22, 2, 'Transferencia a 30 días') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability) values (v, 7, 92);
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'manutencion', 'energia']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga', 'Cádiz', 'Granada', 'Córdoba', 'Sevilla']);
  end if;
  if not exists (select 1 from public.providers where name = 'Montero Alquiler de Maquinaria') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms)
    values ('Montero Alquiler de Maquinaria', 'local', 'homologado', 'Málaga', 'Málaga', 15, 4, 60, 12, 'Tarjeta / contado') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability) values (v, 8, 84);
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['tierras', 'compactacion', 'herramientas', 'energia', 'elevacion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga', 'Granada', 'Córdoba']);
  end if;
  if not exists (select 1 from public.providers where name = 'Gómez Oviedo') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms)
    values ('Gómez Oviedo', 'local', 'homologado', 'Málaga', 'Málaga', 7, 4.2, 40, 4, 'Transferencia a 30 días') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability) values (v, 7, 87);
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['herramientas', 'compactacion', 'tierras', 'bombas', 'energia']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga', 'Cádiz', 'Granada']);
  end if;
  if not exists (select 1 from public.providers where name = 'Toolquick Málaga') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms)
    values ('Toolquick Málaga', 'local', 'homologado', 'Málaga', 'Málaga', 5, 4.1, 15, 2, 'Tarjeta / contado') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability) values (v, 8, 85);
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['herramientas', 'compactacion', 'energia', 'bombas', 'demolicion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga']);
  end if;
  if not exists (select 1 from public.providers where name = 'ALTESUR') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms)
    values ('ALTESUR', 'local', 'homologado', 'Málaga', 'Málaga', 13, 4.3, 33, 4, 'Confirming') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability) values (v, 7, 90);
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'manutencion', 'tierras', 'energia']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga', 'Cádiz', 'Granada', 'Córdoba', 'Sevilla']);
  end if;
  if not exists (select 1 from public.providers where name = 'Alquileres Grupo Campos') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms)
    values ('Alquileres Grupo Campos', 'local', 'homologado', 'Málaga', 'Málaga', 20, 3.9, 80, 24, 'Pagaré') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability) values (v, 8, 82);
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['tierras', 'compactacion', 'herramientas', 'elevacion', 'demolicion', 'bombas']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga', 'Cádiz', 'Sevilla']);
  end if;
end $$;
