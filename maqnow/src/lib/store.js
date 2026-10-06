// Estado de la demo: todo vive en el navegador (localStorage). No hay servidor.
// Usuarios, sesiones y respuestas de proveedores son locales/simulados. Al conectar un
// backend real (p. ej. Supabase), este archivo es la única pieza que hay que sustituir.
import { useSyncExternalStore } from 'react';
import { FAMILIES, familyById, listPrice, itemLabel } from '../data/catalog';
import { PROVIDERS, BRANDS, DOCS } from '../data/providers';
import { addDays, todayISO, monthKey } from './format';

const KEY = 'maqnow-demo-v3';
export const MAX_CONTACTED = 10; // "hasta 10 ofertas con un solo click"
export const TOP_OFFERS = 5; // comparativo de las 5 mejores
export const IVA = 0.21;

/* ---------- utilidades ---------- */
function rng(seedStr) {
  let h = 1779033703;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353), (h = (h << 13) | (h >>> 19));
  h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
  let a = (h ^ (h >>> 16)) >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const round5 = (n) => Math.round(n / 5) * 5;
const pad = (n, l) => String(n).padStart(l, '0');

let state = null;
const provs = (s) => (s || state)?.providers || PROVIDERS;
export const providerById = (id, s) => provs(s).find((p) => p.id === id) || { id, name: 'Proveedor', families: [], commission: 5, rating: 4, scope: 'Local', city: '' };

/* ---------- motor de ofertas ---------- */
export function eligibleProviders(req, s) {
  const fams = [...new Set(req.items.map((i) => i.family))];
  const covers = (p) => p.scope === 'Nacional' || (p.provinces || []).includes(req.province);
  let list = provs(s).filter((p) => covers(p) && fams.every((f) => p.families.includes(f)));
  if (list.length < 3) list = provs(s).filter((p) => covers(p) && fams.some((f) => p.families.includes(f)));
  return list.sort((a, b) => b.rating * 20 + b.reliability - (a.rating * 20 + a.reliability)).slice(0, MAX_CONTACTED);
}

function distanceKm(p, province, r) {
  if (p.province === province) return p.km;
  if (p.scope === 'Nacional') return Math.round(10 + r() * 35);
  return Math.round(110 + r() * 120);
}

function buildOffer(req, p) {
  const r = rng(req.id + p.id);
  const base = req.items.reduce((a, it) => a + listPrice(it, req.days), 0);
  const km = distanceKm(p, req.province, r);
  const price = round5(base * p.priceFactor * (0.93 + r() * 0.14));
  const transport = req.delivery === 'Recogida en proveedor' || r() < 0.12 ? 0 : round5(45 + km * 1.9);
  const a = r();
  const available = a < 0.12 ? 'no' : a < 0.3 ? 'parcial' : 'si';
  const delayDays = available === 'parcial' ? 1 + Math.floor(r() * 2) : 0;
  return {
    providerId: p.id, available, delayDays, km, price, transport,
    deposit: Math.max(150, Math.round((price * 0.3) / 50) * 50),
    deliveryDate: addDays(req.start, delayDays), assistanceH: p.assistanceH, payment: p.payment,
    responseMin: Math.max(4, Math.round(p.responseMin * (0.6 + r() * 0.9))),
    notes: available === 'parcial' ? 'Equipo disponible con entrega posterior a la fecha pedida.' : '', manual: false,
  };
}

export function providerRating(s, p) {
  const rv = s.reviews.filter((v) => v.providerId === p.id);
  return (p.rating * 8 + rv.reduce((a, v) => a + v.stars, 0)) / (8 + rv.length);
}

