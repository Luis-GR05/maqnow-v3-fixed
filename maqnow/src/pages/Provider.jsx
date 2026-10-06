import React, { useState } from 'react';
import { Check, Plus, ArrowRight } from 'lucide-react';
import { FAMILIES, familyById, PAYMENT_METHODS, PROVINCES } from '../data/catalog';
import { actions, invoicesOf, itemsText, movements, providerById, providerStats, rankOffers, spendByMonth } from '../lib/store';
import { eur, fmtDate, fmtDay, fmtMin, monthKey, monthLabel, todayISO } from '../lib/format';
import { Badge, Card, Columns, Empty, Field, Kpi, PageHead, Stars, Status, Table } from '../components/ui';
import { PassportModal, docsPct } from '../components/Passport';

export function ProviderPages({ s, page }) {
  const pid = s.session.providerId;
  const p = providerById(pid, s);
  const mine = s.requests.filter((r) => r.contacted.some((c) => c.providerId === pid));
  const ctx = {
    s, p, pid, mine,
    openReqs: mine.filter((r) => ['buscando', 'ofertas'].includes(r.status)),
    rentals: s.rentals.filter((r) => r.providerId === pid),
    fleet: s.machines.filter((m) => m.providerId === pid),
    st: providerStats(s, p),
  };
  switch (page) {
    case 'solicitudes': return <Requests {...ctx} />;
    case 'ofertas': return <MyOffers {...ctx} />;
    case 'alquileres': return <Rentals {...ctx} />;
    case 'flota': return <Fleet key={pid} {...ctx} />;
    case 'entregas': return <Moves {...ctx} />;
    case 'incidencias': return <Incidents {...ctx} />;
    case 'facturacion': return <Billing {...ctx} />;
    case 'ficha': return <Profile key={pid} {...ctx} />;
    default: return <Dashboard {...ctx} />;
  }
}

