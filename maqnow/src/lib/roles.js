// Roles y permisos de MAQNOW.
// Cliente y proveedor entran cada uno a su área. El equipo interno comparte el CRM,
// pero cada rol ve y puede hacer cosas distintas. La misma matriz está replicada en
// la base de datos (supabase/schema.sql) con políticas RLS: el front solo oculta,
// quien de verdad protege los datos es la base de datos.

export const ROLES = {
  cliente: { label: 'Cliente', area: 'cliente', desc: 'Pide ofertas, compara, contrata y gestiona sus alquileres.' },
  proveedor: { label: 'Proveedor', area: 'proveedor', desc: 'Recibe solicitudes de su zona, oferta y gestiona entregas e incidencias.' },
  agente: { label: 'Agente comercial', area: 'admin', desc: 'Lleva las solicitudes: lanza peticiones, reclama respuestas y homologa proveedores.' },
  administracion: { label: 'Administración', area: 'admin', desc: 'Lleva el riesgo de clientes, los cobros y la liquidación de comisiones.' },
  superadmin: { label: 'Superadmin', area: 'admin', desc: 'Acceso completo: usuarios, roles y ajustes.' },
};
export const STAFF = ['agente', 'administracion', 'superadmin'];
export const areaOf = (role) => ROLES[role]?.area || 'cliente';
export const isStaff = (role) => STAFF.includes(role);

// Páginas del CRM → roles que pueden abrirlas
const STAFF_PAGES = {
  inicio: STAFF, solicitudes: STAFF, solicitud: STAFF, clientes: STAFF, proveedores: STAFF, alquileres: STAFF, incidencias: STAFF,
  agente: ['agente', 'superadmin'],
  comisiones: ['administracion', 'superadmin'],
  usuarios: ['superadmin'],
  ajustes: ['superadmin'],
};
// Acciones → roles que pueden ejecutarlas
const ACTIONS = {
  'solicitudes.reclamar': ['agente', 'superadmin'],
  'proveedores.homologar': ['agente', 'superadmin'],
  'incidencias.gestionar': ['agente', 'superadmin'],
  'clientes.editar': ['administracion', 'superadmin'],
  'comisiones.liquidar': ['administracion', 'superadmin'],
  'usuarios.gestionar': ['superadmin'],
  'ajustes.cambiar': ['superadmin'],
};
export const PERMISSIONS = ACTIONS;
export const can = (role, action) => (ACTIONS[action] || []).includes(role);
export const canOpen = (role, page) => (areaOf(role) !== 'admin' ? true : (STAFF_PAGES[page] || []).includes(role));
