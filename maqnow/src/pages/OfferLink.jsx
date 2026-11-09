import React, { useEffect, useState } from 'react';
import { Check, Clock, MapPin, CalendarDays, Truck, AlertTriangle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Field } from '../components/ui';
import { Loading } from '../components/Screens';
import { linkSubmit, linkView } from '../lib/remote';
import { supabaseEnabled } from '../lib/supabase';
import { addDays, eur, fmtDate } from '../lib/format';
import { SITE } from '../data/site';

// Página que abre el proveedor desde el enlace de su email o WhatsApp: ve la petición y envía su
// precio sin crear cuenta. El enlace es personal (uno por proveedor y solicitud).
export function OfferLink({ token }) {
  const [data, setData] = useState(undefined); // undefined: cargando · null: enlace no válido
  const [f, setF] = useState({ available: 'si', price: '', transport: '', deposit: '', delayDays: 1, notes: '' });
  const [edit, setEdit] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = () => linkView(token).then((d) => {
    setData(d);
    if (d?.offer) {
      const o = d.offer;
      setF({ available: o.availability, price: o.availability === 'no' ? '' : +o.price, transport: +o.transport, deposit: +o.deposit, delayDays: o.delay_days || 1, notes: o.notes || '' });
      setEdit(false);
    }
  }).catch(() => setData(null));
  useEffect(() => { if (supabaseEnabled) load(); else setData(null); }, [token]);

  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr(''); };
  const send = async (e) => {
    e.preventDefault();
    if (f.available !== 'no' && !(+f.price > 0)) return setErr('Indica el precio del alquiler.');
    setBusy(true);
    try {
      await linkSubmit(token, { ...f, price: +f.price || 0, transport: +f.transport || 0, delayDays: +f.delayDays || 1 });
      await load();
      setEdit(false);
    } catch (x) { setErr(x?.message || 'No se ha podido enviar. Inténtalo de nuevo.'); }
    setBusy(false);
  };

  let body;
  if (data === undefined) body = <Loading />;
  else if (data === null) {
    body = (
      <section className="card offer-link-msg">
        <AlertTriangle size={28} aria-hidden />
        <h1>Enlace no válido</h1>
        <p>Este enlace no existe o ha caducado. Si te ha llegado una solicitud de {SITE.name}, contesta al mensaje y te enviamos uno nuevo.</p>
      </section>
    );
  } else {
    const o = data.offer;
    const total = o && o.availability !== 'no' ? +o.price + +o.transport : 0;
    body = (
      <>
        <header className="offer-link-head">
          <span className="code">{data.code}{data.urgent ? ' · URGENTE' : ''}</span>
          <h1>Solicitud de alquiler para {data.provider.name}</h1>
          <p>Un cliente de {SITE.name} necesita esta maquinaria. Indica si la tienes disponible y tu precio: el cliente compara las ofertas y elige.</p>
        </header>

        <section className="card offer-link-req">
          <ul className="offer-link-items">
            {data.items.map((it, i) => (
              <li key={i}>
                <b>{it.qty} × {it.type}</b>
                <span>{it.family_name}{Object.entries(it.specs || {}).map(([k, v]) => ` · ${k}: ${v}`).join('')}</span>
              </li>
            ))}
          </ul>
          <dl className="offer-link-facts">
            <div><dt><MapPin size={15} aria-hidden /> Obra</dt><dd>{data.municipality} ({data.province}){data.postal_code ? ` · ${data.postal_code}` : ''}</dd></div>
            <div><dt><CalendarDays size={15} aria-hidden /> Fechas</dt><dd>{fmtDate(data.start_date)} – {fmtDate(addDays(data.start_date, data.days))} · {data.days} días{data.indefinite ? ' (abierto hasta fin de obra)' : ''}</dd></div>
            <div><dt><Truck size={15} aria-hidden /> Entrega</dt><dd>{data.delivery === 'recogida_en_proveedor' ? 'El cliente recoge en tu base' : 'Transporte a obra (indícalo en tu precio)'}</dd></div>
          </dl>
          {data.notes && <p className="offer-link-notes">“{data.notes}”</p>}
          {!data.site && <p className="muted">La dirección exacta y el contacto en obra se comparten si el cliente elige tu oferta.</p>}
        </section>

        {data.won && data.site && (
          <section className="card offer-link-won">
            <h2><Check size={18} aria-hidden /> El cliente ha elegido tu oferta</h2>
            <dl className="offer-link-facts">
              <div><dt>Cliente</dt><dd>{data.site.client}</dd></div>
              <div><dt>Dirección</dt><dd>{data.site.address || '—'}</dd></div>
              <div><dt>Contacto en obra</dt><dd>{data.site.contact_name || '—'}{data.site.contact_phone ? ` · ${data.site.contact_phone}` : ''}</dd></div>
              {data.site.order_ref && <div><dt>Referencia</dt><dd>{data.site.order_ref}</dd></div>}
            </dl>
          </section>
        )}

        {!data.open && !data.won && (
          <section className="card offer-link-msg small"><Clock size={20} aria-hidden /><p>Esta solicitud ya está cerrada{o ? '. Gracias por tu oferta.' : '.'}</p></section>
        )}

        {o && !edit && (
          <section className="card offer-link-sent">
            <div>
              <b><Check size={16} aria-hidden /> Oferta enviada</b>
              <span>{o.availability === 'no' ? 'Sin disponibilidad' : `${eur(total)} sin IVA (alquiler ${eur(+o.price)} + transporte ${eur(+o.transport)}) · fianza ${eur(+o.deposit)}${o.availability === 'parcial' ? ` · entrega con ${o.delay_days} días de retraso` : ''}`}</span>
            </div>
            {data.open && <button className="btn btn-ghost btn-sm" onClick={() => setEdit(true)}>Modificar oferta</button>}
          </section>
        )}

        {data.open && edit && (
          <form className="card inline-form offer-link-form" onSubmit={send}>
            <h2>{o ? 'Modifica tu oferta' : 'Tu oferta'}</h2>
            <Field label="Disponibilidad">
              <select value={f.available} onChange={set('available')}>
                <option value="si">Disponible en la fecha</option><option value="parcial">Disponible con retraso</option><option value="no">No disponible</option>
              </select>
            </Field>
            {f.available === 'parcial' && <Field label="Días de retraso"><input type="number" min="1" value={f.delayDays} onChange={set('delayDays')} /></Field>}
            {f.available !== 'no' && <>
              <Field label="Precio del alquiler, todo el periodo (€ sin IVA)"><input required type="number" min="1" inputMode="decimal" value={f.price} onChange={set('price')} /></Field>
              <Field label="Transporte ida y vuelta (€)"><input type="number" min="0" inputMode="decimal" value={f.transport} onChange={set('transport')} placeholder="0 si va incluido" /></Field>
              <Field label="Fianza (€)"><input type="number" min="0" inputMode="decimal" value={f.deposit} onChange={set('deposit')} placeholder="Opcional" /></Field>
            </>}
            <Field label="Observaciones" wide><input value={f.notes} onChange={set('notes')} placeholder="Modelo, condiciones, horario de entrega…" /></Field>
            {err && <p className="error" role="alert">{err}</p>}
            <div className="offer-link-actions">
              <button className="btn btn-primary" disabled={busy}>{busy ? 'Enviando…' : 'Enviar oferta'}</button>
              {o && <button type="button" className="btn btn-ghost" onClick={() => setEdit(false)}>Cancelar</button>}
            </div>
          </form>
        )}
      </>
    );
  }

  return (
    <div className="offer-link">
      <div className="offer-link-bar"><a className="brand" href="#/" aria-label={`${SITE.name}, inicio`}><Logo /></a></div>
      <main className="offer-link-main" id="contenido" tabIndex={-1}>{body}</main>
    </div>
  );
}
