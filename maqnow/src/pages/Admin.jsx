import React, { useState } from 'react';
import { RotateCcw, ArrowLeft, ArrowRight, Send, Check, Clock, BellRing } from 'lucide-react';
import { PAYMENT_METHODS } from '../data/catalog';
import { actions, clientRisk, invoicesOf, itemsText, providerById, providerStats, rankOffers, spendByMonth, stageIndex, STAGES } from '../lib/store';
import { addDays, eur, fmtDate, fmtDay, fmtMin, monthLabel, todayISO } from '../lib/format';
import { Badge, Bars, Card, Columns, Empty, Field, Kpi, PageHead, Stars, Status, Stepline, Table, go } from '../components/ui';
import { parseRequest, slotsToItem } from '../components/Assistant';

export function AdminPages({ s, page, id }) {
  switch (page) {
    case 'agente': return <Agent s={s} />;
    case 'solicitudes': return <Requests s={s} />;
    case 'solicitud': return <RequestLog s={s} id={id} />;
    case 'clientes': return <Clients s={s} />;
    case 'proveedores': return <Providers s={s} />;
    case 'alquileres': return <Rentals s={s} />;
    case 'incidencias': return <Incidents s={s} />;
    case 'comisiones': return <Commissions s={s} />;
    case 'ajustes': return <Settings s={s} />;
    default: return <Dashboard s={s} />;
  }
}
const clientName = (s, id) => s.clients.find((c) => c.id === id)?.name || id;