// Puntuación del comparativo: precio 30 · disponibilidad 25 · transporte 15 · valoración 15 · servicio técnico 15
export const SCORE_WEIGHTS = { precio: 30, disponibilidad: 25, transporte: 15, proveedor: 15, servicio: 15 };
export const SCORE_LABELS = { precio: 'Precio', disponibilidad: 'Disponibilidad', transporte: 'Transporte', proveedor: 'Valoración', servicio: 'Servicio técnico' };
export function rankOffers(req, s) {
  const avail = req.offers.filter((o) => o.available !== 'no');
  if (!avail.length) return [];
  const minTotal = Math.min(...avail.map((o) => o.price + o.transport));
  return avail.map((o) => {
    const provider = providerById(o.providerId, s);
    const rating = providerRating(s, provider);
    const total = o.price + o.transport;
    const parts = {
      precio: (minTotal / total) * 100,
      disponibilidad: o.available === 'si' ? 100 : Math.max(40, 80 - 15 * o.delayDays),
      transporte: o.transport === 0 ? 100 : Math.max(20, 100 - o.km * 0.45),
      proveedor: (rating / 5) * 100,
      servicio: o.assistanceH <= 2 ? 100 : o.assistanceH <= 4 ? 88 : o.assistanceH <= 12 ? 70 : 52,
    };
    const score = Math.round(Object.keys(SCORE_WEIGHTS).reduce((a, k) => a + (parts[k] * SCORE_WEIGHTS[k]) / 100, 0));
    return { ...o, provider, rating, total, parts, score };
  }).sort((a, b) => b.score - a.score || a.total - b.total);
}

/* ---------- construcción de entidades ---------- */
function siteFor(s, clientId, data) {
  if (data.siteId) return data.siteId;
  let site = s.sites.find((x) => x.clientId === clientId && x.municipio === data.municipio && (!data.siteName || x.name === data.siteName));
  if (!site) {
    site = { id: `OBR-${pad(++s.seq.site, 3)}`, clientId, name: data.siteName || `Obra ${data.municipio}`, municipio: data.municipio, province: data.province };
    s.sites.push(site);
  }
  return site.id;
}

function makeMachine(s, p, family, type, size) {
  const r = rng(p.id + family + s.seq.machine);
  const brands = BRANDS[family];
  const docs = {};
  DOCS.forEach((d) => { docs[d] = r() > 0.07; });
  const t = todayISO();
  const m = {
    id: `RM-${p.id.slice(0, 3).toUpperCase()}-${pad(++s.seq.machine, 6)}`, providerId: p.id, family, type, size,
    brand: brands[Math.floor(r() * brands.length)], year: 2019 + Math.floor(r() * 7), serial: `SN${pad(Math.floor(r() * 1e7), 7)}`,
    status: 'operativa', hours: 300 + Math.floor(r() * 4200),
    lastMaint: addDays(t, -Math.floor(10 + r() * 70)), nextMaint: addDays(t, Math.floor(15 + r() * 80)), lastInspection: addDays(t, -Math.floor(20 + r() * 200)), docs,
  };
  s.machines.push(m);
  return m;
}

function makeRequest(s, data, { instant = false, createdAt = Date.now() } = {}) {
  const id = `MAQ-${pad(++s.seq.req, 6)}`;
  const req = {
    id, clientId: data.clientId, siteId: siteFor(s, data.clientId, data), items: data.items,
    municipio: data.municipio, cp: data.cp || '', province: data.province,
    start: data.start, days: data.days, indefinite: !!data.indefinite, end: addDays(data.start, data.days),
    delivery: data.delivery || 'Transporte incluido', urgent: !!data.urgent, notes: data.notes || '',
    status: 'buscando', createdAt, viewedAt: null, remindedAt: null, offers: [], contacted: [], byAgent: !!data.byAgent,
  };
  eligibleProviders(req, s).forEach((p, i) => {
    const c = { providerId: p.id, sentAt: createdAt, respondsAt: createdAt + (2 + i * 1.3) * 1000, responded: false, auto: !p.manual, pending: p.manual ? null : buildOffer(req, p) };
    if (instant && c.auto) { c.responded = true; req.offers.push(c.pending); c.pending = null; }
    req.contacted.push(c);
  });
  if (req.offers.length) req.status = 'ofertas';
  s.requests.unshift(req);
  return req;
}

