// Catálogo: Familia → Tipo → Características. Cada familia pregunta solo lo suyo.
// baseDay = tarifa orientativa €/día del tipo y tamaño más pequeños (solo para la demo).

export const FAMILIES = [
  {
    id: 'elevacion', name: 'Plataformas elevadoras', task: 'Trabajar en altura', baseDay: 85,
    types: ['Tijera eléctrica', 'Tijera diésel', 'Brazo articulado eléctrico', 'Brazo articulado diésel', 'Brazo telescópico', 'Sobre oruga', 'Mástil vertical', 'Camión cesta'],
    fields: [
      { id: 'altura', label: 'Altura de trabajo', options: ['8 m', '10 m', '12 m', '16 m', '20 m', 'Más de 20 m'] },
      { id: 'uso', label: 'Interior / exterior', options: ['Interior', 'Exterior', 'Ambos'] },
      { id: 'terreno', label: 'Terreno', options: ['Pavimento', 'Tierra', 'Mixto', 'Pendiente'] },
    ],
    keywords: ['plataforma', 'altura', 'tijera', 'articulad', 'cesta', 'elevador', 'fachada'],
  },
  {
    id: 'tierras', name: 'Movimiento de tierras', task: 'Excavar o mover tierras', baseDay: 110,
    types: ['Miniexcavadora', 'Excavadora de cadenas', 'Retroexcavadora', 'Pala cargadora', 'Minicargadora', 'Dumper', 'Zanjadora'],
    fields: [
      { id: 'peso', label: 'Tamaño / peso', options: ['Hasta 2 t', '2 – 4 t', '5 – 8 t', '10 – 15 t', 'Más de 20 t'] },
      { id: 'implemento', label: 'Implemento', options: ['Cazo estándar', 'Cazo de limpieza', 'Martillo hidráulico', 'Ahoyador', 'Sin implemento'] },
      { id: 'acceso', label: 'Acceso a la obra', options: ['Amplio', 'Estrecho (menos de 1,5 m)', 'Interior'] },
    ],
    keywords: ['excav', 'zanja', 'dumper', 'retro', 'tierra', 'pala', 'cargadora', 'vaciado'],
  },
  {
    id: 'manutencion', name: 'Carretillas y manipuladores', task: 'Mover cargas y palés', baseDay: 90,
    types: ['Carretilla eléctrica', 'Carretilla diésel', 'Carretilla todoterreno', 'Manipulador telescópico', 'Manipulador rotativo', 'Transpaleta eléctrica', 'Apilador'],
    fields: [
      { id: 'carga', label: 'Capacidad de carga', options: ['1,5 t', '2,5 t', '3,5 t', '4 t', '5 t o más'] },
      { id: 'elevacion', label: 'Altura de elevación', options: ['Hasta 4 m', '6 m', '10 m', '14 m', '17 m o más'] },
      { id: 'terreno', label: 'Terreno', options: ['Nave / pavimento', 'Obra', 'Mixto'] },
    ],
    keywords: ['carretilla', 'manipulador', 'telesc', 'palet', 'palé', 'transpaleta', 'apilador', 'carga'],
  },
  {
    id: 'compactacion', name: 'Compactación', task: 'Compactar terreno o asfalto', baseDay: 45,
    types: ['Bandeja vibrante', 'Pisón', 'Rodillo dúplex', 'Rodillo tándem', 'Rodillo mixto', 'Compactador de zanjas'],
    fields: [
      { id: 'tamano', label: 'Tamaño', options: ['Manual (hasta 100 kg)', '100 – 500 kg', '1 – 3 t', '7 – 12 t', 'Más de 12 t'] },
      { id: 'material', label: 'Material', options: ['Tierra / zahorra', 'Asfalto', 'Ambos'] },
    ],
    keywords: ['rodillo', 'compact', 'pisón', 'pison', 'bandeja', 'asfalto'],
  },
  {
    id: 'energia', name: 'Generadores y energía', task: 'Electricidad o iluminación', baseDay: 40,
    types: ['Generador insonorizado', 'Generador portátil', 'Torre de iluminación', 'Sistema híbrido / baterías', 'Cuadro eléctrico de obra', 'Compresor'],
    fields: [
      { id: 'potencia', label: 'Potencia', options: ['Hasta 10 kVA', '20 kVA', '60 kVA', '100 kVA', '200 kVA o más'] },
      { id: 'regimen', label: 'Régimen de uso', options: ['Puntual', 'Jornada de 8 h', 'Continuo 24 h'] },
      { id: 'combustible', label: 'Combustible', options: ['Lo pongo yo', 'Con suministro incluido'] },
    ],
    keywords: ['generador', 'grupo', 'electrógeno', 'electrogeno', 'iluminaci', 'kva', 'compresor', 'luz'],
  },
  {
    id: 'herramientas', name: 'Herramientas y pequeña maquinaria', task: 'Pequeños trabajos y reformas', baseDay: 22,
    types: ['Martillo demoledor', 'Cortadora de juntas', 'Hormigonera', 'Taladro de corona', 'Hidrolimpiadora', 'Aspirador industrial', 'Fratasadora', 'Maquinaria de jardinería'],
    fields: [
      { id: 'tamano', label: 'Tamaño', options: ['Ligero', 'Medio', 'Pesado'] },
      { id: 'alimentacion', label: 'Alimentación', options: ['Eléctrica 230 V', 'Batería', 'Gasolina'] },
    ],
    keywords: ['martillo', 'taladro', 'cortadora', 'hormigonera', 'herramienta', 'hidrolimpiadora', 'aspirador', 'jardin'],
  },
  {
    id: 'demolicion', name: 'Demolición', task: 'Demoler o picar', baseDay: 180,
    types: ['Robot de demolición', 'Miniexcavadora con martillo', 'Pinza demoledora', 'Cizalla hidráulica', 'Trituradora de escombro'],
    fields: [
      { id: 'tamano', label: 'Tamaño de equipo', options: ['Compacto (interiores)', 'Medio', 'Grande'] },
      { id: 'material', label: 'Material', options: ['Tabiquería / ladrillo', 'Hormigón', 'Hormigón armado', 'Estructura metálica'] },
    ],
    keywords: ['demol', 'robot', 'picar', 'derribo', 'cizalla', 'tritura'],
  },
  {
    id: 'bombas', name: 'Bombas y equipos auxiliares', task: 'Achicar agua y auxiliares', baseDay: 30,
    types: ['Bomba sumergible', 'Motobomba', 'Bomba de lodos', 'Deshumidificador', 'Calefactor de obra', 'Caseta / módulo de obra'],
    fields: [
      { id: 'tamano', label: 'Capacidad', options: ['Pequeña', 'Media', 'Grande'] },
      { id: 'fluido', label: 'Uso', options: ['Aguas limpias', 'Aguas sucias', 'Lodos', 'No aplica'] },
    ],
    keywords: ['bomba', 'achique', 'agua', 'lodo', 'deshumid', 'calefactor', 'caseta'],
  },
];