/* ---------- Panel ---------- */
function Dashboard({ s }) {
  const [period, setPeriod] = useState(30);
  const since = period ? Date.now() - period * 864e5 : 0;
  const reqs = s.requests.filter((r) => r.createdAt >= since);
  const rentals = s.rentals.filter((r) => r.acceptedAt >= since || reqs.some((q) => q.id === r.requestId));
  const offers = reqs.reduce((a, r) => a + r.offers.length, 0);
  const openInc = s.incidents.filter((i) => i.status !== 'resuelta');
  const withOffer = reqs.filter((r) => r.offers.some((o) => o.available !== 'no'));
  const firstOffer = withOffer.map((r) => Math.min(...r.offers.map((o) => o.responseMin)));
  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const funnel = [
    ['Solicitudes', reqs.length],
    ['Buscando proveedor', reqs.filter((r) => r.status === 'buscando').length],
    ['Con ofertas', reqs.filter((r) => r.status === 'ofertas' && !r.viewedAt).length],
    ['Pendientes del cliente', reqs.filter((r) => r.status === 'ofertas' && r.viewedAt).length],
    ['Aceptadas', reqs.filter((r) => r.status === 'aceptada').length],
    ['En alquiler', s.rentals.filter((r) => ['en alquiler', 'baja solicitada'].includes(r.status)).length],
  ];
  return (
    <>
      <PageHead title="Panel de operaciones" sub="Lo que el gerente necesita ver al abrir el CRM.">
        <div className="filters tight">{[[1, 'Hoy'], [30, '30 días'], [0, 'Todo']].map(([d, l]) => <button key={d} className={period === d ? 'on' : ''} onClick={() => setPeriod(d)}>{l}</button>)}</div>
      </PageHead>
      <div className="kpis">
        <Kpi label="Solicitudes" value={reqs.length} href="/app/solicitudes" />
        <Kpi label="Pendientes" value={reqs.filter((r) => ['buscando', 'ofertas'].includes(r.status)).length} tone="accent" href="/app/solicitudes" />
        <Kpi label="Ofertas recibidas" value={offers} />
        <Kpi label="Operaciones cerradas" value={rentals.length} tone="ok" href="/app/alquileres" />
        <Kpi label="Volumen de alquiler" value={eur(rentals.reduce((a, r) => a + r.total, 0))} />
        <Kpi label="Comisiones" value={eur(rentals.reduce((a, r) => a + r.commission, 0))} href="/app/comisiones" />
        <Kpi label="Incidencias abiertas" value={openInc.length} tone={openInc.some((i) => i.urgent) ? 'bad' : ''} href="/app/incidencias" />
      </div>
      <div className="grid-2">
        <Card title="Operativa"><Bars rows={funnel.map(([label, value]) => ({ label, value }))} /></Card>
        <Card title="Volumen por mes"><Columns rows={spendByMonth(s.rentals).map((m) => ({ label: monthLabel(m.key), value: m.value }))} format={eur} /></Card>
        <Card title="Indicadores del piloto">
          <dl className="specs">
            <div><dt>Tiempo hasta la primera oferta</dt><dd>{fmtMin(avg(firstOffer))}</dd></div>
            <div><dt>Solicitudes con oferta</dt><dd>{reqs.length ? Math.round((withOffer.length / reqs.length) * 100) : 0} %</dd></div>
            <div><dt>Proveedores por solicitud</dt><dd>{avg(reqs.map((r) => r.contacted.length)).toFixed(1).replace('.', ',')}</dd></div>
            <div><dt>Aceptación</dt><dd>{reqs.length ? Math.round((reqs.filter((r) => r.status === 'aceptada').length / reqs.length) * 100) : 0} %</dd></div>
            <div><dt>Precio medio de alquiler</dt><dd>{eur(avg(rentals.map((r) => r.total)))}</dd></div>
            <div><dt>Comisión media</dt><dd>{eur(avg(rentals.map((r) => r.commission)))}</dd></div>
          </dl>
        </Card>
        <Card title="Requiere atención">
          <div className="mini-list">
            {openInc.map((i) => <a key={i.id} href="#/app/incidencias"><div><b>{i.type}</b><span>{i.id} · {i.rentalId}</span></div>{i.urgent && <Badge tone="bad">Urgente</Badge>}<Status value={i.status} /></a>)}
            {s.clients.map((c) => ({ c, k: clientRisk(s, c) })).filter((x) => x.k.level === 'Alto').map(({ c, k }) => <a key={c.id} href="#/app/clientes"><div><b>{c.name}</b><span>{k.reasons.join(', ')}</span></div><Badge tone="bad">Riesgo alto</Badge></a>)}
            {s.requests.filter((r) => r.status === 'buscando').map((r) => <a key={r.id} href={`#/app/solicitud/${r.id}`}><div><b>{itemsText(r.items)}</b><span>{r.id} sin ofertas todavía</span></div><Badge tone="warn">Reclamar</Badge></a>)}
          </div>
        </Card>
      </div>
    </>
  );
}

/* ---------- Agente comercial ---------- */
const AGENT_STEPS = ['Interpreta la petición', 'Consulta la base de datos', 'Selecciona proveedores', 'Envía solicitudes', 'Controla respuestas', 'Reclama a los que no responden', 'Compara ofertas', 'Genera la propuesta', 'Se la envía al cliente', 'Actualiza el CRM'];
function agentProgress(r) {
  if (r.status === 'aceptada') return 10;
  if (r.viewedAt) return 9;
  if (r.offers.length && r.contacted.every((c) => c.responded)) return 8;
  if (r.remindedAt) return 6;
  if (r.offers.length) return 5;
  return 4;
}

