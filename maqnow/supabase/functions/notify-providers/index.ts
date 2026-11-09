// MAQNOW · notify-providers
// Avisa por email (Resend) a cada proveedor contactado de que tiene una solicitud nueva. El email es solo
// un aviso: el botón lleva a su panel de MAQNOW, donde envía la oferta (si aún no tiene cuenta, la activa
// desde ese mismo enlace, vinculada a su ficha).
//
//   POST { request_id }                → primer aviso a los proveedores que aún no lo tienen (cliente o equipo)
//   POST { request_id, remind: true }  → recordatorio a los que no han respondido (solo equipo MAQNOW)
//
// Secretos (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY  clave de Resend (re_...)
//   MAIL_FROM       remitente de un dominio verificado en Resend, p. ej. "MAQNOW <solicitudes@tudominio.es>"
//   MAIL_REPLY_TO   (opcional) email donde llegan las respuestas de los proveedores
//   SITE_URL        (opcional) dirección de la web; por defecto la de GitHub Pages
// SUPABASE_URL y las claves del proyecto las pone Supabase solo.
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const EMAIL_RE = /^[^\s@,;/]+@[^\s@,;/]+\.[a-z]{2,}$/i;
const DEFAULT_SITE = 'https://luis-gr05.github.io/maqnow-v3-fixed/';

// Claves del proyecto: nuevas (publishable/secret) o antiguas (anon/service_role)
const keyFrom = (legacy: string, list: string) => {
  const v = Deno.env.get(legacy);
  if (v) return v;
  try { return JSON.parse(Deno.env.get(list) ?? '{}').default as string | undefined; } catch { return undefined; }
};

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const fmtDate = (iso: string) => new Date(iso + 'T12:00:00Z').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const addDays = (iso: string, n: number) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

type Item = { machine_type: string; quantity: number; specs: Record<string, string> | null; families: { name: string } | null };
type Req = {
  id: string; code: string; client_id: string; status: string; municipality: string; province: string;
  start_date: string; days: number; indefinite: boolean; urgent: boolean; delivery: string; notes: string | null; request_items: Item[];
};

