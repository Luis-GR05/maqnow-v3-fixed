import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, Download, Wrench, LogOut, Repeat, Check, Loader, Phone, Mail, MessageCircle, Trophy, Star, FileCheck2, Plus, PlusCircle } from 'lucide-react';
import { familyById, itemLabel, PAYMENT_METHODS, PROVINCES } from '../data/catalog';
import { CONTACT } from '../data/providers';
import { actions, invoicesOf, itemsText, movements, providerById, rankOffers, setDraft, spendByMonth, stageIndex, STAGES, TOP_OFFERS, SCORE_WEIGHTS, SCORE_LABELS } from '../lib/store';
import { addDays, downloadCSV, eur, fmtDate, fmtDay, monthKey, monthLabel, todayISO } from '../lib/format';
import { Badge, Bars, Card, Columns, Empty, FamilyIcon, Field, Kpi, PageHead, Stars, Status, Stepline, Table, go } from '../components/ui';
import { PassportModal, docsPct } from '../components/Passport';
import { RequestWizard } from './RequestWizard';

const NewBtn = () => <a className="btn btn-primary" href="#/app/nueva"><PlusCircle size={16} /> Nueva solicitud</a>;

export function ClientPages({ s, page, id, onAssistant }) {
  const me = s.clients.find((c) => c.id === s.session.clientId);
  const ctx = {
    s, me, id, onAssistant,
    requests: s.requests.filter((r) => r.clientId === me.id),
    rentals: s.rentals.filter((r) => r.clientId === me.id),
    sites: s.sites.filter((x) => x.clientId === me.id),
  };
  switch (page) {
    case 'nueva': return <RequestWizard s={s} clientId={me.id} onAssistant={onAssistant} />;
    case 'solicitudes': return <Requests {...ctx} />;
    case 'solicitud': return <RequestDetail {...ctx} />;
    case 'ofertas': return <Offers {...ctx} />;
    case 'alquileres': return <Rentals {...ctx} />;
    case 'alquiler': return <RentalDetail {...ctx} />;
    case 'obras': return <Sites {...ctx} />;
    case 'entregas': return <Deliveries {...ctx} />;
    case 'averias': return <Incidents {...ctx} />;
    case 'documentacion': return <Documents {...ctx} />;
    case 'facturas': return <Invoices {...ctx} />;
    case 'favoritos': return <Favorites {...ctx} />;
    case 'informes': return <Reports {...ctx} />;
    case 'empresa': return <Company {...ctx} />;
    default: return <Dashboard {...ctx} />;
  }
}

