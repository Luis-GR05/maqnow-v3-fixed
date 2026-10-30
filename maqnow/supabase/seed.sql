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
-- Nombre, base, cobertura, contacto, especialidad, estado, nivel y fuente salen de la base de proveedores de Málaga.
-- Valoración, tiempos de respuesta, servicio técnico, condiciones y comisión son VALORES PROVISIONALES:
-- sustitúyelos por los reales al captar y homologar a cada proveedor.
do $$
declare v uuid;
begin
  if not exists (select 1 from public.providers where name = 'LOXAM') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('LOXAM', 'nacional', 'homologado', 'Málaga', 'Málaga', 9, 4.4, 20, 2, 'Transferencia a 30 días', 'Maquinaria general, herramienta, plataformas', '951 763 765 / 689 985 600', 'malaga@loxam.es') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 5, 91, 'A', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'tierras', 'manutencion', 'compactacion', 'energia', 'herramientas', 'demolicion', 'bombas']);
  end if;
  if not exists (select 1 from public.providers where name = 'GAM Rentals') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('GAM Rentals', 'nacional', 'homologado', 'Málaga', 'Málaga', 11, 4.5, 30, 2, 'Confirming', 'Maquinaria general, elevación, movimiento de tierras, energía', '952 231 498 / 900 230 022', 'clientes@gamrentals') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 5, 93, 'A', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'tierras', 'energia', 'manutencion', 'compactacion']);
  end if;
  if not exists (select 1 from public.providers where name = 'Mateco') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Mateco', 'nacional', 'homologado', 'Málaga', 'Málaga', 12, 4.6, 40, 2, 'Transferencia a 30 días', 'Plataformas, carretillas, telescópicos, construcción', '952 233 121', 'malaga@mateco.es') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 5, 95, 'A', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'manutencion', 'tierras']);
  end if;
  if not exists (select 1 from public.providers where name = 'Jofemesa') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Jofemesa', 'nacional', 'homologado', 'Málaga', 'Málaga', 10, 4.5, 25, 2, 'Confirming', 'Plataformas, carretillas, maquinaria industrial', '951 173 730', 'jofemesamalaga@jofemesa.com') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 5, 92, 'A', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'manutencion']);
  end if;
  if not exists (select 1 from public.providers where name = 'Rino Alquiler') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Rino Alquiler', 'local', 'homologado', 'Málaga', 'Málaga', 8, 4.5, 35, 2, 'Tarjeta / contado', 'Excavadoras, plataformas, dumpers, energía, herramientas', '951 500 026', 'delegadomalaga@rinoalquileres.com') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 94, 'A', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['tierras', 'elevacion', 'energia', 'herramientas', 'compactacion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla']);
  end if;
  if not exists (select 1 from public.providers where name = 'Grupo Barea') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Grupo Barea', 'local', 'homologado', 'Málaga', 'Málaga', 7, 4.4, 20, 2, 'Transferencia a 30 días', 'Maquinaria general, elevación, energía, excavación, transporte', '952 242 424', 'bareamalaga@grupobarea.es') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 91, 'A', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'energia', 'tierras', 'manutencion', 'compactacion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla']);
  end if;
  if not exists (select 1 from public.providers where name = 'Alayan') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Alayan', 'nacional', 'homologado', 'Málaga', 'Málaga', 10, 4.5, 30, 2, 'Transferencia a 30 días', 'Excavadoras, dumpers, plataformas, telescópicos, energía', '900 101 651', 'malaga@alayanrentals.es') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 5, 93, 'A', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['tierras', 'elevacion', 'manutencion', 'energia']);
  end if;
  if not exists (select 1 from public.providers where name = 'Gómez Oviedo') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Gómez Oviedo', 'nacional', 'homologado', 'Málaga', 'Málaga', 7, 4.6, 40, 2, 'Confirming', 'Maquinaria general, jardinería, industria, energía', '951 551 951', 'malaga@gomezoviedo.com') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 5, 95, 'A', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['herramientas', 'energia', 'compactacion', 'bombas', 'tierras']);
  end if;
  if not exists (select 1 from public.providers where name = 'Maquinsa') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Maquinsa', 'local', 'homologado', 'Málaga', 'Málaga', 6, 4.2, 35, 4, 'Pagaré', 'Excavadoras, plataformas, herramientas, bombas, compactación', '952 173 870 / 649 889 181', 'info@alquilermaquinariamalaga.com') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 87, 'B', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['tierras', 'elevacion', 'herramientas', 'bombas', 'compactacion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga']);
  end if;
  if not exists (select 1 from public.providers where name = 'Malaca') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Malaca', 'local', 'homologado', 'Málaga', 'Málaga', 9, 4.3, 45, 4, 'Tarjeta / contado', 'Plataformas, carretillas, manipuladores, miniexcavadoras, dumpers', '611 364 860', 'administracion@alquilermalaca.com') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 89, 'B', 'Web/registro previo');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'manutencion', 'tierras']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga']);
  end if;
  if not exists (select 1 from public.providers where name = 'Grupo Campos') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Grupo Campos', 'local', 'homologado', 'Málaga', 'Málaga', 12, 4, 45, 8, 'Transferencia a 30 días', 'Maquinaria ligera, miniexcavadoras, dumpers, jardinería', '952 215 163', 'info@grupocampos.es') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 82, 'C', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['tierras', 'herramientas', 'compactacion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga']);
  end if;
  if not exists (select 1 from public.providers where name = 'Axor') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Axor', 'nacional', 'homologado', 'Málaga', 'Málaga', 9, 4.5, 30, 2, 'Confirming', 'Maquinaria y herramientas', '951 572 655', 'malaga@axor-rentals.com') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 5, 93, 'A', 'Web/registro previo');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['herramientas', 'compactacion', 'energia', 'tierras']);
  end if;
  if not exists (select 1 from public.providers where name = 'Simsur') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Simsur', 'local', 'homologado', 'Málaga', 'Málaga', 10, 4.4, 50, 4, 'Transferencia a 60 días', 'Plataformas, carretillas, dumpers, energía, obra pública', '951 439 907', 'administracion@simsur.es') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 90, 'B', 'Web/Google Business');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'manutencion', 'tierras', 'energia']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla']);
  end if;
  if not exists (select 1 from public.providers where name = 'Altesur') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Altesur', 'local', 'homologado', 'Alhaurín de la Torre', 'Málaga', 15, 4.2, 35, 4, 'Pagaré', 'Plataformas, camión grúa, carretillas, grupos, movimiento de tierras', '952 004 775', 'info@altesur.com') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 87, 'B', 'Web/registro previo');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'manutencion', 'energia', 'tierras']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga']);
  end if;
  if not exists (select 1 from public.providers where name = 'Remsa') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Remsa', 'nacional', 'homologado', 'Cártama', 'Málaga', 22, 4.5, 35, 2, 'Transferencia a 30 días', 'Excavadoras, dumpers, telescópicos, plataformas, carretillas', '952 421 078', 'remsa@remsa.net') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 5, 94, 'A', 'Web/Google Business');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['tierras', 'manutencion', 'elevacion']);
  end if;
  if not exists (select 1 from public.providers where name = 'Malsa') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Malsa', 'local', 'homologado', 'Málaga', 'Málaga', 8, 4.2, 30, 4, 'Transferencia a 30 días', 'Carretillas, plataformas, dumpers, limpieza, jardinería', '900 460 060', 'hola@grupomamsa.com') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 86, 'B', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['manutencion', 'elevacion', 'tierras', 'herramientas']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla']);
  end if;
  if not exists (select 1 from public.providers where name = 'ToolQuick / Kiloutou Málaga') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('ToolQuick / Kiloutou Málaga', 'nacional', 'homologado', 'Málaga', 'Málaga', 5, 4.3, 40, 4, 'Transferencia a 30 días', 'Herramienta y maquinaria ligera', '951 121 528', 'malaga@toolquick.es') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 5, 88, 'B', 'Web/Google Business');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['herramientas', 'compactacion', 'energia', 'bombas', 'demolicion']);
  end if;
  if not exists (select 1 from public.providers where name = 'Alquimálaga') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Alquimálaga', 'local', 'homologado', 'Málaga', 'Málaga', 8, 4.4, 50, 4, 'Transferencia a 60 días', 'Plataformas, dumpers, compactación, herramientas, grupos', '952 082 900 / 601 376 226', 'info@alkimalaga.com') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 90, 'B', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion', 'tierras', 'compactacion', 'herramientas', 'energia']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga']);
  end if;
  if not exists (select 1 from public.providers where name = 'Montero') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Montero', 'nacional', 'homologado', 'Málaga', 'Málaga', 9, 4.5, 25, 2, 'Transferencia a 30 días', 'Maquinaria de construcción y obra pública', '952 176 204', 'clientes@montero.es') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 5, 92, 'A', 'Google Business/Páginas Amarillas');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['tierras', 'compactacion', 'elevacion', 'energia']);
  end if;
  if not exists (select 1 from public.providers where name = 'Grúas Lozano') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Grúas Lozano', 'local', 'homologado', 'Málaga', 'Málaga', 9, 4.5, 35, 2, 'Tarjeta / contado', 'Grúas, plataformas, elevación, transporte', '952 179 478', 'gruaslozano@gruaslozano.com') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 94, 'A', 'Directorio/web');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla', 'Badajoz', 'Cáceres']);
  end if;
  if not exists (select 1 from public.providers where name = 'Grúas Álvarez') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Grúas Álvarez', 'local', 'homologado', 'Málaga', 'Málaga', 10, 4.4, 20, 2, 'Transferencia a 30 días', 'Grúas móviles, minigrúas, camiones pluma, plataformas', '600 476 152 / 629 820 706', 'pedidos@gruasalvarez.com') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 91, 'A', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla']);
  end if;
  if not exists (select 1 from public.providers where name = 'Tobelem') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Tobelem', 'local', 'homologado', 'Cártama', 'Málaga', 22, 4.3, 40, 4, 'Confirming', 'Grúas torre, plataformas cremallera, montacargas', '952 325 200 / 658 969 440', 'comercial@tobelem.pro') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 88, 'B', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla']);
  end if;
  if not exists (select 1 from public.providers where name = 'Doysa') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Doysa', 'local', 'pendiente', 'Málaga', 'Málaga', 9, 4.4, 50, 4, 'Transferencia a 60 días', 'Venta de Maquinaria y equipos nuevos/seminuevos', '952 239 955 / 958 405 027', 'info@comercialdoysa.es') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 90, 'B', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['tierras', 'compactacion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga']);
  end if;
  if not exists (select 1 from public.providers where name = 'Toolhire Marbella') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Toolhire Marbella', 'local', 'homologado', 'Marbella', 'Málaga', 58, 4, 50, 8, 'Pagaré', 'Herramienta y maquinaria, plataformas', '952 77 57 86', 'toolhire@toolhiremarbella.es') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 83, 'C', 'Web oficial');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['herramientas', 'elevacion', 'compactacion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga']);
  end if;
  if not exists (select 1 from public.providers where name = 'AMG') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('AMG', 'local', 'homologado', 'Churriana', 'Málaga', 9, 4.5, 35, 2, 'Tarjeta / contado', 'Maquinaria de construcción', '952 560 388', 'presupuestos@amgalquiler.com') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 94, 'A', 'Google Business');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['tierras', 'compactacion', 'elevacion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla', 'Barcelona']);
  end if;
  if not exists (select 1 from public.providers where name = 'Femacon') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Femacon', 'local', 'homologado', 'Málaga', 'Málaga', 9, 4.4, 20, 2, 'Transferencia a 30 días', 'Alquiler maquinaria construcción', '952 354 008', 'malaga@femaconalquileres.net') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 91, 'A', 'Páginas Amarillas');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['tierras', 'compactacion', 'elevacion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla']);
  end if;
  if not exists (select 1 from public.providers where name = 'AM Sáez') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('AM Sáez', 'local', 'homologado', 'Málaga', 'Málaga', 9, 4.3, 40, 4, 'Confirming', 'Maquinaria construcción', '655 844 545', 'info@amsaez.com') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 7, 88, 'B', 'Páginas Amarillas');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['tierras', 'compactacion']);
    insert into public.provider_provinces (provider_id, province) select v, unnest(array['Málaga']);
  end if;
  if not exists (select 1 from public.providers where name = 'Europlataformas') then
    insert into public.providers (name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, phone, email)
    values ('Europlataformas', 'nacional', 'pendiente', 'Málaga', 'Málaga', 10, 4.6, 40, 2, 'Confirming', 'Maquinaria / grúas', '630 035 862', 'jpacheco@europlataformas.es') returning id into v;
    insert into public.provider_internal (provider_id, commission_pct, reliability, level, source) values (v, 5, 95, 'A', 'Páginas Amarillas');
    insert into public.provider_families (provider_id, family_id) select v, unnest(array['elevacion']);
  end if;
end $$;
