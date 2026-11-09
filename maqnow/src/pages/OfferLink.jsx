import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, CalendarDays, Clock, LogIn, MapPin, UserPlus } from 'lucide-react';
import { Logo } from '../components/Logo';
import { go } from '../components/ui';
import { Loading } from '../components/Screens';
import { linkView } from '../lib/remote';
import { actions, isRemote, useStore } from '../lib/store';
import { supabaseEnabled } from '../lib/supabase';
import { addDays, fmtDate } from '../lib/format';
import { SITE } from '../data/site';

// Página del enlace que llega al proveedor en el email de aviso. No se oferta aquí: lleva a su panel.
//  · Con su cuenta abierta → directamente a la solicitud en su panel.
//  · Con cuenta pero sin sesión → a entrar (y vuelve aquí).
//  · Sin cuenta todavía → alta gratuita vinculada a su ficha de proveedor (claim_token).
export function OfferLink({ token }) {
  const s = useStore();
  const [data, setData] = useState(undefined); // undefined: cargando · null: enlace no válido
  useEffect(() => {
    if (!supabaseEnabled) { setData(null); return; }
    linkView(token).then(setData).catch(() => setData(null));
  }, [token]);

  const ss = s.session;
  const waiting = isRemote(s) && !ss.live;
  const mine = data && isRemote(s) && ss.live && ss.role === 'proveedor' && ss.providerId === data.provider_id;
  useEffect(() => { if (mine) go(`/app/solicitud/${data.code}`); }, [mine]);

  const here = `/oferta/${token}`;
  const login = () => { sessionStorage.setItem('maqnow-next', here); go('/acceso'); };
  const register = () => {
    sessionStorage.setItem('maqnow-next', here);
    sessionStorage.setItem('maqnow-claim', JSON.stringify({ token, provider: data.provider, email: data.email || '' }));
    go('/registro/proveedor');
  };

  let body;
  if (data === undefined || waiting || mine) body = <Loading />;
  else if (data === null) {
    body = (
      <section className="card offer-link-msg">
        <AlertTriangle size={28} aria-hidden />
        <h1>Enlace no válido</h1>
        <p>Este enlace no existe o ha caducado. Entra en tu panel de {SITE.name} para ver tus solicitudes.</p>
        <a className="btn btn-primary" href="#/acceso">Entrar</a>
      </section>
    );
  } else {
    const other = ss && !ss.guest;
    body = (
      <>
        <header className="offer-link-head">
          <span className="code">{data.code}{data.urgent ? ' · URGENTE' : ''}</span>
          <h1>Nueva solicitud para {data.provider}</h1>
          <p>Un cliente de {SITE.name} necesita esta maquinaria. Mira los detalles y envía tu oferta desde tu panel de proveedor.</p>
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
            <div><dt><MapPin size={15} aria-hidden /> Obra</dt><dd>{data.municipality} ({data.province})</dd></div>
            <div><dt><CalendarDays size={15} aria-hidden /> Fechas</dt><dd>{fmtDate(data.start_date)} – {fmtDate(addDays(data.start_date, data.days))} · {data.days} días</dd></div>
          </dl>
        </section>

        {!data.open ? (
          <section className="card offer-link-msg small"><Clock size={20} aria-hidden /><p>Esta solicitud ya está cerrada{data.offer_sent ? '. Gracias por tu oferta.' : '.'}</p></section>
        ) : other ? (
          <section className="card offer-link-cta">
            <p>Has entrado con otra cuenta ({ss.email || ss.name}). Para ofertar, entra con la cuenta de {data.provider}.</p>
            <button className="btn btn-primary" onClick={() => { actions.logout(); login(); }}><LogIn size={16} aria-hidden /> Cambiar de cuenta</button>
          </section>
        ) : data.claimed ? (
          <section className="card offer-link-cta">
            <p>{data.offer_sent ? 'Ya has enviado tu oferta. Puedes revisarla o modificarla en tu panel.' : 'Entra en tu panel para enviar tu oferta: disponibilidad, precio y transporte.'}</p>
            <button className="btn btn-primary btn-lg" onClick={login}><LogIn size={18} aria-hidden /> Entrar y ofertar <ArrowRight size={18} aria-hidden /></button>
          </section>
        ) : (
          <section className="card offer-link-cta">
            <p><b>Activa tu panel de proveedor (gratis, un minuto).</b> Desde él envías las ofertas, ves si el cliente te elige y gestionas entregas y recogidas. Tu cuenta queda vinculada a la ficha de {data.provider}.</p>
            <div className="offer-link-actions">
              <button className="btn btn-primary btn-lg" onClick={register}><UserPlus size={18} aria-hidden /> Activar mi cuenta y ofertar</button>
              <button className="btn btn-ghost" onClick={login}>Ya tengo cuenta</button>
            </div>
          </section>
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
