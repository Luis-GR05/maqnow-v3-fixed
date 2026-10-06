// Base de proveedores. Los nombres, la cobertura y la especialidad salen de la revisión de mercado.
// TODO lo demás (valoración, tiempos, tarifas, comisión, contactos) son VALORES DE DEMOSTRACIÓN
// inventados para poder probar la aplicación: sustituir por datos reales al captar a cada proveedor.

const ALL = ['elevacion', 'tierras', 'manutencion', 'compactacion', 'energia', 'herramientas', 'demolicion', 'bombas'];
const SUR = ['Málaga', 'Cádiz', 'Granada', 'Córdoba', 'Sevilla'];

export const PROVIDERS = [
  { id: 'loxam', name: 'LOXAM', scope: 'Nacional', city: 'Málaga', province: 'Málaga', km: 9, families: ALL, rating: 4.4, responseMin: 35, assistanceH: 4, reliability: 92, priceFactor: 1.06, payment: 'Transferencia a 30 días', commission: 5 },
  { id: 'mateco', name: 'mateco', scope: 'Nacional', city: 'Málaga', province: 'Málaga', km: 12, families: ['elevacion', 'manutencion', 'tierras', 'energia'], rating: 4.6, responseMin: 25, assistanceH: 2, reliability: 95, priceFactor: 1.08, payment: 'Transferencia a 30 días', commission: 5 },
  { id: 'gam', name: 'GAM', scope: 'Nacional', city: 'Málaga', province: 'Málaga', km: 11, families: ['elevacion', 'manutencion', 'tierras', 'energia', 'compactacion'], rating: 4.5, responseMin: 30, assistanceH: 4, reliability: 93, priceFactor: 1.03, payment: 'Confirming', commission: 5 },
  { id: 'kiloutou', name: 'Kiloutou', scope: 'Nacional', city: 'Málaga', province: 'Málaga', km: 14, families: ALL, rating: 4.3, responseMin: 45, assistanceH: 4, reliability: 90, priceFactor: 1.0, payment: 'Transferencia a 30 días', commission: 5 },
  { id: 'rentaire', name: 'Rentaire', scope: 'Nacional', city: 'Madrid', province: 'Madrid', km: 16, families: ['elevacion', 'manutencion', 'tierras'], rating: 4.1, responseMin: 70, assistanceH: 12, reliability: 86, priceFactor: 0.97, payment: 'Transferencia a 60 días', commission: 6 },
  { id: 'jofemesa', name: 'Jofemesa', scope: 'Nacional', city: 'Sevilla', province: 'Sevilla', km: 18, families: ['elevacion', 'manutencion', 'tierras', 'compactacion'], rating: 4.2, responseMin: 55, assistanceH: 12, reliability: 88, priceFactor: 0.98, payment: 'Pagaré', commission: 6 },
  { id: 'maquinsa', name: 'Maquinsa', scope: 'Local', city: 'Málaga', province: 'Málaga', km: 6, provinces: SUR, families: ['tierras', 'compactacion', 'herramientas', 'energia', 'bombas', 'demolicion'], rating: 4.5, responseMin: 20, assistanceH: 2, reliability: 91, priceFactor: 0.93, payment: 'Transferencia a 30 días', commission: 7 },
  { id: 'rino', name: 'Rino Alquileres', scope: 'Local', city: 'Málaga', province: 'Málaga', km: 8, provinces: SUR, families: ['tierras', 'compactacion', 'herramientas', 'demolicion', 'bombas'], rating: 4.3, responseMin: 28, assistanceH: 4, reliability: 89, priceFactor: 0.94, payment: 'Tarjeta / contado', commission: 7 },
  { id: 'simsur', name: 'SIM SIMSUR', scope: 'Local', city: 'Málaga', province: 'Málaga', km: 10, provinces: SUR, families: ['elevacion', 'manutencion', 'energia'], rating: 4.4, responseMin: 22, assistanceH: 2, reliability: 92, priceFactor: 0.95, payment: 'Transferencia a 30 días', commission: 7 },
  { id: 'montero', name: 'Montero Alquiler de Maquinaria', scope: 'Local', city: 'Málaga', province: 'Málaga', km: 15, provinces: ['Málaga', 'Granada', 'Córdoba'], families: ['tierras', 'compactacion', 'herramientas', 'energia', 'elevacion'], rating: 4.0, responseMin: 60, assistanceH: 12, reliability: 84, priceFactor: 0.9, payment: 'Tarjeta / contado', commission: 8 },
  { id: 'gomezoviedo', name: 'Gómez Oviedo', scope: 'Local', city: 'Málaga', province: 'Málaga', km: 7, provinces: ['Málaga', 'Cádiz', 'Granada'], families: ['herramientas', 'compactacion', 'tierras', 'bombas', 'energia'], rating: 4.2, responseMin: 40, assistanceH: 4, reliability: 87, priceFactor: 0.92, payment: 'Transferencia a 30 días', commission: 7 },
  { id: 'toolquick', name: 'Toolquick Málaga', scope: 'Local', city: 'Málaga', province: 'Málaga', km: 5, provinces: ['Málaga'], families: ['herramientas', 'compactacion', 'energia', 'bombas', 'demolicion'], rating: 4.1, responseMin: 15, assistanceH: 2, reliability: 85, priceFactor: 0.91, payment: 'Tarjeta / contado', commission: 8 },
  { id: 'altesur', name: 'ALTESUR', scope: 'Local', city: 'Málaga', province: 'Málaga', km: 13, provinces: SUR, families: ['elevacion', 'manutencion', 'tierras', 'energia'], rating: 4.3, responseMin: 33, assistanceH: 4, reliability: 90, priceFactor: 0.96, payment: 'Confirming', commission: 7 },
  { id: 'campos', name: 'Alquileres Grupo Campos', scope: 'Local', city: 'Málaga', province: 'Málaga', km: 20, provinces: ['Málaga', 'Cádiz', 'Sevilla'], families: ['tierras', 'compactacion', 'herramientas', 'elevacion', 'demolicion', 'bombas'], rating: 3.9, responseMin: 80, assistanceH: 24, reliability: 82, priceFactor: 0.89, payment: 'Pagaré', commission: 8 },
];

export const providerById = (id) => PROVIDERS.find((p) => p.id === id);

// Canales de atención urgente de MAQNOW (rellenar con los reales)
export const CONTACT = { phone: '+34 600 000 000', whatsapp: '34600000000', email: 'hola@maqnow.es' };

export const BRANDS = {
  elevacion: ['JLG', 'Genie', 'Haulotte'], tierras: ['Caterpillar', 'Kubota', 'JCB'], manutencion: ['Manitou', 'Linde', 'Toyota'],
  compactacion: ['Bomag', 'Dynapac', 'Wacker Neuson'], energia: ['Atlas Copco', 'Himoinsa', 'Inmesol'],
  herramientas: ['Hilti', 'Husqvarna', 'Bosch'], demolicion: ['Brokk', 'Husqvarna', 'Epiroc'], bombas: ['Tsurumi', 'Grundfos', 'Honda'],
};

// Documentos del pasaporte digital de cada máquina
export const DOCS = ['Manual de usuario', 'Ficha técnica', 'Certificado CE', 'Declaración de conformidad', 'Inspección periódica', 'Plan de mantenimiento', 'Seguro', 'Fotografías'];
