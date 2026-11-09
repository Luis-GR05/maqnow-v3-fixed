// Datos reales en Supabase: solicitudes, ofertas de proveedores y alquileres.
// Se usa cuando hay sesión con una cuenta de Supabase; el modo invitado sigue siendo local.
// Los registros se traducen a la misma forma que usa la demo, así las pantallas no cambian.
import { sb } from './supabase';
import { addDays } from './format';
import { DOCS } from '../data/providers';

const DELIVERY_IN = { transporte_incluido: 'Transporte incluido', recogida_en_proveedor: 'Recogida en proveedor' };
const DELIVERY_OUT = { 'Transporte incluido': 'transporte_incluido', 'Recogida en proveedor': 'recogida_en_proveedor' };
const RENTAL_IN = { reservada: 'reservada', en_alquiler: 'en alquiler', baja_solicitada: 'baja solicitada', finalizada: 'finalizada' };
const ms = (t) => (t ? Date.parse(t) : null);
const num = (n) => Number(n) || 0;
const fail = (error) => { if (error) throw error; };

const PROVIDER_COLS = 'id, name, scope, status, city, province, base_km, rating, response_min, assistance_hours, payment_terms, specialty, plan';

function mapProvider(p, fams, provs, internal, contact) {
  return {
    id: p.id, name: p.name, scope: p.scope === 'nacional' ? 'Nacional' : 'Local', status: p.status,
    city: p.city || '', province: p.province || '', km: p.base_km, provinces: provs[p.id] || [], families: fams[p.id] || [],
    rating: num(p.rating) || 4, responseMin: p.response_min, assistanceH: p.assistance_hours, payment: p.payment_terms,
    specialty: p.specialty || '', plan: p.plan, reliability: internal?.reliability ?? 85, commission: num(internal?.commission_pct ?? 5),
    level: internal?.level, priceFactor: 1, manual: true,
    contactName: contact?.contact_name || '', phone: contact?.phone || '', email: contact?.email || '',
  };
}

function mapClient(c) {
  return {
    id: c.id, code: c.code, name: c.name, cif: c.cif || '', contact: c.contact_name || '', phone: c.phone || '', email: c.email || '',
    payment: c.payment_method, creditLimit: num(c.credit_limit), avgPayDays: c.avg_pay_days, since: (c.created_at || '').slice(0, 10),
  };
}

function mapRequest(r) {
  const contacts = r.request_contacts || [];
  const sentAt = (pid) => ms(contacts.find((c) => c.provider_id === pid)?.sent_at) || ms(r.created_at);
  return {
    id: r.code, remoteId: r.id, clientId: r.client_id, siteId: r.site_id,
    items: (r.request_items || []).map((i) => ({ family: i.family_id, type: i.machine_type, qty: i.quantity, specs: i.specs || {} })),
    municipio: r.municipality, cp: r.postal_code || '', province: r.province,
    start: r.start_date, days: r.days, indefinite: r.indefinite, end: addDays(r.start_date, r.days),
    delivery: DELIVERY_IN[r.delivery] || 'Transporte incluido', urgent: r.urgent, notes: r.notes || '',
    address: r.address || '', contactName: r.contact_name || '', contactPhone: r.contact_phone || '', orderRef: r.order_ref || '',
    status: r.status, createdAt: ms(r.created_at), viewedAt: ms(r.viewed_at), remindedAt: ms(r.reminded_at), byAgent: r.by_agent,
    contacted: contacts.map((c) => ({ providerId: c.provider_id, sentAt: ms(c.sent_at), responded: !!c.responded_at, auto: false, pending: null })),
    offers: (r.offers || []).map((o) => ({
      remoteId: o.id, providerId: o.provider_id, available: o.availability, delayDays: o.delay_days,
      km: o.distance_km ?? 20, price: num(o.price), transport: num(o.transport), deposit: num(o.deposit),
      deliveryDate: o.delivery_date || addDays(r.start_date, o.delay_days), assistanceH: o.assistance_hours ?? 4,
      payment: o.payment_terms || '', notes: o.notes || '', manual: true,
      responseMin: Math.max(1, Math.round((ms(o.created_at) - sentAt(o.provider_id)) / 60000)),
    })),
    acceptedProviderId: null,
  };
}

function mapRental(t, req) {
  return {
    id: t.code, remoteId: t.id, requestId: req?.id || '', clientId: t.client_id, siteId: t.site_id, providerId: t.provider_id, machineIds: [],
    items: req?.items || [], municipio: req?.municipio || '', province: req?.province || '',
    start: t.start_date, end: t.end_date, days: t.days, indefinite: t.indefinite,
    price: num(t.price), transport: num(t.transport), total: num(t.total), deposit: num(t.deposit), payment: t.payment_terms || '',
    saving: num(t.saving), commissionPct: num(t.commission_pct), commission: num(t.commission), commissionStatus: t.commission_status,
    status: RENTAL_IN[t.status] || t.status, bajaDate: t.baja_date, review: null, paid: false, acceptedAt: ms(t.accepted_at),
  };
}

