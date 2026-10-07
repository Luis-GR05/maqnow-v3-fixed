// Consentimiento de cookies (art. 22.2 LSSI y guía de la AEPD).
// Lo técnico siempre está activo; el resto solo si la persona lo acepta de forma expresa.
// La elección caduca a los 24 meses o cuando cambia CONSENT_VERSION (por ejemplo, al añadir una categoría).
const KEY = 'maqnow-consent';
export const CONSENT_VERSION = 1;
const MAX_AGE = 1000 * 60 * 60 * 24 * 365 * 2;

export const CATEGORIES = [
  { id: 'necesarias', name: 'Necesarias', locked: true, text: 'Mantienen tu sesión, tus datos de trabajo y esta misma elección. Sin ellas la web no funciona, por eso no se pueden desactivar.' },
  { id: 'analitica', name: 'Analítica', locked: false, text: 'Medirían de forma agregada cómo se usa la web para mejorarla. Ahora mismo no usamos ninguna: si la activas, solo se aplicará cuando incorporemos una herramienta y te lo indiquemos en la política de cookies.' },
];

const listeners = new Set();
let cache;

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!v || v.version !== CONSENT_VERSION || Date.now() - v.at > MAX_AGE) return null;
    return v;
  } catch { return null; }
}

export function getConsent() {
  if (cache === undefined) cache = read();
  return cache;
}

// choices: { analitica: true | false }
export function saveConsent(choices) {
  cache = { version: CONSENT_VERSION, at: Date.now(), choices: { ...choices, necesarias: true } };
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* sin almacenamiento, vale para esta visita */ }
  listeners.forEach((fn) => fn(cache));
}

// Úsalo antes de cargar cualquier herramienta no técnica: if (allowed('analitica')) { … }
export const allowed = (category) => category === 'necesarias' || !!getConsent()?.choices?.[category];

export function onConsent(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Reabre el panel desde cualquier sitio (pie de página, política de cookies)
export const openCookieSettings = () => window.dispatchEvent(new Event('maqnow:cookies'));