function GuestProviderPicker({ s }) {
  if (!s.session.guest) return null;
  return (
    <Field label="Ver como proveedor (demo)">
      <select value={s.session.providerId} onChange={(e) => actions.setGuestProvider(e.target.value)}>
        {s.providers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
      </select>
    </Field>
  );
}

function Dashboard({ s, p, pid, openReqs, rentals, fleet, st }) {
  const pending = openReqs.filter((r) => !r.offers.some((o) => o.providerId === pid));
  const live = rentals.filter((r) => r.status !== 'finalizada');
  const rented = fleet.filter((m) => m.status === 'alquilada').length;
  const month = rentals.filter((r) => monthKey(r.start) === monthKey(todayISO())).reduce((a, r) => a + r.price, 0);
  const moves = movements(s, (r) => r.providerId === pid).slice(0, 5);
  return (
    <>
      <PageHead title={p.name} sub={`${p.scope} · ${p.city} · comisión MAQNOW ${p.commission} % solo sobre alquiler cerrado`}><GuestProviderPicker s={s} /></PageHead>
      {p.status === 'pendiente' && <div className="notice warn" role="status">Tu empresa está pendiente de homologación. Completa tu ficha y tu flota: en cuanto la revisemos empezarás a recibir solicitudes.</div>}
      <div className="kpis">
        <Kpi label="Solicitudes por responder" value={pending.length} tone={pending.length ? 'accent' : ''} href="/app/solicitudes" />
        <Kpi label="Alquileres en curso" value={live.length} href="/app/alquileres" tone="ok" />
        <Kpi label="Flota ocupada" value={`${fleet.length ? Math.round((rented / fleet.length) * 100) : 0} %`} hint={`${rented} de ${fleet.length} máquinas`} href="/app/flota" />
        <Kpi label="Facturado este mes" value={eur(month)} href="/app/facturacion" />
        <Kpi label="Ofertas ganadas" value={`${Math.round(st.winRate * 100)} %`} hint={`${st.won} de ${st.responded}`} href="/app/ofertas" />
      </div>
      <div className="grid-main">
        <div>
          <Card title="Nuevas solicitudes" action={<a className="more" href="#/app/solicitudes">Ver todas</a>}>
            {pending.length === 0 ? <p className="muted">Estás al día: no hay solicitudes pendientes de oferta.</p> : (
              <div className="mini-list">
                {pending.slice(0, 5).map((r) => (
                  <a key={r.id} href="#/app/solicitudes">
                    <div><b>{itemsText(r.items)}</b><span>{r.id} · {r.municipio} · {fmtDay(r.start)} · {r.days} días</span></div>
                    {r.urgent && <Badge tone="bad">Urgente</Badge>}<em>Ofertar</em><ArrowRight size={16} />
                  </a>
                ))}
              </div>
            )}
          </Card>
          <Card title="Facturación por mes"><Columns rows={spendByMonth(rentals, 6, 'price').map((m) => ({ label: monthLabel(m.key), value: m.value }))} format={eur} /></Card>
        </div>
        <div>
          <Card title="Próximas entregas y recogidas" action={<a className="more" href="#/app/entregas">Ver todas</a>}>
            {moves.length === 0 ? <p className="muted">Sin movimientos previstos.</p> : (
              <ul className="agenda">{moves.map((m, i) => <li key={i}><time>{fmtDay(m.date)}</time><div><b>{m.kind}</b><span>{itemsText(m.rental.items)} · {m.rental.municipio}</span></div></li>)}</ul>
            )}
          </Card>
          <Card title="Cómo te ven los clientes">
            <dl className="specs one">
              <div><dt>Valoración</dt><dd><Stars value={st.rating} /> {st.rating.toFixed(1).replace('.', ',')}</dd></div>
              <div><dt>Tiempo medio de respuesta</dt><dd>{fmtMin(st.avgResp)}</dd></div>
              <div><dt>Servicio técnico</dt><dd>en {p.assistanceH} h</dd></div>
              <div><dt>Incidencias</dt><dd>{st.incidents}</dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}

function Requests({ s, pid, openReqs }) {
  return (
    <>
      <PageHead title="Solicitudes" sub="Solo recibes peticiones de tu zona y de tu tipo de maquinaria. Responde con disponibilidad y precio." ><GuestProviderPicker s={s} /></PageHead>
      {openReqs.length === 0
        ? <Empty>No hay solicitudes abiertas para tu zona y tus familias de maquinaria.</Empty>
        : <div className="list">{openReqs.map((r) => <OfferCard key={r.id + pid} r={r} pid={pid} client={s.clients.find((c) => c.id === r.clientId)} />)}</div>}
    </>
  );
}

function OfferCard({ r, pid, client }) {
  const sent = r.offers.find((o) => o.providerId === pid);
  const suggested = sent || r.contacted.find((c) => c.providerId === pid).pending || {};
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ available: suggested.available || 'si', price: suggested.price || '', transport: suggested.transport ?? '', deposit: suggested.deposit ?? '', delayDays: suggested.delayDays || 1, payment: suggested.payment || 'Transferencia a 30 días', notes: suggested.notes || '' });
  const send = (e) => {
    e.preventDefault();
    actions.submitOffer(r.id, pid, { ...f, price: +f.price || 0, transport: +f.transport || 0, deposit: f.deposit === '' ? undefined : +f.deposit, delayDays: +f.delayDays });
    setEdit(false);
  };
  return (
    <article className="card rental">
      <div className="rental-top">
        <div>
          <span className="code">{r.id}{r.urgent ? ' · URGENTE' : ''}</span>
          <b>{itemsText(r.items)}</b>
          <span>{client?.name} · {r.municipio} ({r.province}) · {fmtDate(r.start)} · {r.days} días · {r.delivery}</span>
          {r.notes && <span>“{r.notes}”</span>}
        </div>
        <div className="row-right">
          {sent ? <span className="ok-text"><Check size={15} /> Oferta enviada: {sent.available === 'no' ? 'sin disponibilidad' : eur(sent.price + sent.transport)}</span> : <Status value="pendiente" />}
        </div>
      </div>
      {!edit && <div className="rental-actions"><button className={`btn btn-sm ${sent ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setEdit(true)}>{sent ? 'Modificar oferta' : 'Ofertar'}</button></div>}
      {edit && (
        <form className="inline-form" onSubmit={send}>
          <Field label="Disponibilidad">
            <select value={f.available} onChange={(e) => setF({ ...f, available: e.target.value })}>
              <option value="si">Disponible en la fecha</option><option value="parcial">Disponible con retraso</option><option value="no">No disponible</option>
            </select>
          </Field>
          {f.available === 'parcial' && <Field label="Días de retraso"><input type="number" min="1" value={f.delayDays} onChange={(e) => setF({ ...f, delayDays: e.target.value })} /></Field>}
          {f.available !== 'no' && <>
            <Field label="Precio alquiler (€)"><input required type="number" min="1" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
            <Field label="Transporte (€)"><input type="number" min="0" value={f.transport} onChange={(e) => setF({ ...f, transport: e.target.value })} /></Field>
            <Field label="Fianza (€)"><input type="number" min="0" value={f.deposit} onChange={(e) => setF({ ...f, deposit: e.target.value })} /></Field>
            <Field label="Condiciones de pago"><select value={f.payment} onChange={(e) => setF({ ...f, payment: e.target.value })}>{PAYMENT_METHODS.map((x) => <option key={x}>{x}</option>)}</select></Field>
          </>}
          <Field label="Observaciones" wide><input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
          <button className="btn btn-primary">Enviar oferta</button>
          <button type="button" className="btn btn-ghost" onClick={() => setEdit(false)}>Cancelar</button>
        </form>
      )}
    </article>
  );
}

function MyOffers({ s, pid, mine }) {
  const rows = mine.map((r) => ({ r, o: r.offers.find((x) => x.providerId === pid) })).filter((x) => x.o);
  const result = (r, o) => {
    if (o.available === 'no') return <Badge>Sin disponibilidad</Badge>;
    if (r.status === 'aceptada') return r.acceptedProviderId === pid ? <Badge tone="ok">Ganada</Badge> : <Badge tone="bad">Perdida</Badge>;
    if (r.status === 'cancelada') return <Badge>Cancelada</Badge>;
    return <Badge tone="warn">En estudio</Badge>;
  };
  return (
    <>
      <PageHead title="Mis ofertas" sub="Histórico de ofertas enviadas y su resultado." />
      <Table head={['Solicitud', 'Maquinaria', 'Obra', 'Inicio', { num: 'Alquiler' }, { num: 'Transporte' }, { num: 'Posición' }, 'Resultado']} empty="Todavía no has enviado ofertas.">
        {rows.map(({ r, o }) => {
          const pos = rankOffers(r, s).findIndex((x) => x.providerId === pid) + 1;
          return (
            <tr key={r.id}>
              <td className="code">{r.id}</td><td>{itemsText(r.items)}</td><td>{r.municipio}</td><td>{fmtDay(r.start)}</td>
              <td className="num">{o.available === 'no' ? '—' : eur(o.price)}</td><td className="num">{o.available === 'no' ? '—' : eur(o.transport)}</td>
              <td className="num">{pos ? `${pos}.ª de ${r.offers.filter((x) => x.available !== 'no').length}` : '—'}</td><td>{result(r, o)}</td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}

function Rentals({ s, rentals }) {
  return (
    <>
      <PageHead title="Alquileres" sub="Confirma la entrega en obra y la recogida cuando el cliente pida la baja." />
      {rentals.length === 0 ? <Empty>Todavía no tienes alquileres por MAQNOW.</Empty> : (
        <div className="list">
          {rentals.map((r) => (
            <article key={r.id} className="card rental">
              <div className="rental-top">
                <div><span className="code">{r.id}</span><b>{itemsText(r.items)}</b><span>{s.clients.find((c) => c.id === r.clientId)?.name} · {r.municipio} · {fmtDay(r.start)} – {fmtDay(r.end)}</span><span>Máquinas: {r.machineIds.join(', ')}</span></div>
                <div className="row-right"><Status value={r.status} /><b>{eur(r.total)}</b></div>
              </div>
              {r.status === 'baja solicitada' && <div className="notice warn">El cliente pide la baja y recogida para el {fmtDate(r.bajaDate)}.</div>}
              <div className="rental-actions">
                {r.status === 'reservada' && <button className="btn btn-primary btn-sm" onClick={() => actions.setRentalStatus(r.id, 'en alquiler')}>Confirmar entrega en obra</button>}
                {r.status === 'baja solicitada' && <button className="btn btn-primary btn-sm" onClick={() => actions.confirmPickup(r.id)}>Confirmar recogida</button>}
                <span className="reviewed">Comisión MAQNOW: {eur(r.commission)} ({r.commissionPct} %)</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function Fleet({ s, pid, p, fleet }) {
  const [machine, setMachine] = useState(null);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ family: p.families[0] || 'elevacion', type: '', size: '', brand: '', year: new Date().getFullYear() });
  const fam = familyById(f.family);
  const add = (e) => {
    e.preventDefault();
    actions.addMachine(pid, { ...f, type: f.type || fam.types[0], size: f.size || fam.fields[0].options[0] });
    setAdding(false);
  };
  return (
    <>
      <PageHead title="Mi maquinaria" sub="Tu flota con su estado, mantenimiento y pasaporte digital.">
        <button className="btn btn-primary" onClick={() => setAdding(!adding)}><Plus size={16} /> Añadir máquina</button>
      </PageHead>
      {adding && (
        <form className="card inline-form flat" onSubmit={add}>
          <Field label="Familia"><select value={f.family} onChange={(e) => setF({ ...f, family: e.target.value, type: '', size: '' })}>{FAMILIES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
          <Field label="Tipo"><select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{fam.types.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label={fam.fields[0].label}><select value={f.size} onChange={(e) => setF({ ...f, size: e.target.value })}>{fam.fields[0].options.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Marca"><input value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} /></Field>
          <Field label="Año"><input type="number" min="1990" max="2100" value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })} /></Field>
          <button className="btn btn-primary">Guardar</button>
        </form>
      )}
      <div className="kpis three">
        <Kpi label="Operativas" value={fleet.filter((m) => m.status === 'operativa').length} tone="ok" />
        <Kpi label="Alquiladas" value={fleet.filter((m) => m.status === 'alquilada').length} />
        <Kpi label="En mantenimiento" value={fleet.filter((m) => m.status === 'mantenimiento').length} />
      </div>
      <Table head={['Máquina', 'Identificador', 'Año', { num: 'Horas' }, 'Próximo mantenimiento', 'Documentación', 'Estado', '']} empty="Añade tu primera máquina para empezar a recibir solicitudes más ajustadas.">
        {fleet.map((m) => (
          <tr key={m.id}>
            <td><b>{m.brand} · {m.type}</b><small>{familyById(m.family).name}{m.size ? ` · ${m.size}` : ''}</small></td><td className="code">{m.id}</td><td>{m.year}</td>
            <td className="num">{m.hours.toLocaleString('es-ES')}</td><td>{fmtDate(m.nextMaint)}</td>
            <td><div className={`index ${docsPct(m) < 100 ? 'warn' : ''}`}><i style={{ width: `${docsPct(m)}%` }} /><span>{docsPct(m)} %</span></div></td>
            <td>{m.status === 'alquilada' ? <Status value="alquilada" /> : (
              <select className="mini" value={m.status} onChange={(e) => actions.setMachineStatus(m.id, e.target.value)} aria-label="Estado de la máquina"><option value="operativa">Operativa</option><option value="mantenimiento">Mantenimiento</option></select>
            )}</td>
            <td><button className="btn btn-ghost btn-sm" onClick={() => setMachine(m.id)}>Pasaporte</button></td>
          </tr>
        ))}
      </Table>
      {machine && <PassportModal machine={s.machines.find((m) => m.id === machine)} s={s} editable onClose={() => setMachine(null)} />}
    </>
  );
}

function Moves({ s, pid }) {
  const moves = movements(s, (r) => r.providerId === pid);
  return (
    <>
      <PageHead title="Entregas y recogidas" sub="Planificación de transporte de tus alquileres por MAQNOW." />
      {moves.length === 0 ? <Empty>No hay entregas ni recogidas previstas.</Empty> : (
        <div className="timeline">
          {moves.map((m, i) => (
            <div key={i} className={`tl ${m.kind === 'Entrega' ? 'in' : 'out'}`}>
              <time><b>{fmtDay(m.date)}</b><span>{m.date < todayISO() ? 'Atrasada' : m.date === todayISO() ? 'Hoy' : ''}</span></time>
              <div><Badge tone={m.kind === 'Entrega' ? 'info' : 'warn'}>{m.kind}</Badge><b>{itemsText(m.rental.items)}</b><span>{s.clients.find((c) => c.id === m.rental.clientId)?.name} · {m.rental.municipio} · {m.rental.id}</span></div>
              {m.kind === 'Entrega' && <button className="btn btn-primary btn-sm" onClick={() => actions.setRentalStatus(m.rental.id, 'en alquiler')}>Confirmar entrega</button>}
              {m.kind === 'Recogida' && <button className="btn btn-primary btn-sm" onClick={() => actions.confirmPickup(m.rental.id)}>Confirmar recogida</button>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Incidents({ s, rentals }) {
  const incidents = s.incidents.filter((i) => rentals.some((r) => r.id === i.rentalId));
  return (
    <>
      <PageHead title="Incidencias" sub="Averías y consultas de tus máquinas en obra. El tiempo de respuesta cuenta en tu valoración." />
      {incidents.length === 0 ? <Empty>Sin incidencias abiertas.</Empty> : (
        <div className="list">
          {incidents.map((i) => {
            const r = rentals.find((x) => x.id === i.rentalId);
            return (
              <article key={i.id} className="card rental">
                <div className="rental-top">
                  <div><span className="code">{i.id} · {i.rentalId}</span><b>{i.type}{i.urgent ? ' · URGENTE' : ''}</b><span>{itemsText(r.items)} · {r.municipio}</span><span>{i.desc || 'Sin descripción'}</span></div>
                  <Status value={i.status} />
                </div>
                <div className="rental-actions">
                  {i.status === 'abierta' && <button className="btn btn-ghost btn-sm" onClick={() => actions.setIncidentStatus(i.id, 'en curso')}>Técnico en camino</button>}
                  {i.status !== 'resuelta' && <button className="btn btn-primary btn-sm" onClick={() => actions.setIncidentStatus(i.id, 'resuelta')}>Marcar resuelta</button>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

function Billing({ s, pid, rentals }) {
  const inv = invoicesOf(s, (r) => r.providerId === pid);
  const gross = rentals.reduce((a, r) => a + r.total, 0);
  const comm = rentals.reduce((a, r) => a + r.commission, 0);
  return (
    <>
      <PageHead title="Facturación y comisiones" sub="Lo que has facturado a través de MAQNOW y la comisión de cada operación." />
      <div className="kpis three">
        <Kpi label="Facturado" value={eur(gross)} hint={`${rentals.length} alquileres`} />
        <Kpi label="Comisión MAQNOW" value={eur(comm)} hint={`${eur(rentals.filter((r) => r.commissionStatus === 'pendiente').reduce((a, r) => a + r.commission, 0))} pendiente de liquidar`} />
        <Kpi label="Neto para ti" value={eur(gross - comm)} tone="ok" />
      </div>
      <Table head={['Alquiler', 'Cliente', 'Periodo', { num: 'Importe' }, { num: 'Comisión' }, 'Liquidación', 'Cobro del cliente']} empty="Aún no hay operaciones.">
        {rentals.map((r) => {
          const i = inv.find((x) => x.rentalId === r.id);
          return (
            <tr key={r.id}>
              <td className="code">{r.id}</td><td>{s.clients.find((c) => c.id === r.clientId)?.name}</td><td>{fmtDay(r.start)} – {fmtDay(r.end)}</td>
              <td className="num">{eur(r.total)}</td><td className="num">{eur(r.commission)} ({r.commissionPct} %)</td><td><Status value={r.commissionStatus} /></td><td>{i ? <Status value={i.status} /> : '—'}</td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}

function Profile({ p, st }) {
  const [f, setF] = useState(p);
  const [saved, setSaved] = useState(false);
  const set = (k, num) => (e) => { setF({ ...f, [k]: num ? +e.target.value : e.target.value }); setSaved(false); };
  const toggle = (key, v) => { setF({ ...f, [key]: (f[key] || []).includes(v) ? f[key].filter((x) => x !== v) : [...(f[key] || []), v] }); setSaved(false); };
  return (
    <>
      <PageHead title="Ficha de proveedor" sub="Con estos datos decidimos qué solicitudes te enviamos." />
      <form className="card" onSubmit={(e) => { e.preventDefault(); actions.saveProvider(f); setSaved(true); }}>
        <div className="form-grid">
          <Field label="Nombre comercial"><input value={f.name} onChange={set('name')} /></Field>
          <Field label="Persona de contacto"><input value={f.contactName || ''} onChange={set('contactName')} /></Field>
          <Field label="Teléfono"><input value={f.phone || ''} onChange={set('phone')} /></Field>
          <Field label="Email para solicitudes"><input type="email" value={f.email || ''} onChange={set('email')} /></Field>
          <Field label="Base (municipio)"><input value={f.city} onChange={set('city')} /></Field>
          <Field label="Provincia de la base"><select value={f.province} onChange={set('province')}>{PROVINCES.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Servicio técnico: respuesta en (horas)"><input type="number" min="1" max="72" value={f.assistanceH} onChange={set('assistanceH', true)} /></Field>
          <Field label="Condiciones de pago"><select value={f.payment} onChange={set('payment')}>{PAYMENT_METHODS.map((x) => <option key={x}>{x}</option>)}</select></Field>
        </div>
        <div className="field" style={{ marginTop: 16 }}>
          <span>Especialidades</span>
          <div className="chips">{FAMILIES.map((x) => <button type="button" key={x.id} aria-pressed={f.families.includes(x.id)} className={f.families.includes(x.id) ? 'on' : ''} onClick={() => toggle('families', x.id)}>{x.name}</button>)}</div>
        </div>
        {f.scope === 'Local' && (
          <div className="field" style={{ marginTop: 16 }}>
            <span>Provincias donde sirves</span>
            <div className="chips">{['Málaga', 'Cádiz', 'Granada', 'Córdoba', 'Sevilla', 'Almería', 'Jaén', 'Huelva'].map((x) => <button type="button" key={x} aria-pressed={(f.provinces || []).includes(x)} className={(f.provinces || []).includes(x) ? 'on' : ''} onClick={() => toggle('provinces', x)}>{x}</button>)}</div>
          </div>
        )}
        <div className="form-foot"><button className="btn btn-primary">Guardar ficha</button>{saved && <span className="ok-text"><Check size={15} /> Guardado</span>}</div>
      </form>
      <Card title="Plan">
        <p><b>Plan {p.plan || 'Gratis'}</b> · comisión del {p.commission} % solo cuando se cierra un alquiler.</p>
        <p className="muted">Próximamente, plan PRO: más visibilidad, prioridad en solicitudes, estadísticas, gestión de flota e integración por API.</p>
        <p className="muted">Tu índice interno actual: {st.index}/100.</p>
      </Card>
    </>
  );
}