function makeRental(s, req, providerId) {
  const offer = req.offers.find((o) => o.providerId === providerId);
  const p = providerById(providerId, s);
  const others = req.offers.filter((o) => o.available !== 'no').map((o) => o.price + o.transport);
  const avg = others.reduce((a, b) => a + b, 0) / (others.length || 1);
  const total = offer.price + offer.transport;
  const machineIds = req.items.map((it) => {
    const size = it.specs?.[familyById(it.family).fields[0].id] || '';
    const free = s.machines.find((m) => m.providerId === providerId && m.status === 'operativa' && m.family === it.family && m.type === it.type && m.size === size);
    const m = free || makeMachine(s, p, it.family, it.type, size);
    m.status = 'alquilada';
    return m.id;
  });
  const rental = {
    id: `ALQ-${pad(++s.seq.rental, 5)}`, requestId: req.id, clientId: req.clientId, siteId: req.siteId, providerId, machineIds,
    items: req.items, municipio: req.municipio, province: req.province,
    start: offer.deliveryDate, end: addDays(offer.deliveryDate, req.days), days: req.days, indefinite: req.indefinite,
    price: offer.price, transport: offer.transport, total, deposit: offer.deposit, payment: offer.payment,
    saving: Math.max(0, Math.round(avg - total)),
    commissionPct: p.commission, commission: Math.round((offer.price * p.commission) / 100), commissionStatus: 'pendiente',
    status: 'reservada', bajaDate: null, review: null, paid: false, acceptedAt: Date.now(),
  };
  req.status = 'aceptada';
  req.acceptedProviderId = providerId;
  s.rentals.unshift(rental);
  return rental;
}

function finishRental(s, r) {
  r.status = 'finalizada';
  r.machineIds.forEach((id) => { const m = s.machines.find((x) => x.id === id); if (m) m.status = 'operativa'; });
}

/* ---------- datos iniciales de demostración ---------- */
const GUEST_CLIENT = 'CLI-001';
const GUEST_PROVIDER = 'maquinsa';

