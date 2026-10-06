// Datos del sitio usados en títulos, metadatos y datos estructurados.
// Si cambias de dominio, cámbialo aquí Y en index.html, public/sitemap.xml y public/robots.txt.
export const SITE = {
  name: 'MAQNOW',
  url: 'https://luis-gr05.github.io/maqnow-v3-fixed/',
  tagline: 'Busca. Compara. Alquila.',
  description: 'Pide oferta de alquiler de maquinaria a todos los proveedores con una sola solicitud y compara las 5 mejores por disponibilidad, precio, transporte y servicio técnico. Gratis para quien alquila.',
};

export const FAQ = [
  ['¿Cuánto me cuesta usar MAQNOW?', 'Nada. Para quien alquila es gratis: pides ofertas, comparas y contratas sin coste. MAQNOW cobra una comisión al proveedor solo cuando se cierra un alquiler.'],
  ['¿Cuánto tardan en llegar las ofertas?', 'Los proveedores reciben tu solicitud al momento. Lo habitual es tener las primeras respuestas en minutos; si alguno no contesta, se lo reclamamos nosotros.'],
  ['¿Qué pasa si no sé qué máquina necesito?', 'Cuéntaselo al asistente con tus palabras: qué trabajo vas a hacer, dónde y cuándo. Te propone el equipo adecuado y deja la solicitud preparada.'],
  ['¿Y si la máquina se avería en la obra?', 'Desde tu área avisas de la avería con un click. El aviso llega al proveedor y a nuestro equipo, y queda registrado con sus tiempos de respuesta.'],
  ['¿Puedo pedir varias máquinas para la misma obra?', 'Sí. Añades todas las que necesites a una única solicitud y los proveedores ofertan el conjunto.'],
  ['Soy alquilador, ¿cómo entro?', 'Date de alta gratis como proveedor. Tras homologar tu empresa recibirás solo solicitudes de tu zona y de tu tipo de maquinaria, y respondes con disponibilidad y precio en un minuto.'],
];

// Sectores de entrada (idea tomada de cómo organizan su web los fabricantes): cada uno sugiere familias
export const SECTORS = [
  { id: 'construccion', name: 'Construcción y obra civil', families: ['tierras', 'elevacion', 'compactacion'] },
  { id: 'reformas', name: 'Reformas e instalaciones', families: ['herramientas', 'elevacion', 'demolicion'] },
  { id: 'industria', name: 'Industria y logística', families: ['manutencion', 'elevacion', 'energia'] },
  { id: 'eventos', name: 'Eventos y montajes', families: ['energia', 'elevacion', 'manutencion'] },
  { id: 'jardineria', name: 'Jardinería y agricultura', families: ['tierras', 'herramientas', 'bombas'] },
  { id: 'municipal', name: 'Ayuntamientos y servicios', families: ['compactacion', 'bombas', 'energia'] },
];

const TITLES = {
  acceso: 'Entrar', registro: 'Crear cuenta',
  cliente: { inicio: 'Inicio', nueva: 'Nueva solicitud', solicitudes: 'Solicitudes', solicitud: 'Comparativo de ofertas', ofertas: 'Ofertas', alquileres: 'Alquileres', alquiler: 'Alquiler', obras: 'Obras', entregas: 'Entregas y recogidas', averias: 'Averías', documentacion: 'Documentación', facturas: 'Facturas', favoritos: 'Maquinaria habitual', informes: 'Informes', empresa: 'Mi empresa' },
  proveedor: { inicio: 'Inicio', solicitudes: 'Solicitudes', ofertas: 'Mis ofertas', alquileres: 'Alquileres', flota: 'Mi maquinaria', entregas: 'Entregas y recogidas', incidencias: 'Incidencias', facturacion: 'Facturación y comisiones', ficha: 'Ficha de proveedor' },
  admin: { inicio: 'Panel de operaciones', agente: 'Agente comercial', solicitudes: 'Solicitudes', solicitud: 'Registro de la solicitud', clientes: 'Clientes y riesgo', proveedores: 'Proveedores', alquileres: 'Alquileres', incidencias: 'Incidencias', comisiones: 'Comisiones y cobros', usuarios: 'Usuarios y roles', ajustes: 'Ajustes' },
};
export function pageTitle(section, page, area) {
  if (!section) return `${SITE.name}: alquiler de maquinaria, una solicitud y las 5 mejores ofertas`;
  const t = section === 'app' ? TITLES[area]?.[page] : TITLES[section];
  return `${t || 'Área privada'} · ${SITE.name}`;
}