function mapMachine(m) {
  const have = new Set((m.machine_documents || []).map((d) => d.doc_type));
  return {
    id: m.code, remoteId: m.id, providerId: m.provider_id, family: m.family_id, type: m.machine_type, size: m.size_label || '',
    brand: m.brand || 'Sin marca', model: m.model || '', year: m.year, serial: m.serial_number || '', hours: m.hours, status: m.status,
    lastMaint: m.last_maintenance, nextMaint: m.next_maintenance, lastInspection: m.last_inspection,
    docs: Object.fromEntries(DOCS.map((d) => [d, have.has(d)])),
  };
}

// Todo lo que el usuario puede ver según su rol (la RLS de la base de datos filtra)
export async function loadRemote(userId) {
  const c = await sb();
  const [profile, provs, fams, zones, internal, contacts, clients, cm, pm, sites, reqs, rentals, machines] = await Promise.all([
    c.from('profiles').select('full_name, role, active').eq('id', userId).single(),
    c.from('providers').select(PROVIDER_COLS).order('name'),
    c.from('provider_families').select('provider_id, family_id'),
    c.from('provider_provinces').select('provider_id, province'),
    c.from('provider_internal').select('provider_id, commission_pct, reliability, level'),
    c.from('provider_contacts').select('provider_id, contact_name, phone, email'),
    c.from('clients').select('*').order('name'),
    c.from('client_members').select('client_id').eq('user_id', userId),
    c.from('provider_members').select('provider_id').eq('user_id', userId),
    c.from('sites').select('*').order('created_at'),
    c.from('requests').select('*, request_items(*), request_contacts(provider_id, sent_at, responded_at), offers(*)').order('created_at', { ascending: false }).limit(300),
    c.from('rentals').select('*').order('accepted_at', { ascending: false }).limit(300),
    c.from('machines').select('*, machine_documents(doc_type)').order('created_at').limit(1000),
  ]);
  [profile, provs, fams, zones, clients, cm, pm, sites, reqs, rentals].forEach((x) => fail(x.error));
  const group = (rows, key, val) => rows.reduce((a, r) => ((a[r[key]] ||= []).push(r[val]), a), {});
  const famBy = group(fams.data, 'provider_id', 'family_id');
  const zoneBy = group(zones.data, 'provider_id', 'province');
  const intBy = Object.fromEntries((internal.data || []).map((x) => [x.provider_id, x]));
  const conBy = Object.fromEntries((contacts.data || []).map((x) => [x.provider_id, x]));

  const requests = reqs.data.map(mapRequest);
  const byRemote = Object.fromEntries(requests.map((r) => [r.remoteId, r]));
  const rentalList = rentals.data.map((t) => {
    const req = byRemote[t.request_id];
    if (req) req.acceptedProviderId = t.provider_id;
    return mapRental(t, req);
  });
  return {
    role: profile.data.role, active: profile.data.active, name: profile.data.full_name,
    clientId: cm.data[0]?.client_id, providerId: pm.data[0]?.provider_id,
    providers: provs.data.map((p) => mapProvider(p, famBy, zoneBy, intBy[p.id], conBy[p.id])),
    clients: clients.data.map(mapClient),
    sites: sites.data.map((x) => ({ id: x.id, clientId: x.client_id, name: x.name, municipio: x.municipality, province: x.province, cp: x.postal_code || '' })),
    requests, rentals: rentalList, machines: (machines.data || []).map(mapMachine),
  };
}

// Nueva solicitud: obra (si es nueva) → solicitud → líneas → envío a los proveedores compatibles
export async function createRemoteRequest(state, clientId, data) {
  const c = await sb();
  let siteId = data.siteId || null;
  if (!siteId) {
    const name = data.siteName || `Obra ${data.municipio}`;
    const known = state.sites.find((x) => x.clientId === clientId && x.municipio === data.municipio && x.name === name);
    if (known) siteId = known.id;
    else {
      const { data: site, error } = await c.from('sites').insert({ client_id: clientId, name, municipality: data.municipio, province: data.province, postal_code: data.cp || null }).select('id').single();
      fail(error);
      siteId = site.id;
    }
  }
  const { data: req, error } = await c.from('requests').insert({
    client_id: clientId, site_id: siteId, created_by: (await c.auth.getUser()).data.user?.id,
    municipality: data.municipio, province: data.province, postal_code: data.cp || null,
    start_date: data.start, days: data.days, indefinite: !!data.indefinite,
    delivery: DELIVERY_OUT[data.delivery] || 'transporte_incluido', urgent: !!data.urgent, notes: data.notes || null,
    address: data.address || null, contact_name: data.contactName || null, contact_phone: data.contactPhone || null, order_ref: data.orderRef || null,
    by_agent: !!data.byAgent,
  }).select('id, code').single();
  fail(error);
  fail((await c.from('request_items').insert(data.items.map((it) => ({
    request_id: req.id, family_id: it.family, machine_type: it.type, quantity: it.qty || 1, specs: it.specs || {},
  })))).error);
  fail((await c.rpc('dispatch_request', { p_request: req.id, p_max: 30 })).error);
  return req.code;
}