function seed() {
  const s = {
    seq: { req: 240, rental: 118, inc: 30, client: 4, site: 0, machine: 480, user: 0, prov: 0 },
    settings: { autoRespond: true },
    session: null, users: [],
    providers: PROVIDERS.map((p) => ({ ...p, contactName: '', phone: '', email: '', plan: 'Gratis' })),
    clients: [
      { id: 'CLI-001', name: 'Reformas y Obras Litoral S.L.', cif: 'B00000001', contact: 'Responsable de compras', phone: '600 000 001', email: 'compras@ejemplo.es', payment: 'Transferencia a 30 días', creditLimit: 12000, avgPayDays: 34, since: '2026-03-10' },
      { id: 'CLI-002', name: 'Construcciones Guadalhorce S.A.', cif: 'A00000002', contact: 'Jefe de obra', phone: '600 000 002', email: 'obra@ejemplo.es', payment: 'Confirming', creditLimit: 30000, avgPayDays: 58, since: '2026-02-01' },
      { id: 'CLI-003', name: 'Instalaciones Axarquía S.L.', cif: 'B00000003', contact: 'Administración', phone: '600 000 003', email: 'admin@ejemplo.es', payment: 'Pagaré', creditLimit: 4000, avgPayDays: 72, since: '2026-05-20' },
      { id: 'CLI-004', name: 'Eventos Costa del Sol S.L.', cif: 'B00000004', contact: 'Producción', phone: '600 000 004', email: 'produccion@ejemplo.es', payment: 'Tarjeta / contado', creditLimit: 3000, avgPayDays: 2, since: '2026-06-15' },
    ],
    sites: [], machines: [], requests: [], rentals: [], incidents: [], reviews: [], favorites: [],
  };
  const t = todayISO();
  const it = (family, tIdx, sIdx, qty = 1) => {
    const f = familyById(family);
    return { family, type: f.types[tIdx], qty, specs: { [f.fields[0].id]: f.fields[0].options[sIdx] } };
  };
  // flota inicial: dos máquinas por familia y proveedor
  s.providers.forEach((p) => p.families.forEach((fid) => {
    const f = familyById(fid);
    [0, 1].forEach((k) => {
      const r = rng(p.id + fid + k);
      makeMachine(s, p, fid, f.types[Math.floor(r() * f.types.length)], f.fields[0].options[Math.floor(r() * f.fields[0].options.length)]);
    });
  }));
  s.machines.filter((_, i) => i % 11 === 5).forEach((m) => { m.status = 'mantenimiento'; });

  const past = [
    ['CLI-001', [it('elevacion', 2, 3)], 'Málaga', 'Promoción Málaga Centro', -140, 7], ['CLI-002', [it('tierras', 0, 1), it('tierras', 5, 1, 2)], 'Marbella', null, -128, 15],
    ['CLI-001', [it('tierras', 0, 1)], 'Estepona', 'Reforma hotel Estepona', -105, 10], ['CLI-003', [it('energia', 0, 2)], 'Vélez-Málaga', null, -96, 20],
    ['CLI-001', [it('manutencion', 3, 3)], 'Málaga', 'Promoción Málaga Centro', -74, 12], ['CLI-004', [it('energia', 2, 1, 3)], 'Torremolinos', null, -66, 3],
    ['CLI-002', [it('elevacion', 4, 4)], 'Málaga', null, -52, 20], ['CLI-001', [it('compactacion', 3, 2)], 'Mijas', 'Urbanización Mijas Golf', -41, 5],
    ['CLI-001', [it('elevacion', 0, 1, 2)], 'Málaga', 'Promoción Málaga Centro', -27, 14],
  ];
  past.forEach(([clientId, items, municipio, siteName, off, days], i) => {
    const req = makeRequest(s, { clientId, items, municipio, siteName, province: 'Málaga', start: addDays(t, off), days }, { instant: true, createdAt: Date.now() + (off - 2) * 864e5 });
    req.viewedAt = req.createdAt + 36e5;
    const ranked = rankOffers(req, s);
    const r = makeRental(s, req, (ranked[i % 2] || ranked[0]).providerId);
    finishRental(s, r);
    r.paid = clientId !== 'CLI-003';
    r.commissionStatus = i < 6 ? 'liquidada' : 'pendiente';
    if (i % 3 !== 2) { r.review = 4 + (i % 2); s.reviews.push({ providerId: r.providerId, rentalId: r.id, stars: r.review }); }
  });
  const live = makeRequest(s, { clientId: 'CLI-001', items: [it('tierras', 0, 1), it('energia', 0, 2)], municipio: 'Marbella', siteName: 'Villas Marbella Este', province: 'Málaga', start: addDays(t, -4), days: 15 }, { instant: true, createdAt: Date.now() - 6 * 864e5 });
  live.viewedAt = live.createdAt + 2 * 36e5;
  const lr = makeRental(s, live, rankOffers(live, s)[0].providerId);
  lr.status = 'en alquiler';
  s.demoProviderId = lr.providerId; // el invitado-proveedor ve un proveedor con actividad
  const live2 = makeRequest(s, { clientId: 'CLI-002', items: [it('manutencion', 3, 3)], municipio: 'Málaga', province: 'Málaga', start: addDays(t, -9), days: 30 }, { instant: true, createdAt: Date.now() - 11 * 864e5 });
  makeRental(s, live2, rankOffers(live2, s)[0].providerId).status = 'en alquiler';
  const soon = makeRequest(s, { clientId: 'CLI-001', items: [it('elevacion', 0, 2)], municipio: 'Málaga', siteName: 'Promoción Málaga Centro', province: 'Málaga', start: addDays(t, 2), days: 12 }, { instant: true, createdAt: Date.now() - 26 * 36e5 });
  soon.viewedAt = soon.createdAt + 36e5;
  makeRental(s, soon, rankOffers(soon, s)[0].providerId);
  s.incidents.push({ id: 'INC-00030', rentalId: lr.id, type: 'Fallo hidráulico', desc: 'Pierde aceite por un latiguillo del brazo.', urgent: true, level: 3, status: 'en curso', createdAt: Date.now() - 20 * 36e5, resolvedAt: null });
  makeRequest(s, { clientId: 'CLI-001', items: [it('elevacion', 3, 3)], municipio: 'Marbella', siteName: 'Villas Marbella Este', cp: '29600', province: 'Málaga', start: addDays(t, 3), days: 10 }, { instant: true, createdAt: Date.now() - 3 * 36e5 });
  s.favorites.push({ id: 'FAV-1', clientId: 'CLI-001', item: it('elevacion', 2, 3) }, { id: 'FAV-2', clientId: 'CLI-001', item: it('tierras', 0, 1) }, { id: 'FAV-3', clientId: 'CLI-001', item: it('energia', 0, 2) });
  return s;
}

/* ---------- store ---------- */
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* almacenamiento no disponible */ }
  return seed();
}
state = load();
let draft = null;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* sin persistencia */ } };
function mutate(fn) {
  const s = structuredClone(state);
  const out = fn(s);
  state = s;
  persist(); emit();
  return out;
}
export function useStore() {
  return useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => state);
}
export const getState = () => state;
export const setDraft = (d) => { draft = d; };
export const takeDraft = () => { const d = draft; draft = null; return d; };

