-- =====================================================================================
-- MAQNOW · Flota del proveedor de prueba ("Alquileres de Prueba S.L.")
-- Ejecutar en Supabase → SQL Editor después de ofertas_reales.sql. Se puede repetir (borra y vuelve a crear su flota).
--
-- Con flota dada de alta, al proveedor solo le llegan solicitudes de estos TIPOS de máquina:
--   Plataformas: Tijera eléctrica, Brazo articulado diésel
--   Tierras:     Miniexcavadora, Dumper
--   Carretillas: Manipulador telescópico
--   Energía:     Generador insonorizado
-- Para probar que NO le llega: pide por ejemplo un "Rodillo tándem" o una "Bomba de lodos".
-- =====================================================================================
do $$
declare v uuid;
begin
  select id into v from public.providers where name = 'Alquileres de Prueba S.L.';
  if v is null then raise exception 'No existe el proveedor de prueba: crea antes el usuario proveedor@prueba.maqnow.es'; end if;

  delete from public.machines where provider_id = v;

  insert into public.machines (provider_id, family_id, machine_type, size_label, brand, model, year, serial_number, hours, status,
                               last_maintenance, next_maintenance, last_inspection) values
    (v, 'elevacion',   'Tijera eléctrica',            '8 m',       'Genie',      'GS-2632',  2022, 'GN-26320141', 1240, 'operativa',    current_date - 40, current_date + 50, current_date - 120),
    (v, 'elevacion',   'Tijera eléctrica',            '12 m',      'JLG',        '4045R',    2021, 'JL-40450988', 2310, 'operativa',    current_date - 25, current_date + 65, current_date - 90),
    (v, 'elevacion',   'Brazo articulado diésel',     '16 m',      'Haulotte',   'HA16 RTJ', 2020, 'HA-16773412', 3480, 'operativa',    current_date - 60, current_date + 30, current_date - 200),
    (v, 'tierras',     'Miniexcavadora',              '2 – 4 t',   'Kubota',     'KX030-4',  2023, 'KB-03011876',  860, 'operativa',    current_date - 15, current_date + 75, current_date - 60),
    (v, 'tierras',     'Dumper',                      'Hasta 2 t', 'Ausa',       'D150AHG',  2021, 'AU-15040021', 1975, 'mantenimiento', current_date - 3, current_date + 87, current_date - 150),
    (v, 'manutencion', 'Manipulador telescópico',     '4 t',       'Manitou',    'MT 1440',  2022, 'MN-14400733', 1630, 'operativa',    current_date - 30, current_date + 60, current_date - 110),
    (v, 'energia',     'Generador insonorizado',      '60 kVA',    'Atlas Copco','QAS 60',   2023, 'AC-60012984',  720, 'operativa',    current_date - 20, current_date + 70, current_date - 80);

  -- Documentación (pasaporte digital): todas con lo básico; a una le falta el seguro para ver el aviso
  insert into public.machine_documents (machine_id, doc_type, valid_until)
  select m.id, d.doc, case when d.doc in ('Seguro', 'Inspección periódica') then current_date + 200 end
    from public.machines m
   cross join (values ('Manual de usuario'), ('Ficha técnica'), ('Certificado CE'), ('Declaración de conformidad'),
                      ('Inspección periódica'), ('Plan de mantenimiento'), ('Seguro'), ('Fotografías')) as d(doc)
   where m.provider_id = v
     and not (m.machine_type = 'Dumper' and d.doc = 'Seguro');

  raise notice 'Flota creada: % máquinas', (select count(*) from public.machines where provider_id = v);
end $$;

select m.machine_type, m.size_label, m.brand, m.model, m.status from public.machines m
  join public.providers p on p.id = m.provider_id where p.name = 'Alquileres de Prueba S.L.' order by family_id, machine_type;