function Agent({ s }) {
  const [text, setText] = useState('');
  const [clientId, setClientId] = useState(s.clients[0].id);
  const [msg, setMsg] = useState('');
  const run = (e) => {
    e.preventDefault();
    const q = parseRequest(text);
    const missing = [!q.family && 'qué máquina', !q.municipio && 'el municipio'].filter(Boolean);
    if (missing.length) return setMsg(`No he podido identificar ${missing.join(' ni ')}. Prueba con: "plataforma articulada de 16 metros para mañana en Málaga, 7 días".`);
    const id = actions.createRequest(clientId, { items: [slotsToItem(q)], municipio: q.municipio, province: q.province, start: q.start || addDays(todayISO(), 1), days: q.days || 7, byAgent: true });
    return go(`/app/solicitud/${id}`);
  };
  const open = s.requests.filter((r) => ['buscando', 'ofertas'].includes(r.status));
  return (
    <>
      <PageHead title="Agente comercial" sub="Recibe una petición en lenguaje natural y hace el trabajo: busca, envía, reclama, compara y propone." />
      <Card title="Nueva petición en nombre de un cliente">
        <form className="agent-form" onSubmit={run}>
          <Field label="Cliente"><select value={clientId} onChange={(e) => setClientId(e.target.value)}>{s.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Petición" wide><input value={text} onChange={(e) => { setText(e.target.value); setMsg(''); }} placeholder="Busca una plataforma articulada eléctrica de 16 metros para mañana en Málaga" /></Field>
          <button className="btn btn-primary"><Send size={16} /> Lanzar</button>
        </form>
        {msg && <p className="error">{msg}</p>}
        <p className="hint">En esta demo el agente interpreta por palabras clave y las respuestas de proveedores son simuladas. Con un modelo de IA y envío real de email o WhatsApp, estos mismos pasos se ejecutan de verdad.</p>
      </Card>
      <Card title="Qué hace en cada solicitud">
        <ol className="agent-steps">{AGENT_STEPS.map((x) => <li key={x}>{x}</li>)}</ol>
      </Card>
      <Card title="Solicitudes en curso">
        {open.length === 0 ? <p className="muted">No hay solicitudes abiertas ahora mismo.</p> : (
          <div className="mini-list">
            {open.map((r) => {
              const n = agentProgress(r);
              return (
                <a key={r.id} href={`#/app/solicitud/${r.id}`}>
                  <div><b>{itemsText(r.items)}</b><span>{r.id} · {clientName(s, r.clientId)} · paso {n} de 10: {AGENT_STEPS[n - 1].toLowerCase()}</span></div>
                  <div className="index"><i style={{ width: `${n * 10}%` }} /><span>{n}/10</span></div><ArrowRight size={16} />
                </a>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}

/* ---------- Solicitudes ---------- */
function Requests({ s }) {
  const [view, setView] = useState('tablero');
  const cols = [
    ['Buscando proveedor', (r) => r.status === 'buscando'],
    ['Ofertas recibidas', (r) => r.status === 'ofertas' && !r.viewedAt],
    ['Pendiente del cliente', (r) => r.status === 'ofertas' && r.viewedAt],
    ['Aceptada', (r) => r.status === 'aceptada' && s.rentals.find((x) => x.requestId === r.id)?.status === 'reservada'],
    ['En alquiler', (r) => r.status === 'aceptada' && ['en alquiler', 'baja solicitada'].includes(s.rentals.find((x) => x.requestId === r.id)?.status)],
  ];
  return (
    <>
      <PageHead title="Solicitudes" sub="Cada solicitud, con los proveedores contactados y su oferta seleccionada.">
        <div className="filters tight">{[['tablero', 'Tablero'], ['lista', 'Lista']].map(([k, l]) => <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{l}</button>)}</div>
      </PageHead>
      {view === 'tablero' ? (
        <div className="board">
          {cols.map(([title, pred]) => {
            const list = s.requests.filter(pred);
            return (
              <section key={title}>
                <header>{title}<em>{list.length}</em></header>
                {list.map((r) => (
                  <a key={r.id} href={`#/app/solicitud/${r.id}`} className="board-card">
                    <span className="code">{r.id}{r.urgent ? ' · URGENTE' : ''}</span>
                    <b>{itemsText(r.items)}</b>
                    <span>{clientName(s, r.clientId)}</span>
                    <span>{r.municipio} · {fmtDay(r.start)} · {r.offers.length}/{r.contacted.length} respuestas</span>
                  </a>
                ))}
                {list.length === 0 && <p>Nada aquí</p>}
              </section>
            );
          })}
        </div>
      ) : (
        <Table head={['Solicitud', 'Cliente', 'Maquinaria', 'Obra', 'Inicio', { num: 'Contactados' }, { num: 'Ofertas' }, 'Proveedor elegido', 'Estado']}>
          {s.requests.map((r) => (
            <tr key={r.id}>
              <td className="code"><a href={`#/app/solicitud/${r.id}`}>{r.id}</a></td><td>{clientName(s, r.clientId)}</td><td>{itemsText(r.items)}</td><td>{r.municipio}</td><td>{fmtDay(r.start)}</td>
              <td className="num">{r.contacted.length}</td><td className="num">{r.offers.length}</td>
              <td>{r.acceptedProviderId ? providerById(r.acceptedProviderId, s).name : '—'}</td><td><Status value={r.status} /></td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}

function RequestLog({ s, id }) {
  const r = s.requests.find((x) => x.id === id);
  if (!r) return <Empty action={<a className="btn btn-ghost" href="#/app/solicitudes">Volver a solicitudes</a>}>No encontramos esa solicitud.</Empty>;
  const rental = s.rentals.find((x) => x.requestId === r.id);
  const ranked = rankOffers(r, s);
  const waiting = r.contacted.filter((c) => !c.responded);
  const at = (min) => new Date(r.createdAt + min * 60000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const log = [
    [0, `Solicitud recibida${r.byAgent ? ' por el agente' : ''} e interpretada: ${itemsText(r.items)}`],
    [0, `Base de datos consultada: ${r.contacted.length} proveedores compatibles en ${r.province}`],
    [1, `Petición enviada a ${r.contacted.length} proveedores`],
    ...[...r.offers].sort((a, b) => a.responseMin - b.responseMin).map((o) => [o.responseMin, `${providerById(o.providerId, s).name} responde: ${o.available === 'no' ? 'sin disponibilidad' : `${o.available === 'si' ? 'disponible' : 'disponible con retraso'}, ${eur(o.price + o.transport)}`}`]),
  ];
  const last = Math.max(1, ...r.offers.map((o) => o.responseMin));
  if (r.remindedAt) log.push([last + 5, `Recordatorio enviado a ${waiting.length || 'los'} proveedores sin respuesta`]);
  if (ranked.length) log.push([last + 1, `Comparativo generado. Recomendada: ${ranked[0].provider.name} (${ranked[0].score}/100)`]);
  if (r.viewedAt) log.push([last + 2, 'El cliente ha visto las ofertas']);
  if (rental) log.push([last + 3, `Oferta aceptada: ${providerById(rental.providerId, s).name}. Alquiler ${rental.id} creado, comisión prevista ${eur(rental.commission)}`]);

  return (
    <>
      <a className="back" href="#/app/solicitudes"><ArrowLeft size={15} /> Solicitudes</a>
      <PageHead title={itemsText(r.items)} sub={`${r.id} · ${clientName(s, r.clientId)} · ${r.municipio} (${r.province}) · ${fmtDate(r.start)} · ${r.days} días`}><Status value={r.status} /></PageHead>
      {r.status !== 'cancelada' && <Stepline stages={STAGES} current={stageIndex(r, rental)} />}
      <div className="grid-main">
        <div>
          <Card title="Registro del agente" action={waiting.length > 0 && ['buscando', 'ofertas'].includes(r.status) && <button className="btn btn-ghost btn-sm" onClick={() => actions.remind(r.id)}><BellRing size={14} /> Reclamar a {waiting.length}</button>}>
            <ol className="log">
              {log.map(([min, text], i) => <li key={i}><time>{at(min)}</time><i><Check size={11} /></i><span>{text}</span></li>)}
              {waiting.length > 0 && ['buscando', 'ofertas'].includes(r.status) && <li className="wait"><time>ahora</time><i><Clock size={11} /></i><span>Faltan {waiting.length} respuestas: {waiting.map((c) => providerById(c.providerId, s).name).join(', ')}</span></li>}
            </ol>
          </Card>
        </div>
        <div>
          <Card title="Ofertas">
            {ranked.length === 0 ? <p className="muted">Todavía no hay ofertas con disponibilidad.</p> : (
              <div className="mini-list">
                {ranked.map((o) => (
                  <div key={o.providerId} className={r.acceptedProviderId === o.providerId ? 'picked' : ''}>
                    <div><b>{o.provider.name}</b><span>{eur(o.total)} · comisión {eur(Math.round((o.price * o.provider.commission) / 100))}</span></div>
                    {r.acceptedProviderId === o.providerId && <Badge tone="ok">Elegida</Badge>}<em>{o.score}/100</em>
                  </div>
                ))}
              </div>
            )}
          </Card>
          {r.notes && <Card title="Notas del cliente"><p>{r.notes}</p></Card>}
        </div>
      </div>
    </>
  );
}

/* ---------- Clientes y riesgo ---------- */
function Clients({ s }) {
  const [editing, setEditing] = useState(null);
  return (
    <>
      <PageHead title="Clientes y riesgo" sub="El riesgo se calcula con el plazo medio de pago, las facturas vencidas, el consumo del límite de crédito y la forma de pago." />
      <Table head={['Cliente', 'Forma de pago', { num: 'Límite de crédito' }, { num: 'Riesgo vivo' }, 'Uso del límite', { num: 'Pago medio' }, { num: 'Vencido' }, { num: 'Volumen' }, 'Riesgo', '']}>
        {s.clients.map((c) => {
          const k = clientRisk(s, c);
          const ed = editing === c.id;
          return (
            <tr key={c.id}>
              <td><b>{c.name}</b><small>{[c.cif, c.contact, c.phone].filter(Boolean).join(' · ')}</small><small>{s.sites.filter((x) => x.clientId === c.id).length} obras · {k.rentals} alquileres</small></td>
              <td>{ed ? <select className="mini" value={c.payment} onChange={(e) => actions.saveClient({ id: c.id, payment: e.target.value })}>{PAYMENT_METHODS.map((p) => <option key={p}>{p}</option>)}</select> : c.payment}</td>
              <td className="num">{ed ? <input className="mini" type="number" step="500" min="0" value={c.creditLimit} onChange={(e) => actions.saveClient({ id: c.id, creditLimit: +e.target.value })} /> : eur(c.creditLimit)}</td>
              <td className="num">{eur(k.exposure)}</td>
              <td><div className={`index ${k.usage > 0.8 ? 'bad' : k.usage > 0.5 ? 'warn' : ''}`}><i style={{ width: `${Math.min(100, k.usage * 100)}%` }} /><span>{Math.round(k.usage * 100)} %</span></div></td>
              <td className="num">{c.avgPayDays} días</td><td className="num">{eur(k.overdue)}</td><td className="num">{eur(k.volume)}</td>
              <td><Status value={k.level} />{k.reasons.length > 0 && <small>{k.reasons.join(', ')}</small>}</td>
              <td><button className="btn btn-ghost btn-sm" onClick={() => setEditing(ed ? null : c.id)}>{ed ? 'Hecho' : 'Editar'}</button></td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}

/* ---------- Proveedores ---------- */
function Providers({ s }) {
  const [open, setOpen] = useState(null);
  const rows = s.providers.map((p) => ({ p, st: providerStats(s, p) })).sort((a, b) => b.st.index - a.st.index);
  return (
    <>
      <PageHead title="Proveedores" sub="Índice interno, no visible para el cliente: disponibilidad 30 %, precio 25 %, tiempo de respuesta 20 %, fiabilidad 15 %, incidencias 10 %. Decide a quién se contacta primero." />
      <Table head={[{ num: '#' }, 'Proveedor', 'Ámbito', 'Índice', 'Valoración', 'Respuesta media', { num: 'Respuestas' }, { num: 'Ganadas' }, { num: 'Incidencias' }, { num: 'Volumen' }, { num: 'Comisión' }]}>
        {rows.map(({ p, st }, i) => (
          <React.Fragment key={p.id}>
            <tr className="clickable" onClick={() => setOpen(open === p.id ? null : p.id)}>
              <td className="num">{i + 1}</td><td><b>{p.name}</b>{p.manual && <> <Badge tone="info">Registrado</Badge></>}</td><td>{p.scope} · {p.city}</td>
              <td><div className="index"><i style={{ width: `${st.index}%` }} /><span>{st.index}</span></div></td>
              <td><Stars value={st.rating} /> {st.rating.toFixed(1).replace('.', ',')}</td>
              <td>{fmtMin(st.avgResp)}</td><td className="num">{st.responded}/{st.contacted}</td><td className="num">{st.won}</td><td className="num">{st.incidents}</td>
              <td className="num">{eur(st.volume)}</td><td className="num">{eur(st.commission)} ({p.commission} %)</td>
            </tr>
            {open === p.id && (
              <tr className="detail"><td colSpan="11">
                <div className="detail-grid">
                  <div><b>Especialidades</b><p>{p.families.join(', ')}</p></div>
                  <div><b>Zona</b><p>{p.scope === 'Nacional' ? 'Toda España' : (p.provinces || []).join(', ')}</p></div>
                  <div><b>Flota registrada</b><p>{s.machines.filter((m) => m.providerId === p.id).length} máquinas</p></div>
                  <div><b>Condiciones</b><p>{p.payment} · servicio técnico en {p.assistanceH} h</p></div>
                  <div><b>Contacto</b><p>{[p.contactName, p.phone, p.email].filter(Boolean).join(' · ') || 'Sin datos de contacto todavía'}</p></div>
                  <div><b>Desglose del índice</b><p>{Object.entries(st.parts).map(([k, v]) => `${k} ${Math.round(v)}`).join(' · ')}</p></div>
                </div>
              </td></tr>
            )}
          </React.Fragment>
        ))}
      </Table>
    </>
  );
}

/* ---------- Alquileres ---------- */
function Rentals({ s }) {
  return (
    <>
      <PageHead title="Alquileres" sub="Todas las operaciones cerradas, con su proveedor y su margen." />
      <Table head={['Alquiler', 'Cliente', 'Proveedor', 'Maquinaria', 'Periodo', { num: 'Total cliente' }, { num: 'Comisión' }, 'Estado']} empty="Sin alquileres todavía.">
        {s.rentals.map((r) => (
          <tr key={r.id}>
            <td className="code">{r.id}</td><td>{clientName(s, r.clientId)}</td><td>{providerById(r.providerId, s).name}</td><td>{itemsText(r.items)}</td>
            <td>{fmtDay(r.start)} – {fmtDay(r.end)}</td><td className="num">{eur(r.total)}</td><td className="num">{eur(r.commission)}</td><td><Status value={r.status} /></td>
          </tr>
        ))}
      </Table>
    </>
  );
}

/* ---------- Incidencias ---------- */
function Incidents({ s }) {
  return (
    <>
      <PageHead title="Incidencias" sub="Nivel 1 consulta, nivel 2 incidencia, nivel 3 avería urgente. Se avisa al proveedor, a administración y al responsable." />
      <Table head={['Incidencia', 'Alquiler', 'Cliente', 'Proveedor', 'Tipo', 'Nivel', 'Descripción', 'Estado']} empty="No hay incidencias registradas.">
        {s.incidents.map((i) => {
          const r = s.rentals.find((x) => x.id === i.rentalId);
          return (
            <tr key={i.id}>
              <td className="code">{i.id}</td><td className="code">{i.rentalId}</td><td>{clientName(s, r.clientId)}</td><td>{providerById(r.providerId, s).name}</td>
              <td>{i.type}</td><td><Badge tone={i.level === 3 ? 'bad' : i.level === 2 ? 'warn' : 'neutral'}>{['', 'Consulta', 'Incidencia', 'Avería urgente'][i.level]}</Badge></td><td>{i.desc || '—'}</td>
              <td>
                <select className="mini" value={i.status} onChange={(e) => actions.setIncidentStatus(i.id, e.target.value)} aria-label="Estado de la incidencia">
                  <option value="abierta">Abierta</option><option value="en curso">En curso</option><option value="resuelta">Resuelta</option>
                </select>
              </td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}

/* ---------- Comisiones y cobros ---------- */
function Commissions({ s }) {
  const inv = invoicesOf(s);
  const total = s.rentals.reduce((a, r) => a + r.commission, 0);
  const pend = s.rentals.filter((r) => r.commissionStatus === 'pendiente').reduce((a, r) => a + r.commission, 0);
  return (
    <>
      <PageHead title="Comisiones y cobros" sub="La comisión se devenga al cerrar el alquiler y se liquida con el proveedor al finalizar." />
      <div className="kpis three">
        <Kpi label="Comisión generada" value={eur(total)} />
        <Kpi label="Pendiente de liquidar" value={eur(pend)} tone="accent" />
        <Kpi label="Facturas de clientes vencidas" value={eur(inv.filter((i) => i.status === 'vencida').reduce((a, i) => a + i.total, 0))} tone={inv.some((i) => i.status === 'vencida') ? 'bad' : ''} />
      </div>
      <Table head={['Alquiler', 'Proveedor', 'Cliente', { num: 'Precio proveedor' }, { num: 'Comisión' }, 'Liquidación', 'Cobro del cliente']}>
        {s.rentals.map((r) => {
          const i = inv.find((x) => x.rentalId === r.id);
          return (
            <tr key={r.id}>
              <td className="code">{r.id}</td><td>{providerById(r.providerId, s).name}</td><td>{clientName(s, r.clientId)}</td>
              <td className="num">{eur(r.price)}</td><td className="num">{eur(r.commission)} ({r.commissionPct} %)</td>
              <td>{r.commissionStatus === 'pendiente' && r.status === 'finalizada' ? <button className="btn btn-ghost btn-sm" onClick={() => actions.settleCommission(r.id)}>Marcar liquidada</button> : <Status value={r.commissionStatus} />}</td>
              <td>{!i ? '—' : i.status === 'pagada' ? <Status value="pagada" /> : <><Status value={i.status} /> <button className="btn btn-ghost btn-sm" onClick={() => actions.markPaid(r.id)}>Marcar cobrada</button></>}</td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}

/* ---------- Ajustes ---------- */
function Settings({ s }) {
  return (
    <>
      <PageHead title="Ajustes" sub="Opciones de la versión de demostración." />
      <Card title="Simulación">
        <label className="check"><input type="checkbox" checked={s.settings.autoRespond} onChange={(e) => actions.setAutoRespond(e.target.checked)} /> Simular las respuestas de los proveedores</label>
        <p className="hint">Desactívalo para probar el circuito a mano: crea una solicitud como cliente y contesta desde el portal de cada proveedor.</p>
      </Card>
      <Card title="Datos">
        <p className="muted">{s.requests.length} solicitudes, {s.rentals.length} alquileres, {s.clients.length} clientes, {s.providers.length} proveedores y {s.users.length} cuentas registradas en este navegador.</p>
        <button className="btn btn-ghost danger" onClick={() => { if (window.confirm('¿Restaurar los datos de demostración? Se borrará todo lo creado, incluidas las cuentas registradas.')) actions.resetDemo(); }}><RotateCcw size={15} /> Restaurar datos de demostración</button>
      </Card>
    </>
  );
}