async function hashPass(email, password) {
  const text = `maqnow|${email.toLowerCase()}|${password}`;
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  return `x${h}`;
}

/* ---------- acciones ---------- */
export const actions = {
  tick() {
    if (!state.settings.autoRespond) return;
    const now = Date.now();
    const due = state.requests.some((r) => ['buscando', 'ofertas'].includes(r.status) && r.contacted.some((c) => c.auto && !c.responded && c.respondsAt <= now));
    if (!due) return;
    mutate((s) => s.requests.forEach((r) => {
      if (!['buscando', 'ofertas'].includes(r.status)) return;
      r.contacted.forEach((c) => {
        if (!c.auto || c.responded || c.respondsAt > now) return;
        r.offers.push(c.pending); c.responded = true; c.pending = null;
      });
      if (r.offers.length) r.status = 'ofertas';
    }));
  },

  /* sesión y usuarios (locales a este navegador) */
  enterGuest(role = 'cliente') {
    mutate((s) => { s.session = { guest: true, role, clientId: GUEST_CLIENT, providerId: s.demoProviderId || GUEST_PROVIDER, name: 'Invitado', email: '' }; });
  },
  switchRole(role) { mutate((s) => { if (s.session?.guest) s.session.role = role; }); },
  setGuestProvider(id) { mutate((s) => { if (s.session?.guest) s.session.providerId = id; }); },
  logout() { mutate((s) => { s.session = null; }); },
  async register(f) {
    const email = f.email.trim().toLowerCase();
    if (state.users.some((u) => u.email === email)) return 'Ya existe una cuenta con ese email. Inicia sesión.';
    const passHash = await hashPass(email, f.password);
    mutate((s) => {
      const user = { id: `USR-${pad(++s.seq.user, 3)}`, name: f.name.trim(), email, passHash, role: f.role };
      if (f.role === 'proveedor') {
        const p = {
          id: `prv${++s.seq.prov}`, name: f.company.trim(), scope: 'Local', city: f.city || 'Málaga', province: f.province || 'Málaga', km: 10, provinces: [f.province || 'Málaga'],
          families: f.families?.length ? f.families : FAMILIES.map((x) => x.id), rating: 4, responseMin: 30, assistanceH: 4, reliability: 85, priceFactor: 1,
          payment: 'Transferencia a 30 días', commission: 5, manual: true, contactName: f.name.trim(), phone: f.phone || '', email, plan: 'Gratis',
        };
        s.providers.push(p);
        user.providerId = p.id;
      } else {
        const c = { id: `CLI-${pad(++s.seq.client, 3)}`, name: f.company.trim(), cif: f.cif || '', contact: f.name.trim(), phone: f.phone || '', email, payment: 'Transferencia a 30 días', creditLimit: 6000, avgPayDays: 30, since: todayISO() };
        s.clients.push(c);
        user.clientId = c.id;
      }
      s.users.push(user);
      s.session = { guest: false, role: user.role, userId: user.id, clientId: user.clientId, providerId: user.providerId, name: user.name, email };
    });
    return null;
  },
  async login(emailRaw, password) {
    const email = emailRaw.trim().toLowerCase();
    const user = state.users.find((u) => u.email === email);
    if (!user || user.passHash !== (await hashPass(email, password))) return 'Email o contraseña incorrectos.';
    mutate((s) => { s.session = { guest: false, role: user.role, userId: user.id, clientId: user.clientId, providerId: user.providerId, name: user.name, email }; });
    return null;
  },

  /* cliente */
  saveClient(data) { mutate((s) => { Object.assign(s.clients.find((x) => x.id === data.id), data); }); },
  addSite(clientId, data) { return mutate((s) => siteFor(s, clientId, { ...data, siteName: data.name })); },
  createRequest(clientId, data) { return mutate((s) => makeRequest(s, { ...data, clientId }).id); },
  markViewed(id) {
    const r = state.requests.find((x) => x.id === id);
    if (r && !r.viewedAt && r.offers.length) mutate((s) => { s.requests.find((x) => x.id === id).viewedAt = Date.now(); });
  },
  cancelRequest(id) { mutate((s) => { s.requests.find((r) => r.id === id).status = 'cancelada'; }); },
  acceptOffer(reqId, providerId) { return mutate((s) => makeRental(s, s.requests.find((r) => r.id === reqId), providerId).id); },
  requestBaja(id, date) { mutate((s) => { const r = s.rentals.find((x) => x.id === id); r.status = 'baja solicitada'; r.bajaDate = date; }); },
  reviewRental(id, stars) {
    mutate((s) => { const r = s.rentals.find((x) => x.id === id); r.review = stars; s.reviews.push({ providerId: r.providerId, rentalId: id, stars }); });
  },
  openIncident(rentalId, data) {
    mutate((s) => { s.incidents.unshift({ id: `INC-${pad(++s.seq.inc, 5)}`, rentalId, ...data, level: data.urgent ? 3 : data.type === 'Consulta' ? 1 : 2, status: 'abierta', createdAt: Date.now(), resolvedAt: null }); });
  },
  toggleFavorite(clientId, item) {
    mutate((s) => {
      const key = JSON.stringify([item.family, item.type, item.specs]);
      const i = s.favorites.findIndex((f) => f.clientId === clientId && JSON.stringify([f.item.family, f.item.type, f.item.specs]) === key);
      if (i >= 0) s.favorites.splice(i, 1); else s.favorites.push({ id: `FAV-${Date.now()}`, clientId, item: { ...item, qty: 1 } });
    });
  },

  /* proveedor */
  submitOffer(reqId, providerId, o) {
    mutate((s) => {
      const r = s.requests.find((x) => x.id === reqId);
      const c = r.contacted.find((x) => x.providerId === providerId);
      const p = providerById(providerId, s);
      const base = c.pending || r.offers.find((x) => x.providerId === providerId) || { km: p.km };
      const offer = {
        ...base, ...o, providerId, manual: true,
        delayDays: o.available === 'parcial' ? Math.max(1, o.delayDays || 1) : 0,
        deposit: o.deposit ?? Math.max(150, Math.round((o.price * 0.3) / 50) * 50), assistanceH: p.assistanceH,
        responseMin: Math.max(1, Math.round((Date.now() - c.sentAt) / 60000)),
      };
      offer.deliveryDate = addDays(r.start, offer.delayDays);
      r.offers = r.offers.filter((x) => x.providerId !== providerId).concat(offer);
      c.responded = true; c.pending = null;
      if (r.status === 'buscando') r.status = 'ofertas';
    });
  },
  setRentalStatus(id, status) { mutate((s) => { s.rentals.find((r) => r.id === id).status = status; }); },
  confirmPickup(id) { mutate((s) => { const r = s.rentals.find((x) => x.id === id); r.end = r.bajaDate || todayISO(); finishRental(s, r); }); },
  setIncidentStatus(id, status) {
    mutate((s) => { const i = s.incidents.find((x) => x.id === id); i.status = status; i.resolvedAt = status === 'resuelta' ? Date.now() : null; });
  },
  saveProvider(data) { mutate((s) => { Object.assign(s.providers.find((x) => x.id === data.id), data); }); },
  addMachine(providerId, m) { mutate((s) => { Object.assign(makeMachine(s, providerById(providerId, s), m.family, m.type, m.size), { brand: m.brand || 'Sin marca', year: +m.year || new Date().getFullYear() }); }); },
  setMachineStatus(id, status) { mutate((s) => { s.machines.find((m) => m.id === id).status = status; }); },
  toggleDoc(id, doc) { mutate((s) => { const m = s.machines.find((x) => x.id === id); m.docs[doc] = !m.docs[doc]; }); },

  /* equipo MAQNOW */
  remind(reqId) { mutate((s) => { s.requests.find((r) => r.id === reqId).remindedAt = Date.now(); }); },
  settleCommission(id) { mutate((s) => { s.rentals.find((r) => r.id === id).commissionStatus = 'liquidada'; }); },
  markPaid(id) { mutate((s) => { s.rentals.find((r) => r.id === id).paid = true; }); },
  setAutoRespond(v) { mutate((s) => { s.settings.autoRespond = v; }); },
  resetDemo() {
    const session = state.session?.guest ? state.session : null;
    try { localStorage.removeItem(KEY); } catch { /* nada */ }
    state = null; state = seed(); state.session = session;
    persist(); emit();
  },
};