/* ---------- Inicio ---------- */
function Dashboard({ s, me, requests, rentals, sites }) {
  const t = todayISO();
  const active = rentals.filter((r) => ['en alquiler', 'baja solicitada'].includes(r.status));
  const upcoming = rentals.filter((r) => r.status === 'reservada');
  const done = rentals.filter((r) => r.status === 'finalizada');
  const monthCost = rentals.filter((r) => monthKey(r.start) === monthKey(t)).reduce((a, r) => a + r.total, 0);
  const saving = rentals.reduce((a, r) => a + r.saving, 0);
  const open = requests.filter((r) => ['buscando', 'ofertas'].includes(r.status));
  const moves = movements(s, (r) => r.clientId === me.id).slice(0, 4);
  const favs = s.favorites.filter((f) => f.clientId === me.id);
  const incidents = s.incidents.filter((i) => i.status !== 'resuelta' && rentals.some((r) => r.id === i.rentalId));
  const repeat = (item) => { setDraft({ items: [item], step: 2 }); go('/app/nueva'); };

  return (
    <>
      <PageHead title={`Hola, ${s.session.guest ? 'invitado' : s.session.name.split(' ')[0]}`} sub={me.name} />
      <div className="kpis">
        <Kpi label="Alquileres activos" value={active.length} href="/app/alquileres" tone="ok" />
        <Kpi label="Próximos" value={upcoming.length} hint="reservados, pendientes de entrega" href="/app/entregas" />
        <Kpi label="Finalizados" value={done.length} href="/app/alquileres" />
        <Kpi label="Coste este mes" value={eur(monthCost)} href="/app/informes" />
        <Kpi label="Ahorro conseguido" value={eur(saving)} hint="frente a la media de ofertas" tone="accent" href="/app/informes" />
      </div>

      <div className="grid-main">
        <div>
          <Card title="Solicitudes abiertas" action={<a className="more" href="#/app/solicitudes">Ver todas</a>}>
            {open.length === 0 ? <p className="muted">No tienes solicitudes abiertas. Pide ofertas y las verás llegar aquí.</p> : (
              <div className="mini-list">
                {open.map((r) => (
                  <a key={r.id} href={`#/app/solicitud/${r.id}`}>
                    <div><b>{itemsText(r.items)}</b><span>{r.id} · {r.municipio} · desde {fmtDay(r.start)}</span></div>
                    <Status value={r.status} /><em>{r.offers.filter((o) => o.available !== 'no').length} ofertas</em><ArrowRight size={16} />
                  </a>
                ))}
              </div>
            )}
          </Card>
          <Card title="Máquinas en obra" action={<a className="more" href="#/app/alquileres">Ver alquileres</a>}>
            {active.length === 0 ? <p className="muted">Ahora mismo no tienes máquinas contratadas.</p> : (
              <div className="mini-list">
                {active.map((r) => (
                  <a key={r.id} href={`#/app/alquiler/${r.id}`}>
                    <div><b>{itemsText(r.items)}</b><span>{providerById(r.providerId, s).name} · {s.sites.find((x) => x.id === r.siteId)?.name || r.municipio} · hasta {fmtDay(r.end)}</span></div>
                    <Status value={r.status} /><em>{eur(r.total)}</em><ArrowRight size={16} />
                  </a>
                ))}
              </div>
            )}
          </Card>
          <Card title="Gasto por mes"><Columns rows={spendByMonth(rentals).map((m) => ({ label: monthLabel(m.key), value: m.value }))} format={eur} /></Card>
        </div>

        <div>
          {incidents.length > 0 && (
            <Card title="Averías en curso" className="alert-card">
              {incidents.map((i) => <a key={i.id} className="alert-row" href="#/app/averias"><Wrench size={16} /> <span><b>{i.type}</b> · {i.id}</span><Status value={i.status} /></a>)}
            </Card>
          )}
          <Card title="Próximas entregas y recogidas" action={<a className="more" href="#/app/entregas">Calendario</a>}>
            {moves.length === 0 ? <p className="muted">Sin movimientos previstos.</p> : (
              <ul className="agenda">{moves.map((m, i) => <li key={i}><time>{fmtDay(m.date)}</time><div><b>{m.kind}</b><span>{itemsText(m.rental.items)}</span></div></li>)}</ul>
            )}
          </Card>
          <Card title="Obras activas" action={<a className="more" href="#/app/obras">Ver obras</a>}>
            {sites.length === 0 ? <p className="muted">Tus obras aparecerán al hacer la primera solicitud.</p> : (
              <ul className="site-list">
                {sites.map((x) => {
                  const rs = rentals.filter((r) => r.siteId === x.id && r.status !== 'finalizada');
                  return <li key={x.id}><b>{x.name}</b><span>{rs.reduce((a, r) => a + r.items.reduce((b, it) => b + it.qty, 0), 0)} máquinas</span></li>;
                })}
              </ul>
            )}
          </Card>
          <Card title="Maquinaria habitual" action={<a className="more" href="#/app/favoritos">Gestionar</a>}>
            {favs.length === 0 ? <p className="muted">Guarda las máquinas que más alquilas para repetir en segundos.</p> : (
              <div className="fav-chips">{favs.map((f) => <button key={f.id} onClick={() => repeat(f.item)}><FamilyIcon id={f.item.family} size={16} /> {itemLabel(f.item)}</button>)}</div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

/* ---------- Solicitudes ---------- */
function Requests({ requests }) {
  const [filter, setFilter] = useState('todas');
  const list = requests.filter((r) => filter === 'todas' || (filter === 'abiertas' ? ['buscando', 'ofertas'].includes(r.status) : r.status === filter));
  return (
    <>
      <PageHead title="Solicitudes" sub="Cada solicitud llega a todos los proveedores compatibles con tu obra." />
      <div className="filters">{[['todas', 'Todas'], ['abiertas', 'Abiertas'], ['aceptada', 'Aceptadas'], ['cancelada', 'Canceladas']].map(([k, l]) => <button key={k} aria-pressed={filter === k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>)}</div>
      {list.length === 0 ? <Empty action={<NewBtn />}>No hay solicitudes en esta vista.</Empty> : (
        <div className="list">
          {list.map((r) => (
            <a key={r.id} className="row-card" href={`#/app/solicitud/${r.id}`}>
              <div><span className="code">{r.id}</span><b>{itemsText(r.items)}</b><span>{r.municipio} · desde {fmtDay(r.start)} · {r.days} días</span></div>
              <div className="row-right"><Status value={r.status} /><span>{r.offers.length} de {r.contacted.length} proveedores han respondido</span></div>
              <ArrowRight size={18} />
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function RequestDetail({ s, id, requests }) {
  const req = requests.find((r) => r.id === id);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => { if (req) actions.markViewed(req.id); }, [req?.id, req?.offers.length]);
  if (!req) return <Empty action={<a className="btn btn-ghost" href="#/app/solicitudes">Volver a solicitudes</a>}>No encontramos esa solicitud.</Empty>;

  const ranked = rankOffers(req, s);
  const top = showAll ? ranked : ranked.slice(0, TOP_OFFERS);
  const waiting = req.contacted.filter((c) => !c.responded);
  const noStock = req.offers.filter((o) => o.available === 'no');
  const open = ['buscando', 'ofertas'].includes(req.status);
  const best = (fn) => (top.length ? top.reduce((a, b) => (fn(b) < fn(a) ? b : a)).providerId : null);
  const tags = { [best((o) => o.total)]: 'Mejor precio', [best((o) => o.deliveryDate + String(o.total).padStart(7, '0'))]: 'Entrega más rápida', [best((o) => -o.rating)]: 'Mejor valorado' };
  const tagOf = (o, i) => (i === 0 && !showAll ? 'Recomendada' : tags[o.providerId]);
  const maxTotal = Math.max(1, ...top.map((o) => o.total));
  const rental = s.rentals.find((r) => r.requestId === req.id);
  const accept = (o) => go(`/app/alquiler/${actions.acceptOffer(req.id, o.providerId)}`);
  const cmpRows = [
    ['Disponibilidad', (o) => (o.available === 'si' ? <Badge tone="ok">Confirmada</Badge> : <Badge tone="warn">Con retraso</Badge>)],
    ['Entrega', (o) => fmtDay(o.deliveryDate)],
    ['Alquiler', (o) => eur(o.price)],
    ['Transporte', (o) => (o.transport ? `${eur(o.transport)} · ${o.km} km` : 'Incluido')],
    ['Total', (o) => eur(o.total), true],
    ['Fianza', (o) => eur(o.deposit)],
    ['Servicio técnico', (o) => `Respuesta en ${o.assistanceH} h`],
    ['Forma de pago', (o) => o.payment],
    ['Valoración', (o) => <><Stars value={o.rating} /> {o.rating.toFixed(1).replace('.', ',')}</>],
    ['Puntuación', (o) => `${o.score}/100`, true],
  ];

  return (
    <>
      <a className="back" href="#/app/solicitudes"><ArrowLeft size={15} /> Solicitudes</a>
      <PageHead title={itemsText(req.items)} sub={`${req.id} · ${req.municipio} (${req.province}) · ${fmtDate(req.start)} – ${fmtDate(req.end)} · ${req.days} días${req.indefinite ? ' (abierto)' : ''} · ${req.delivery}${req.urgent ? ' · URGENTE' : ''}`}>
        <Status value={req.status} />
      </PageHead>
      {req.status !== 'cancelada' && <Stepline stages={STAGES} current={stageIndex(req, rental)} />}

      <section className="card progress-card">
        <div className="progress-top" role="status">
          {waiting.some((c) => c.auto) && s.settings.autoRespond && open ? <Loader size={18} className="spin" /> : <Check size={18} />}
          <b>{req.contacted.length} proveedores contactados, {req.offers.length} respuestas</b>
          <span>{ranked.length} con disponibilidad{noStock.length ? `, ${noStock.length} sin máquina libre` : ''}{waiting.length ? `, ${waiting.length} pendientes` : ''}</span>
        </div>
        <div className="provider-dots">
          {req.contacted.map((c) => {
            const o = req.offers.find((x) => x.providerId === c.providerId);
            return <span key={c.providerId} className={!o ? 'wait' : o.available === 'no' ? 'no' : 'yes'}>{providerById(c.providerId, s).name}</span>;
          })}
        </div>
      </section>

      {rental && <div className="notice ok">Oferta aceptada: {providerById(rental.providerId, s).name}, {eur(rental.total)}. <a href={`#/app/alquiler/${rental.id}`}>Ver el alquiler {rental.id}</a></div>}
      {ranked.length === 0 && open && <Empty>Estamos esperando las primeras respuestas. Suelen llegar en pocos minutos; en esta demo, en unos segundos.</Empty>}

      {ranked.length > 0 && (
        <>
          <Card title={showAll ? `Las ${ranked.length} ofertas con disponibilidad` : `Las ${Math.min(TOP_OFFERS, ranked.length)} mejores ofertas`} action={<div className="legend"><i className="sw sw-a" /> Alquiler <i className="sw sw-b" /> Transporte</div>}>
            <div className="cmp-chart" role="img" aria-label={`Coste total por oferta: ${top.map((o) => `${o.provider.name} ${eur(o.total)}, ${o.score} puntos`).join('; ')}`}>
              {top.map((o, i) => (
                <div className="cmp-row" key={o.providerId} style={{ '--d': `${i * 90}ms` }}>
                  <span className="cmp-name">{i === 0 && !showAll && <Trophy size={14} />} {o.provider.name}</span>
                  <div className="cmp-track">
                    <div className="cmp-a" style={{ width: `${(o.price / maxTotal) * 100}%` }} title={`Alquiler ${eur(o.price)}`} />
                    <div className="cmp-b" style={{ width: `${(o.transport / maxTotal) * 100}%` }} title={`Transporte ${eur(o.transport)}`} />
                    <span className="cmp-total">{eur(o.total)}</span>
                  </div>
                  <span className="cmp-score" title="Puntuación global sobre 100"><b>{o.score}</b>/100</span>
                </div>
              ))}
            </div>
            <p className="hint">Puntuación: {Object.keys(SCORE_WEIGHTS).map((k) => `${SCORE_LABELS[k].toLowerCase()} ${SCORE_WEIGHTS[k]} %`).join(', ')}. La recomendada no siempre es la más barata.</p>
          </Card>

          <section className="card table-card cmp-desktop">
            <div className="table-scroll">
              <table className="cmp-table">
                <thead>
                  <tr>
                    <th scope="col"><span className="sr-only">Concepto</span></th>
                    {top.map((o, i) => (
                      <th key={o.providerId} scope="col" className={i === 0 && !showAll ? 'best' : ''}>
                        {tagOf(o, i) && <Badge tone={i === 0 && !showAll ? 'ok' : 'info'}>{tagOf(o, i)}</Badge>}
                        <b>{o.provider.name}</b><small>{o.provider.scope} · {o.provider.city}</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cmpRows.map(([label, cell, strong]) => <Row key={label} label={label} strong={strong} top={top} cell={cell} />)}
                  {open && <Row label="" top={top} cell={(o) => <button className="btn btn-primary btn-sm" onClick={() => accept(o)}>Aceptar oferta</button>} />}
                </tbody>
              </table>
            </div>
          </section>

          <div className="offer-cards">
            {top.map((o, i) => (
              <article key={o.providerId} className={`card offer-card ${i === 0 && !showAll ? 'best' : ''}`}>
                <header>
                  <div>{tagOf(o, i) && <Badge tone={i === 0 && !showAll ? 'ok' : 'info'}>{tagOf(o, i)}</Badge>}<h3>{o.provider.name}</h3><small>{o.provider.scope} · {o.provider.city}</small></div>
                  <div className="offer-total"><b>{eur(o.total)}</b><span>{o.score}/100</span></div>
                </header>
                <dl>{cmpRows.filter(([label]) => !['Total', 'Puntuación'].includes(label)).map(([label, cell]) => <div key={label}><dt>{label}</dt><dd>{cell(o)}</dd></div>)}</dl>
                {open && <button className="btn btn-primary" onClick={() => accept(o)}>Aceptar oferta</button>}
              </article>
            ))}
          </div>

          <div className="cmp-foot">
            {ranked.length > TOP_OFFERS && <button className="btn btn-ghost" onClick={() => setShowAll(!showAll)}>{showAll ? 'Ver solo las 5 mejores' : `Ver las ${ranked.length} ofertas`}</button>}
            {open && <button className="btn btn-ghost danger" onClick={() => { actions.cancelRequest(req.id); go('/app/solicitudes'); }}>Cancelar solicitud</button>}
            <span className="contact-inline">¿Dudas? <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}><Phone size={14} /> Llamar</a> <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={14} /> WhatsApp</a> <a href={`mailto:${CONTACT.email}?subject=${req.id}`}><Mail size={14} /> Email</a></span>
          </div>
        </>
      )}
    </>
  );
}

function Row({ label, top, cell, strong }) {
  return (
    <tr className={strong ? 'strong' : ''}>
      <th scope="row">{label || <span className="sr-only">Acción</span>}</th>
      {top.map((o) => <td key={o.providerId}>{cell(o)}</td>)}
    </tr>
  );
}

/* ---------- Ofertas (todas las recibidas en solicitudes abiertas) ---------- */
function Offers({ s, requests }) {
  const open = requests.filter((r) => r.status === 'ofertas');
  const rows = open.flatMap((r) => rankOffers(r, s).map((o, i) => ({ r, o, i })));
  return (
    <>
      <PageHead title="Ofertas" sub="Todas las ofertas vivas de tus solicitudes abiertas, ordenadas por puntuación." />
      <Table head={['Solicitud', 'Maquinaria', 'Proveedor', 'Entrega', { num: 'Alquiler' }, { num: 'Transporte' }, { num: 'Total' }, { num: 'Puntuación' }, '']} empty="No tienes ofertas pendientes de decidir.">
        {rows.map(({ r, o, i }) => (
          <tr key={r.id + o.providerId}>
            <td className="code">{r.id}</td><td>{itemsText(r.items)}</td>
            <td><b>{o.provider.name}</b>{i === 0 && <> <Badge tone="ok">Recomendada</Badge></>}</td>
            <td>{fmtDay(o.deliveryDate)}</td><td className="num">{eur(o.price)}</td><td className="num">{o.transport ? eur(o.transport) : 'Incluido'}</td>
            <td className="num"><b>{eur(o.total)}</b></td><td className="num">{o.score}/100</td>
            <td><a className="btn btn-ghost btn-sm" href={`#/app/solicitud/${r.id}`}>Comparar</a></td>
          </tr>
        ))}
      </Table>
    </>
  );
}

/* ---------- Alquileres ---------- */
const INCIDENT_TYPES = ['No arranca', 'Fallo hidráulico', 'Avería eléctrica', 'Daños', 'Consulta', 'Otro'];

function Rentals({ s, rentals }) {
  const [filter, setFilter] = useState('activos');
  const list = rentals.filter((r) => (filter === 'todos' ? true : filter === 'activos' ? r.status !== 'finalizada' : r.status === 'finalizada'));
  return (
    <>
      <PageHead title="Alquileres" sub="Máquinas contratadas, con sus bajas, averías y documentación." />
      <div className="filters">{[['activos', 'En curso'], ['finalizados', 'Finalizados'], ['todos', 'Todos']].map(([k, l]) => <button key={k} aria-pressed={filter === k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>)}</div>
      {list.length === 0 ? <Empty action={<NewBtn />}>Cuando aceptes una oferta, el alquiler aparecerá aquí.</Empty> : (
        <div className="list">
          {list.map((r) => (
            <a key={r.id} className="row-card" href={`#/app/alquiler/${r.id}`}>
              <div><span className="code">{r.id}</span><b>{itemsText(r.items)}</b><span>{providerById(r.providerId, s).name} · {s.sites.find((x) => x.id === r.siteId)?.name || r.municipio} · {fmtDay(r.start)} – {fmtDay(r.end)}</span></div>
              <div className="row-right"><Status value={r.status} /><b>{eur(r.total)}</b></div>
              <ArrowRight size={18} />
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function RentalDetail({ s, me, id, rentals }) {
  const r = rentals.find((x) => x.id === id);
  const [panel, setPanel] = useState(null);
  const [form, setForm] = useState({});
  const [machine, setMachine] = useState(null);
  if (!r) return <Empty action={<a className="btn btn-ghost" href="#/app/alquileres">Volver a alquileres</a>}>No encontramos ese alquiler.</Empty>;
  const p = providerById(r.providerId, s);
  const req = s.requests.find((x) => x.id === r.requestId);
  const incs = s.incidents.filter((i) => i.rentalId === r.id);
  const machines = s.machines.filter((m) => r.machineIds.includes(m.id));
  const active = ['reservada', 'en alquiler'].includes(r.status);
  const invoice = invoicesOf(s, (x) => x.id === r.id)[0];
  const openPanel = (kind) => { setPanel(kind); setForm(kind === 'baja' ? { date: addDays(todayISO(), 1) } : { type: INCIDENT_TYPES[0], desc: '', urgent: false }); };
  const repeat = () => { setDraft({ items: r.items, siteId: r.siteId, municipio: r.municipio, province: r.province, days: r.days, step: 2 }); go('/app/nueva'); };
  const isFav = (it) => s.favorites.some((f) => f.clientId === me.id && f.item.family === it.family && f.item.type === it.type && JSON.stringify(f.item.specs) === JSON.stringify(it.specs));

  return (
    <>
      <a className="back" href="#/app/alquileres"><ArrowLeft size={15} /> Alquileres</a>
      <PageHead title={itemsText(r.items)} sub={`${r.id} · ${p.name} · ${s.sites.find((x) => x.id === r.siteId)?.name || r.municipio}`}><Status value={r.status} /></PageHead>
      <Stepline stages={STAGES} current={stageIndex(req, r)} />

      <div className="grid-main">
        <div>
          <Card title="Qué puedes hacer">
            <div className="rental-actions">
              {active && <button className="btn btn-ghost" onClick={() => openPanel('averia')}><Wrench size={16} /> Avisar avería</button>}
              {active && <button className="btn btn-ghost" onClick={() => openPanel('baja')}><LogOut size={16} /> Dar de baja la máquina</button>}
              <button className="btn btn-ghost" onClick={repeat}><Repeat size={16} /> Repetir alquiler</button>
              {r.items.map((it, i) => <button key={i} className="btn btn-ghost" onClick={() => actions.toggleFavorite(me.id, it)}><Star size={16} fill={isFav(it) ? 'currentColor' : 'none'} /> {isFav(it) ? 'En habituales' : 'Guardar como habitual'}</button>)}
            </div>
            {r.status === 'baja solicitada' && <div className="notice warn">Baja pedida para el {fmtDate(r.bajaDate)}. El proveedor confirmará la recogida.</div>}
            {panel === 'baja' && (
              <form className="inline-form" onSubmit={(e) => { e.preventDefault(); actions.requestBaja(r.id, form.date); setPanel(null); }}>
                <Field label="Fecha de recogida"><input type="date" min={todayISO()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
                <button className="btn btn-primary">Confirmar baja</button>
                <button type="button" className="btn btn-ghost" onClick={() => setPanel(null)}>Cancelar</button>
              </form>
            )}
            {panel === 'averia' && (
              <form className="inline-form" onSubmit={(e) => { e.preventDefault(); actions.openIncident(r.id, form); setPanel(null); }}>
                <Field label="¿Qué ocurre?"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{INCIDENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
                <Field label="Descripción" wide><input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Describe el problema" /></Field>
                <label className="check"><input type="checkbox" checked={form.urgent} onChange={(e) => setForm({ ...form, urgent: e.target.checked })} /> Urgente: máquina parada</label>
                <button className="btn btn-primary">Enviar aviso</button>
                <button type="button" className="btn btn-ghost" onClick={() => setPanel(null)}>Cancelar</button>
              </form>
            )}
            {r.status === 'finalizada' && (
              <div className="review-box">{r.review ? <>Tu valoración de {p.name}: <Stars value={r.review} size={18} /></> : <>¿Qué tal con {p.name}? <Stars value={0} size={22} onChange={(n) => actions.reviewRental(r.id, n)} /></>}</div>
            )}
          </Card>

          <Card title="Máquinas y pasaporte digital">
            <div className="mini-list">
              {machines.map((m) => (
                <button key={m.id} onClick={() => setMachine(m)}>
                  <div><b>{m.brand} · {m.type}{m.size ? `, ${m.size}` : ''}</b><span>{m.id} · documentación {docsPct(m)} % completa</span></div>
                  <FileCheck2 size={16} /><em>Ver pasaporte</em>
                </button>
              ))}
            </div>
          </Card>

          {incs.length > 0 && (
            <Card title="Averías e incidencias">
              {incs.map((i) => <div key={i.id} className="alert-row"><Wrench size={16} /><span><b>{i.type}</b> · {i.id}{i.desc ? ` · ${i.desc}` : ''}</span><Status value={i.status} /></div>)}
            </Card>
          )}
        </div>

        <div>
          <Card title="Condiciones">
            <dl className="specs one">
              <div><dt>Periodo</dt><dd>{fmtDate(r.start)} – {fmtDate(r.end)}{r.indefinite && active ? ' (abierto)' : ''}</dd></div>
              <div><dt>Alquiler</dt><dd>{eur(r.price)}</dd></div>
              <div><dt>Transporte</dt><dd>{r.transport ? eur(r.transport) : 'Incluido'}</dd></div>
              <div><dt>Total sin IVA</dt><dd><b>{eur(r.total)}</b></dd></div>
              <div><dt>Fianza</dt><dd>{eur(r.deposit)}</dd></div>
              <div><dt>Forma de pago</dt><dd>{r.payment}</dd></div>
              <div><dt>Ahorro frente a la media</dt><dd>{eur(r.saving)}</dd></div>
            </dl>
          </Card>
          <Card title="Proveedor">
            <p><b>{p.name}</b></p>
            <p className="muted">{p.scope} · {p.city} · servicio técnico en {p.assistanceH} h</p>
            <p className="muted">Las gestiones con el proveedor las canaliza MAQNOW.</p>
          </Card>
          {invoice && <Card title="Factura"><p><b>{invoice.id}</b> · {eur(invoice.total)} con IVA</p><p className="muted">Vence el {fmtDate(invoice.due)}</p><Status value={invoice.status} /></Card>}
        </div>
      </div>
      {machine && <PassportModal machine={s.machines.find((m) => m.id === machine.id)} s={s} onClose={() => setMachine(null)} />}
    </>
  );
}

/* ---------- Obras ---------- */
function Sites({ s, me, sites, rentals, requests }) {
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: '', municipio: '', province: 'Málaga' });
  const add = (e) => { e.preventDefault(); if (!f.name.trim() || !f.municipio.trim()) return; actions.addSite(me.id, f); setAdding(false); setF({ name: '', municipio: '', province: 'Málaga' }); };
  const ask = (x) => { setDraft({ siteId: x.id, municipio: x.municipio, province: x.province }); go('/app/nueva'); };
  return (
    <>
      <PageHead title="Obras" sub="Tu central de compras: qué hay contratado y cuánto cuesta cada obra.">
        <button className="btn btn-primary" onClick={() => setAdding(!adding)}><Plus size={16} /> Añadir obra</button>
      </PageHead>
      {adding && (
        <form className="card inline-form flat" onSubmit={add}>
          <Field label="Nombre de la obra"><input autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Municipio"><input value={f.municipio} onChange={(e) => setF({ ...f, municipio: e.target.value })} /></Field>
          <Field label="Provincia"><select value={f.province} onChange={(e) => setF({ ...f, province: e.target.value })}>{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select></Field>
          <button className="btn btn-primary">Guardar</button>
        </form>
      )}
      {sites.length === 0 ? <Empty>Aún no tienes obras. Añade una o haz tu primera solicitud.</Empty> : (
        <div className="site-grid">
          {sites.map((x) => {
            const rs = rentals.filter((r) => r.siteId === x.id);
            const live = rs.filter((r) => r.status !== 'finalizada');
            const open = requests.filter((r) => r.siteId === x.id && ['buscando', 'ofertas'].includes(r.status)).length;
            return (
              <article key={x.id} className="card site">
                <header><div><h2>{x.name}</h2><span>{x.municipio} ({x.province})</span></div>{live.length > 0 ? <Badge tone="ok">Activa</Badge> : <Badge>Sin máquinas</Badge>}</header>
                <dl>
                  <div><dt>Máquinas en obra</dt><dd>{live.reduce((a, r) => a + r.items.reduce((b, it) => b + it.qty, 0), 0)}</dd></div>
                  <div><dt>Solicitudes abiertas</dt><dd>{open}</dd></div>
                  <div><dt>Gasto acumulado</dt><dd>{eur(rs.reduce((a, r) => a + r.total, 0))}</dd></div>
                </dl>
                {live.map((r) => <a key={r.id} className="site-rental" href={`#/app/alquiler/${r.id}`}>{itemsText(r.items)} <em>hasta {fmtDay(r.end)}</em></a>)}
                <button className="btn btn-ghost btn-sm" onClick={() => ask(x)}>Pedir maquinaria para esta obra</button>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ---------- Entregas y recogidas ---------- */
function Deliveries({ s, me }) {
  const moves = movements(s, (r) => r.clientId === me.id);
  return (
    <>
      <PageHead title="Entregas y recogidas" sub="Lo que llega y lo que sale de tus obras." />
      {moves.length === 0 ? <Empty>No hay entregas ni recogidas previstas.</Empty> : (
        <div className="timeline">
          {moves.map((m, i) => (
            <a key={i} className={`tl ${m.kind === 'Entrega' ? 'in' : 'out'}`} href={`#/app/alquiler/${m.rental.id}`}>
              <time><b>{fmtDay(m.date)}</b><span>{m.date < todayISO() ? 'Atrasada' : m.date === todayISO() ? 'Hoy' : ''}</span></time>
              <div><Badge tone={m.kind === 'Entrega' ? 'info' : 'warn'}>{m.kind}</Badge><b>{itemsText(m.rental.items)}</b><span>{providerById(m.rental.providerId, s).name} · {s.sites.find((x) => x.id === m.rental.siteId)?.name || m.rental.municipio}</span></div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- Averías ---------- */
function Incidents({ s, rentals }) {
  const list = s.incidents.filter((i) => rentals.some((r) => r.id === i.rentalId));
  return (
    <>
      <PageHead title="Averías" sub="Para avisar de una avería, entra en el alquiler de la máquina afectada."><a className="btn btn-primary" href="#/app/alquileres"><Wrench size={16} /> Avisar avería</a></PageHead>
      <Table head={['Aviso', 'Alquiler', 'Máquina', 'Tipo', 'Descripción', 'Abierta', 'Estado']} empty="No has registrado ninguna avería.">
        {list.map((i) => {
          const r = rentals.find((x) => x.id === i.rentalId);
          return (
            <tr key={i.id}>
              <td className="code">{i.id}</td><td><a href={`#/app/alquiler/${r.id}`}>{r.id}</a></td><td>{itemsText(r.items)}</td>
              <td>{i.type}{i.urgent && <> <Badge tone="bad">Urgente</Badge></>}</td><td>{i.desc || '—'}</td>
              <td>{new Date(i.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</td><td><Status value={i.status} /></td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}

/* ---------- Documentación ---------- */
function Documents({ s, rentals }) {
  const [machine, setMachine] = useState(null);
  const rows = rentals.flatMap((r) => r.machineIds.map((mid) => ({ r, m: s.machines.find((x) => x.id === mid) }))).filter((x) => x.m);
  return (
    <>
      <PageHead title="Documentación" sub="El pasaporte digital de cada máquina que has alquilado, listo para tu coordinador de seguridad." />
      <Table head={['Máquina', 'Identificador', 'Alquiler', 'Proveedor', 'Estado del alquiler', 'Documentación', '']} empty="Aquí verás la documentación de las máquinas que alquiles.">
        {rows.map(({ r, m }) => (
          <tr key={r.id + m.id}>
            <td><b>{m.brand} · {m.type}</b><small>{m.size}</small></td><td className="code">{m.id}</td><td><a href={`#/app/alquiler/${r.id}`}>{r.id}</a></td>
            <td>{providerById(r.providerId, s).name}</td><td><Status value={r.status} /></td>
            <td><div className={`index ${docsPct(m) < 100 ? 'warn' : ''}`}><i style={{ width: `${docsPct(m)}%` }} /><span>{docsPct(m)} %</span></div></td>
            <td><button className="btn btn-ghost btn-sm" onClick={() => setMachine(m)}>Ver pasaporte</button></td>
          </tr>
        ))}
      </Table>
      {machine && <PassportModal machine={machine} s={s} onClose={() => setMachine(null)} />}
    </>
  );
}

/* ---------- Facturas ---------- */
function Invoices({ s, me }) {
  const list = invoicesOf(s, (r) => r.clientId === me.id);
  const pending = list.filter((i) => i.status !== 'pagada');
  return (
    <>
      <PageHead title="Facturas" sub="Una factura por alquiler, emitida al inicio del periodo." />
      <div className="kpis three">
        <Kpi label="Facturado" value={eur(list.reduce((a, i) => a + i.total, 0))} hint={`${list.length} facturas, IVA incluido`} />
        <Kpi label="Pendiente de pago" value={eur(pending.reduce((a, i) => a + i.total, 0))} />
        <Kpi label="Vencido" value={eur(list.filter((i) => i.status === 'vencida').reduce((a, i) => a + i.total, 0))} tone={list.some((i) => i.status === 'vencida') ? 'bad' : ''} />
      </div>
      <Table head={['Factura', 'Alquiler', 'Proveedor', 'Fecha', 'Vencimiento', { num: 'Base' }, { num: 'IVA' }, { num: 'Total' }, 'Estado']} empty="Todavía no hay facturas.">
        {list.map((i) => (
          <tr key={i.id}>
            <td className="code">{i.id}</td><td><a href={`#/app/alquiler/${i.rentalId}`}>{i.rentalId}</a></td><td>{providerById(i.providerId, s).name}</td>
            <td>{fmtDate(i.date)}</td><td>{fmtDate(i.due)}</td><td className="num">{eur(i.base)}</td><td className="num">{eur(i.iva)}</td><td className="num"><b>{eur(i.total)}</b></td><td><Status value={i.status} /></td>
          </tr>
        ))}
      </Table>
    </>
  );
}

/* ---------- Maquinaria habitual ---------- */
function Favorites({ s, me }) {
  const favs = s.favorites.filter((f) => f.clientId === me.id);
  const repeat = (item) => { setDraft({ items: [item], step: 2 }); go('/app/nueva'); };
  return (
    <>
      <PageHead title="Maquinaria habitual" sub="Las máquinas que más alquilas, para pedir ofertas sin volver a configurarlas." />
      {favs.length === 0 ? <Empty>Guarda una máquina como habitual desde cualquiera de tus alquileres.</Empty> : (
        <div className="fav-grid">
          {favs.map((f) => (
            <article key={f.id} className="card fav">
              <FamilyIcon id={f.item.family} size={30} />
              <h2>{itemLabel(f.item)}</h2>
              <span>{familyById(f.item.family).name}</span>
              <div><button className="btn btn-primary btn-sm" onClick={() => repeat(f.item)}><Repeat size={14} /> Pedir ofertas</button><button className="btn btn-ghost btn-sm" onClick={() => actions.toggleFavorite(me.id, f.item)}>Quitar</button></div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- Informes ---------- */
function Reports({ s, rentals, requests }) {
  const total = rentals.reduce((a, r) => a + r.total, 0);
  const saving = rentals.reduce((a, r) => a + r.saving, 0);
  const group = (keyOf, share) => {
    const o = {};
    rentals.forEach((r) => (share ? r.items.forEach((it) => { const k = keyOf(r, it); o[k] = (o[k] || 0) + r.total / r.items.length; }) : (o[keyOf(r)] = (o[keyOf(r)] || 0) + r.total)));
    return Object.entries(o).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  };
  const exportCSV = () => downloadCSV('maqnow-alquileres.csv', [
    ['Alquiler', 'Solicitud', 'Obra', 'Maquinaria', 'Proveedor', 'Municipio', 'Inicio', 'Fin', 'Días', 'Alquiler €', 'Transporte €', 'Total €', 'Ahorro €', 'Estado'],
    ...rentals.map((r) => [r.id, r.requestId, s.sites.find((x) => x.id === r.siteId)?.name || '', itemsText(r.items), providerById(r.providerId, s).name, r.municipio, r.start, r.end, r.days, r.price, r.transport, r.total, r.saving, r.status]),
  ]);
  if (!rentals.length) return <><PageHead title="Informes" /><Empty>Los informes se rellenan con tus alquileres.</Empty></>;
  return (
    <>
      <PageHead title="Informes" sub="Toda tu información de alquiler, guardada y lista para exportar.">
        <button className="btn btn-ghost" onClick={exportCSV}><Download size={16} /> Descargar en Excel (CSV)</button>
      </PageHead>
      <div className="kpis">
        <Kpi label="Gasto total" value={eur(total)} hint={`${rentals.length} alquileres`} />
        <Kpi label="Ahorro conseguido" value={eur(saving)} hint="frente a la media de ofertas" tone="accent" />
        <Kpi label="Precio medio por alquiler" value={eur(total / rentals.length)} />
        <Kpi label="Ofertas recibidas" value={requests.reduce((a, r) => a + r.offers.length, 0)} hint={`en ${requests.length} solicitudes`} />
      </div>
      <div className="grid-2">
        <Card title="Gasto por mes"><Columns rows={spendByMonth(rentals).map((m) => ({ label: monthLabel(m.key), value: m.value }))} format={eur} /></Card>
        <Card title="Gasto por obra"><Bars rows={group((r) => s.sites.find((x) => x.id === r.siteId)?.name || r.municipio)} format={eur} /></Card>
        <Card title="Gasto por tipo de maquinaria"><Bars rows={group((r, it) => familyById(it.family).name, true)} format={eur} /></Card>
        <Card title="Gasto por proveedor"><Bars rows={group((r) => providerById(r.providerId, s).name)} format={eur} /></Card>
      </div>
    </>
  );
}

/* ---------- Mi empresa ---------- */
function Company({ me, s }) {
  const [f, setF] = useState(me);
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setSaved(false); };
  return (
    <>
      <PageHead title="Mi empresa" sub={s.session.guest ? 'Estás viendo una empresa de ejemplo como invitado.' : `Cuenta de ${s.session.email}`} />
      <form className="card" onSubmit={(e) => { e.preventDefault(); actions.saveClient(f); setSaved(true); }}>
        <div className="form-grid">
          <Field label="Razón social"><input value={f.name} onChange={set('name')} /></Field>
          <Field label="CIF"><input value={f.cif} onChange={set('cif')} /></Field>
          <Field label="Persona de contacto"><input value={f.contact} onChange={set('contact')} /></Field>
          <Field label="Teléfono"><input value={f.phone} onChange={set('phone')} /></Field>
          <Field label="Email"><input type="email" value={f.email} onChange={set('email')} /></Field>
          <Field label="Forma de pago"><select value={f.payment} onChange={set('payment')}>{PAYMENT_METHODS.map((p) => <option key={p}>{p}</option>)}</select></Field>
        </div>
        <div className="form-foot"><button className="btn btn-primary">Guardar cambios</button>{saved && <span className="ok-text"><Check size={15} /> Guardado</span>}</div>
      </form>
    </>
  );
}