export function buildEmail(r: Req, providerName: string, url: string, remind: boolean) {
  const items = r.request_items.map((i) => {
    const specs = Object.entries(i.specs ?? {}).map(([k, v]) => `${k}: ${v}`).join(', ');
    return { title: `${i.quantity} × ${i.machine_type}`, sub: [i.families?.name, specs].filter(Boolean).join(' · ') };
  });
  const what = items.map((i) => i.title).join(' + ');
  const dates = `${fmtDate(r.start_date)} – ${fmtDate(addDays(r.start_date, r.days))} (${r.days} días${r.indefinite ? ', abierto hasta fin de obra' : ''})`;
  const delivery = r.delivery === 'recogida_en_proveedor' ? 'El cliente recoge en vuestra base' : 'Transporte a obra (incluidlo en el precio)';
  const subject = `${remind ? 'Recordatorio: ' : ''}${r.urgent ? 'URGENTE · ' : ''}Nueva solicitud ${r.code} · ${what} en ${r.municipality}`;
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#5f6871;font-size:14px;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0;font-size:15px;font-weight:600;color:#17191c">${esc(v)}</td></tr>`;
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#eef0f1;font-family:Arial,Helvetica,sans-serif;color:#17191c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f1;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #d7dbdf">
<tr><td style="background:#17191c;padding:18px 24px;font-size:22px;font-weight:800;letter-spacing:.5px;color:#ffffff">MAQ<span style="color:#ffc400">NOW</span></td></tr>
<tr><td style="padding:24px">
<p style="margin:0 0 4px;font-size:13px;color:#5f6871">${esc(r.code)}${r.urgent ? ' · <b style="color:#b42318">URGENTE</b>' : ''}</p>
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.25">${remind ? 'Tenéis una solicitud pendiente de oferta' : 'Tenéis una nueva solicitud de alquiler'}</h1>
<p style="margin:0 0 18px;font-size:15px;line-height:1.5">Hola, ${esc(providerName)}. Un cliente de MAQNOW necesita esta maquinaria en vuestra zona. Entrad en vuestro panel para ver los detalles y enviar vuestra oferta: el cliente compara las ofertas y elige.</p>
${items.map((i) => `<div style="background:#eef0f1;border-left:4px solid #ffc400;border-radius:6px;padding:10px 14px;margin:0 0 8px"><b style="font-size:16px">${esc(i.title)}</b>${i.sub ? `<br><span style="font-size:13px;color:#5f6871">${esc(i.sub)}</span>` : ''}</div>`).join('')}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px 0 18px">
${row('Obra', `${r.municipality} (${r.province})`)}${row('Fechas', dates)}${row('Entrega', delivery)}${r.notes ? row('Notas', r.notes) : ''}
</table>
<p style="margin:0 0 22px"><a href="${esc(url)}" style="display:inline-block;background:#ffc400;color:#17191c;font-weight:700;font-size:16px;text-decoration:none;padding:13px 22px;border-radius:8px">Ir a mi panel y ofertar</a></p>
<p style="margin:0;font-size:13px;color:#5f6871;line-height:1.5">¿Todavía no tenéis cuenta en MAQNOW? Desde ese mismo botón la activáis gratis en un minuto, ya vinculada a vuestra empresa. La dirección exacta y el contacto en obra se comparten si el cliente elige vuestra oferta.</p>
</td></tr>
<tr><td style="padding:14px 24px;border-top:1px solid #d7dbdf;font-size:12px;color:#5f6871">Recibís este email porque vuestra empresa figura como proveedor de alquiler de maquinaria en vuestra zona. Si no queréis recibir más solicitudes, contestad a este correo y os damos de baja.</td></tr>
</table></td></tr></table></body></html>`;
  const text = [
    `${remind ? 'Recordatorio. ' : ''}Tenéis una nueva solicitud de alquiler en MAQNOW: ${r.code}${r.urgent ? ' (URGENTE)' : ''}`,
    `Hola, ${providerName}. Un cliente necesita: ${what}.`,
    `Obra: ${r.municipality} (${r.province})`, `Fechas: ${dates}`, `Entrega: ${delivery}`, r.notes ? `Notas: ${r.notes}` : '',
    '', `Entrad en vuestro panel para ver los detalles y enviar la oferta: ${url}`,
    'Si aún no tenéis cuenta, desde ese enlace la activáis gratis, vinculada a vuestra empresa.',
  ].filter((x) => x !== '').join('\n');
  return { subject, html, text };
}

export async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const publicKey = keyFrom('SUPABASE_ANON_KEY', 'SUPABASE_PUBLISHABLE_KEYS');
  const secretKey = keyFrom('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEYS');
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('MAIL_FROM') ?? 'MAQNOW <onboarding@resend.dev>';
  const replyTo = Deno.env.get('MAIL_REPLY_TO');
  const site = (Deno.env.get('SITE_URL') ?? DEFAULT_SITE).replace(/\/?$/, '/');
  if (!publicKey || !secretKey) return json({ error: 'Faltan las claves del proyecto en la función' }, 500);
  if (!resendKey) return json({ error: 'Falta el secreto RESEND_API_KEY' }, 500);

  // Quién llama: se comprueba su sesión y, con sus permisos (RLS), que puede ver la solicitud
  const auth = req.headers.get('Authorization') ?? '';
  const asUser = createClient(url, publicKey, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
  const { data: who } = await asUser.auth.getUser(auth.replace(/^Bearer\s+/i, ''));
  if (!who?.user) return json({ error: 'Sesión no válida' }, 401);

  let body: { request_id?: string; remind?: boolean };
  try { body = await req.json(); } catch { return json({ error: 'Cuerpo no válido' }, 400); }
  if (!body.request_id) return json({ error: 'Falta request_id' }, 400);
  const remind = !!body.remind;

  const { data: r } = await asUser.from('requests')
    .select('id, code, client_id, status, municipality, province, start_date, days, indefinite, urgent, delivery, notes, request_items(machine_type, quantity, specs, families(name))')
    .eq('id', body.request_id).maybeSingle<Req>();
  if (!r) return json({ error: 'Solicitud no encontrada' }, 404);
  const [{ data: staff }, { data: member }] = await Promise.all([
    asUser.rpc('is_staff'), asUser.rpc('is_client_member', { p_client: r.client_id }),
  ]);
  if (!staff && !(member && !remind)) return json({ error: 'Sin permiso' }, 403);
  if (!['buscando', 'ofertas'].includes(r.status)) return json({ sent: 0, skipped: 0, reason: 'La solicitud está cerrada' });

  // A partir de aquí, con permisos de servidor: enlaces y emails de los proveedores no los ve el cliente
  const admin = createClient(url, secretKey, { auth: { persistSession: false } });
  const [{ data: links, error: e1 }, { data: contacts, error: e2 }] = await Promise.all([
    admin.from('offer_links').select('token, provider_id, notified_at').eq('request_id', r.id),
    admin.from('request_contacts').select('provider_id, responded_at').eq('request_id', r.id),
  ]);
  if (e1 || e2) return json({ error: (e1 ?? e2)!.message }, 500);
  const answered = new Set((contacts ?? []).filter((c) => c.responded_at).map((c) => c.provider_id));
  const due = (links ?? []).filter((l) => !answered.has(l.provider_id) && (remind ? l.notified_at : !l.notified_at));
  if (!due.length) return json({ sent: 0, skipped: 0 });

  const { data: provs, error: e3 } = await admin.from('providers').select('id, name, email').in('id', due.map((l) => l.provider_id));
  if (e3) return json({ error: e3.message }, 500);
  const byId = new Map((provs ?? []).map((p) => [p.id, p]));
  const targets = due.map((l) => ({ ...l, p: byId.get(l.provider_id) }))
    .map((l) => ({ ...l, email: (l.p?.email ?? '').split(/[\s,;/]+/).find((x: string) => EMAIL_RE.test(x)) }));
  const ok = targets.filter((t) => t.email);
  const skipped = targets.filter((t) => !t.email).map((t) => t.p?.name ?? t.provider_id);

  // Resend: un envío por lotes (hasta 100 emails por llamada)
  let sent = 0;
  for (let i = 0; i < ok.length; i += 100) {
    const chunk = ok.slice(i, i + 100);
    const payload = chunk.map((t) => {
      const mail = buildEmail(r, t.p!.name, `${site}#/oferta/${t.token}`, remind);
      return { from, to: [t.email!], subject: mail.subject, html: mail.html, text: mail.text, ...(replyTo ? { reply_to: replyTo } : {}) };
    });
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const detail = await res.text();
      return json({ error: `Resend ha rechazado el envío (${res.status})`, detail, sent }, 502);
    }
    const now = new Date().toISOString();
    const tokens = chunk.map((t) => t.token);
    await admin.from('offer_links').update(remind ? { reminded_at: now } : { notified_at: now }).in('token', tokens);
    if (remind) {
      await admin.from('request_contacts').update({ reminded_at: now }).eq('request_id', r.id).in('provider_id', chunk.map((t) => t.provider_id));
    }
    sent += chunk.length;
  }
  if (remind && sent) await admin.from('requests').update({ reminded_at: new Date().toISOString() }).eq('id', r.id);
  return json({ sent, skipped: skipped.length, without_email: skipped });
}

if (!Deno.env.get('MAQNOW_TEST')) Deno.serve(handler);