/* ---------- consultas ---------- */
export const itemsText = (items) => items.map((it) => `${it.qty} × ${itemLabel(it)}`).join(' + ');

// Etapas del ciclo completo de una solicitud (PDF: SOLICITUD → … → FACTURACIÓN / COMISIÓN)
export const STAGES = ['Solicitud', 'Buscando', 'Ofertas recibidas', 'Vista por el cliente', 'Aceptada', 'Reservada', 'En alquiler', 'Finalizada', 'Facturada'];
export function stageIndex(req, rental) {
  if (rental) {
    if (rental.status === 'finalizada') return rental.paid ? 8 : 7;
    if (rental.status === 'en alquiler' || rental.status === 'baja solicitada') return 6;
    return 5;
  }
  if (req.status === 'ofertas') return req.viewedAt ? 3 : 2;
  return 1;
}

const payDays = (payment) => (/60/.test(payment) ? 60 : /contado/i.test(payment) ? 0 : 30);
export function invoicesOf(s, pred = () => true) {
  const t = todayISO();
  return s.rentals.filter((r) => r.status !== 'reservada' && pred(r)).map((r) => {
    const due = addDays(r.start, payDays(r.payment));
    return { id: `FAC-${r.id.slice(4)}`, rentalId: r.id, clientId: r.clientId, providerId: r.providerId, date: r.start, due, base: r.total, iva: Math.round(r.total * IVA), total: Math.round(r.total * (1 + IVA)), status: r.paid ? 'pagada' : due < t ? 'vencida' : 'pendiente' };
  });
}