export async function submitRemoteOffer(req, providerId, o) {
  const c = await sb();
  const p = { delay: o.available === 'parcial' ? Math.max(1, o.delayDays || 1) : 0 };
  const { error } = await c.from('offers').upsert({
    request_id: req.remoteId, provider_id: providerId, availability: o.available, delay_days: p.delay,
    price: o.available === 'no' ? 0 : o.price, transport: o.available === 'no' ? 0 : o.transport || 0,
    deposit: o.deposit ?? Math.max(150, Math.round((o.price * 0.3) / 50) * 50),
    delivery_date: addDays(req.start, p.delay), payment_terms: o.payment || null, notes: o.notes || null,
  }, { onConflict: 'request_id,provider_id' });
  fail(error);
}

export async function acceptRemoteOffer(req, providerId) {
  const c = await sb();
  const offer = req.offers.find((o) => o.providerId === providerId);
  const { error } = await c.rpc('accept_offer', { p_offer: offer.remoteId });
  fail(error);
}

export async function updateRemoteRequest(req, patch) {
  const c = await sb();
  fail((await c.from('requests').update(patch).eq('id', req.remoteId)).error);
}

// Flota del proveedor (la RLS solo deja tocar las máquinas propias)
export async function addRemoteMachine(providerId, m) {
  const c = await sb();
  fail((await c.from('machines').insert({
    provider_id: providerId, family_id: m.family, machine_type: m.type, size_label: m.size || null,
    brand: m.brand || null, year: +m.year || new Date().getFullYear(),
  })).error);
}
export async function setRemoteMachineStatus(machine, status) {
  const c = await sb();
  fail((await c.from('machines').update({ status }).eq('id', machine.remoteId)).error);
}
export async function toggleRemoteDoc(machine, doc) {
  const c = await sb();
  const q = machine.docs[doc]
    ? c.from('machine_documents').delete().eq('machine_id', machine.remoteId).eq('doc_type', doc)
    : c.from('machine_documents').insert({ machine_id: machine.remoteId, doc_type: doc });
  fail((await q).error);
}

// Pasos del alquiler (entrega, baja, recogida): funciones de la base de datos que validan permisos y estado
export async function rentalRpc(fn, rental, args = {}) {
  const c = await sb();
  fail((await c.rpc(fn, { p_rental: rental.remoteId, ...args })).error);
}

export async function saveRemoteClient(data) {
  const c = await sb();
  fail((await c.from('clients').update({ name: data.name, cif: data.cif || null, contact_name: data.contact || null, phone: data.phone || null, email: data.email || null }).eq('id', data.id)).error);
}

// Enlaces de respuesta de cada proveedor contactado (solo el equipo MAQNOW los puede leer)
export async function offerLinks(req) {
  const c = await sb();
  const { data, error } = await c.from('offer_links').select('token, provider_id, opened_at, notified_at, reminded_at').eq('request_id', req.remoteId);
  fail(error);
  return data;
}

// Email a los proveedores con su enlace (función notify-providers + Resend).
// remind: recordatorio a los que no han respondido (solo equipo MAQNOW).
export async function notifyProviders(req, remind = false) {
  const c = await sb();
  const { data, error } = await c.functions.invoke('notify-providers', { body: { request_id: req.remoteId, remind } });
  if (error) {
    let msg = error.message;
    try { msg = (await error.context.json()).error || msg; } catch { /* sin detalle */ }
    throw new Error(`Email no enviado: ${msg}`);
  }
  return data;
}

// Página del enlace del email de aviso (resumen de la solicitud)
export async function linkView(token) {
  const c = await sb();
  const { data, error } = await c.rpc('offer_link_view', { p_token: token });
  fail(error);
  return data;
}
// Avisos en tiempo real: cualquier cambio en solicitudes, ofertas o alquileres recarga los datos
export async function watchRemote(onChange) {
  const c = await sb();
  let t;
  const kick = () => { clearTimeout(t); t = setTimeout(onChange, 400); };
  const ch = c.channel('maqnow-live');
  ['requests', 'request_contacts', 'offers', 'rentals'].forEach((table) => ch.on('postgres_changes', { event: '*', schema: 'public', table }, kick));
  ch.subscribe();
  return () => { clearTimeout(t); c.removeChannel(ch); };
}