export const familyById = (id) => FAMILIES.find((f) => f.id === id) || FAMILIES[0];

export const itemLabel = (it) => {
  const fam = familyById(it.family);
  const size = it.specs?.[fam.fields[0].id];
  return `${it.type}${size ? ' · ' + size : ''}`;
};

// Tarifa orientativa de referencia (demo): crece con el tipo y el tamaño, baja con la duración.
export function listPrice(it, days) {
  const fam = familyById(it.family);
  const tIdx = Math.max(0, fam.types.indexOf(it.type));
  const sIdx = Math.max(0, fam.fields[0].options.indexOf(it.specs?.[fam.fields[0].id]));
  const day = fam.baseDay * (1 + tIdx * 0.1) * (1 + sIdx * 0.28);
  const disc = days >= 20 ? 0.6 : days >= 7 ? 0.74 : days >= 3 ? 0.9 : 1;
  return day * days * disc * (it.qty || 1);
}

export const PROVINCES = ['A Coruña', 'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Baleares', 'Barcelona', 'Bizkaia', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba', 'Cuenca', 'Gipuzkoa', 'Girona', 'Granada', 'Guadalajara', 'Huelva', 'Huesca', 'Jaén', 'La Rioja', 'Las Palmas', 'León', 'Lleida', 'Lugo', 'Madrid', 'Málaga', 'Murcia', 'Navarra', 'Ourense', 'Palencia', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Zamora', 'Zaragoza'];

// Municipios que el asistente reconoce en texto libre → provincia
export const MUNICIPIOS = {
  'Málaga': 'Málaga', 'Marbella': 'Málaga', 'Estepona': 'Málaga', 'Fuengirola': 'Málaga', 'Torremolinos': 'Málaga', 'Benalmádena': 'Málaga', 'Mijas': 'Málaga', 'Antequera': 'Málaga', 'Vélez-Málaga': 'Málaga', 'Ronda': 'Málaga', 'Nerja': 'Málaga', 'Alhaurín': 'Málaga',
  'Sevilla': 'Sevilla', 'Granada': 'Granada', 'Córdoba': 'Córdoba', 'Cádiz': 'Cádiz', 'Jerez': 'Cádiz', 'Algeciras': 'Cádiz', 'Almería': 'Almería', 'Jaén': 'Jaén', 'Huelva': 'Huelva',
  'Madrid': 'Madrid', 'Barcelona': 'Barcelona', 'Valencia': 'Valencia', 'Alicante': 'Alicante', 'Murcia': 'Murcia', 'Zaragoza': 'Zaragoza', 'Bilbao': 'Bizkaia',
};

export const PAYMENT_METHODS = ['Transferencia a 30 días', 'Transferencia a 60 días', 'Confirming', 'Pagaré', 'Tarjeta / contado'];