export function providerStats(s, p) {
  let contacted = 0, responded = 0, availOffers = 0, respSum = 0, priceSum = 0, priceN = 0;
  s.requests.forEach((r) => {
    const c = r.contacted.find((x) => x.providerId === p.id);
    if (!c) return;
    contacted++;
    const o = r.offers.find((x) => x.providerId === p.id);
    if (!o) return;
    responded++; respSum += o.responseMin;
    if (o.available !== 'no') {
      if (o.available === 'si') availOffers++;
      const min = Math.min(...r.offers.filter((x) => x.available !== 'no').map((x) => x.price + x.transport));
      priceSum += min / (o.price + o.transport); priceN++;
    }
  });
  const rentals = s.rentals.filter((r) => r.providerId === p.id);
  const incidents = s.incidents.filter((i) => rentals.some((r) => r.id === i.rentalId)).length;
  const avgResp = responded ? respSum / responded : p.responseMin;
  const parts = {
    disponibilidad: responded ? (availOffers / responded) * 100 : 70,
    precio: priceN ? (priceSum / priceN) * 100 : 80,
    respuesta: Math.max(20, 100 - avgResp * 0.9),
    fiabilidad: p.reliability,
    incidencias: Math.max(0, 100 - (rentals.length ? (incidents / rentals.length) * 100 : 0)),
  };
  // Índice interno: disponibilidad 30 · precio 25 · tiempo de respuesta 20 · fiabilidad 15 · incidencias 10
  const index = Math.round(parts.disponibilidad * 0.3 + parts.precio * 0.25 + parts.respuesta * 0.2 + parts.fiabilidad * 0.15 + parts.incidencias * 0.1);
  return {
    contacted, responded, avgResp, won: rentals.length, incidents, parts, index, rating: providerRating(s, p),
    winRate: responded ? rentals.length / responded : 0,
    volume: rentals.reduce((a, r) => a + r.price, 0), commission: rentals.reduce((a, r) => a + r.commission, 0),
  };
}

export function clientRisk(s, c) {
  const rentals = s.rentals.filter((r) => r.clientId === c.id);
  const overdue = invoicesOf(s, (r) => r.clientId === c.id).filter((i) => i.status === 'vencida').reduce((a, i) => a + i.total, 0);
  const exposure = rentals.filter((r) => !r.paid).reduce((a, r) => a + r.total, 0);
  const usage = c.creditLimit ? exposure / c.creditLimit : 0;
  let pts = 0;
  const reasons = [];
  if (c.avgPayDays > 60) { pts += 2; reasons.push(`paga a ${c.avgPayDays} días de media`); } else if (c.avgPayDays > 45) { pts += 1; reasons.push(`paga a ${c.avgPayDays} días de media`); }
  if (overdue > 0) { pts += 2; reasons.push('tiene facturas vencidas'); }
  if (usage > 0.8) { pts += 2; reasons.push('consume más del 80 % de su límite'); } else if (usage > 0.5) { pts += 1; reasons.push('consume más de la mitad de su límite'); }
  if (c.payment === 'Tarjeta / contado') { pts -= 1; reasons.push('paga al contado'); }
  const level = pts >= 3 ? 'Alto' : pts >= 1 ? 'Medio' : 'Bajo';
  return { level, exposure, overdue, usage, reasons, volume: rentals.reduce((a, r) => a + r.total, 0), rentals: rentals.length };
}

export function spendByMonth(rentals, months = 6, field = 'total') {
  const keys = [];
  const d = new Date();
  d.setDate(15);
  for (let i = months - 1; i >= 0; i--) {
    const x = new Date(d); x.setMonth(d.getMonth() - i);
    keys.push(`${x.getFullYear()}-${pad(x.getMonth() + 1, 2)}`);
  }
  return keys.map((k) => ({ key: k, value: rentals.filter((r) => monthKey(r.start) === k).reduce((a, r) => a + r[field], 0) }));
}

// Entregas y recogidas previstas (para cliente, proveedor o equipo)
export function movements(s, pred) {
  const out = [];
  s.rentals.filter(pred).forEach((r) => {
    if (r.status === 'reservada') out.push({ kind: 'Entrega', date: r.start, rental: r });
    if (r.status === 'en alquiler' && !r.indefinite) out.push({ kind: 'Recogida prevista', date: r.end, rental: r });
    if (r.status === 'baja solicitada') out.push({ kind: 'Recogida', date: r.bajaDate, rental: r });
  });
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export function notificationsFor(s) {
  const ss = s.session;
  if (!ss) return [];
  const n = [];
  if (ss.role === 'cliente') {
    s.requests.filter((r) => r.clientId === ss.clientId && r.status === 'ofertas').forEach((r) => n.push({ text: `${r.offers.filter((o) => o.available !== 'no').length} ofertas para ${itemsText(r.items)}`, href: `/app/solicitud/${r.id}`, tone: 'warn' }));
    s.incidents.filter((i) => i.status !== 'resuelta' && s.rentals.some((r) => r.id === i.rentalId && r.clientId === ss.clientId)).forEach((i) => n.push({ text: `Avería ${i.id}: ${i.status}`, href: '/app/averias', tone: 'bad' }));
    movements(s, (r) => r.clientId === ss.clientId).filter((m) => m.date <= addDays(todayISO(), 3)).forEach((m) => n.push({ text: `${m.kind} el ${m.date.slice(8)}/${m.date.slice(5, 7)}: ${itemsText(m.rental.items)}`, href: '/app/entregas', tone: 'info' }));
  } else if (ss.role === 'proveedor') {
    s.requests.filter((r) => ['buscando', 'ofertas'].includes(r.status) && r.contacted.some((c) => c.providerId === ss.providerId) && !r.offers.some((o) => o.providerId === ss.providerId)).forEach((r) => n.push({ text: `Nueva solicitud: ${itemsText(r.items)} en ${r.municipio}`, href: '/app/solicitudes', tone: 'warn' }));
    s.rentals.filter((r) => r.providerId === ss.providerId && r.status === 'baja solicitada').forEach((r) => n.push({ text: `Recogida pedida: ${r.id}`, href: '/app/alquileres', tone: 'info' }));
    s.incidents.filter((i) => i.status === 'abierta' && s.rentals.some((r) => r.id === i.rentalId && r.providerId === ss.providerId)).forEach((i) => n.push({ text: `Incidencia abierta ${i.id}: ${i.type}`, href: '/app/incidencias', tone: 'bad' }));
  } else {
    s.incidents.filter((i) => i.status !== 'resuelta' && i.urgent).forEach((i) => n.push({ text: `Avería urgente ${i.id}`, href: '/app/incidencias', tone: 'bad' }));
    s.requests.filter((r) => r.status === 'buscando').forEach((r) => n.push({ text: `${r.id} sin ofertas todavía`, href: `/app/solicitud/${r.id}`, tone: 'warn' }));
    const pend = s.rentals.filter((r) => r.status === 'finalizada' && r.commissionStatus === 'pendiente').length;
    if (pend) n.push({ text: `${pend} comisiones por liquidar`, href: '/app/comisiones', tone: 'info' });
  }
  return n;
}
