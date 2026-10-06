import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, Zap, MessageCircle } from 'lucide-react';
import { FAMILIES, familyById, itemLabel, PROVINCES, PAYMENT_METHODS } from '../data/catalog';
import { FAMILY_IMG } from '../data/images';
import { actions, eligibleProviders, takeDraft } from '../lib/store';
import { addDays, fmtDate, todayISO } from '../lib/format';
import { FamilyIcon, Field, PageHead, Photo, go } from '../components/ui';

const STEPS = ['Maquinaria', 'Obra y fechas', 'Tu empresa'];

export function RequestWizard({ s, clientId, onAssistant }) {
  const profile = s.clients.find((c) => c.id === clientId);
  const sites = s.sites.filter((x) => x.clientId === clientId);
  const draft = useMemo(() => takeDraft() || {}, []);

  const [step, setStep] = useState(draft.step || 1);
  const [items, setItems] = useState(draft.items || []);
  const [cur, setCur] = useState({ family: draft.familyPreset || '', type: '', specs: {}, qty: 1 });
  const [site, setSite] = useState({
    siteId: draft.siteId || '', siteName: '', municipio: draft.municipio || '', cp: '', province: draft.province || 'Málaga',
    start: draft.start || addDays(todayISO(), 1), days: draft.days || 7, indefinite: false, delivery: 'Transporte incluido', urgent: false, notes: '',
  });
  const [company, setCompany] = useState({ id: profile.id, name: profile.name, cif: profile.cif, contact: profile.contact, phone: profile.phone, email: profile.email, payment: profile.payment });
  const [err, setErr] = useState('');

  const fam = cur.family ? familyById(cur.family) : null;
  const curReady = fam && cur.type && cur.specs[fam.fields[0].id];
  const addItem = () => {
    setItems([...items, { ...cur, qty: Math.max(1, +cur.qty || 1) }]);
    setCur({ family: '', type: '', specs: {}, qty: 1 });
  };
  const allItems = curReady ? [...items, { ...cur, qty: Math.max(1, +cur.qty || 1) }] : items;
  const reach = allItems.length ? eligibleProviders({ items: allItems, province: site.province }, s).length : 0;
  const pickSite = (id) => {
    const x = sites.find((o) => o.id === id);
    setSite(x ? { ...site, siteId: id, municipio: x.municipio, province: x.province } : { ...site, siteId: '' });
  };

  const next = () => {
    setErr('');
    if (step === 1) {
      if (!allItems.length) return setErr('Elige al menos una máquina: familia, tipo y tamaño.');
      if (curReady) addItem();
    }
    if (step === 2) {
      if (!site.municipio.trim()) return setErr('Indica el municipio de la obra.');
      if (!site.start || site.days < 1) return setErr('Indica fecha de inicio y duración.');
    }
    setStep(step + 1);
    window.scrollTo(0, 0);
    return null;
  };
  const submit = (e) => {
    e.preventDefault();
    if (!company.name.trim() || !company.phone.trim()) return setErr('Necesitamos al menos la razón social y un teléfono de contacto.');
    actions.saveClient(company);
    const id = actions.createRequest(clientId, { ...site, days: +site.days, items });
    return go(`/app/solicitud/${id}`);
  };

  return (
    <div className="narrow">
      <PageHead title="Solicita tu maquinaria" sub="Una sola solicitud para todos los proveedores compatibles.">
        <button className="btn btn-ghost" onClick={onAssistant}><MessageCircle size={16} /> No sé qué máquina necesito</button>
      </PageHead>
      <ol className="steps">
        {STEPS.map((label, i) => (
          <li key={label} className={step === i + 1 ? 'on' : step > i + 1 ? 'done' : ''}>
            <span>{step > i + 1 ? <Check size={14} /> : i + 1}</span>{label}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <section className="card">
          {items.length > 0 && (
            <ul className="item-list">
              {items.map((it, i) => (
                <li key={i}>
                  <FamilyIcon id={it.family} size={20} />
                  <div><b>{it.qty} × {itemLabel(it)}</b><span>{familyById(it.family).name}</span></div>
                  <button className="icon-btn" onClick={() => setItems(items.filter((_, j) => j !== i))} aria-label="Quitar máquina"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          )}
          <h2>{items.length ? 'Añadir otra máquina' : '¿Qué necesitas?'}</h2>
          <Field label="Buscar por tipología" wide>
            <select value={cur.family ? `${cur.family}|${cur.type}` : ''} onChange={(e) => { const [family, type] = e.target.value.split('|'); setCur({ family: family || '', type: type || '', specs: {}, qty: 1 }); }}>
              <option value="">Selecciona en el desplegable o pulsa una foto…</option>
              {FAMILIES.map((f) => (
                <optgroup key={f.id} label={f.name}>{f.types.map((t) => <option key={t} value={`${f.id}|${t}`}>{t}</option>)}</optgroup>
              ))}
            </select>
          </Field>
          <div className="pick-grid">
            {FAMILIES.map((f) => (
              <button key={f.id} type="button" className={`pick ${cur.family === f.id ? 'on' : ''}`} onClick={() => setCur({ family: f.id, type: '', specs: {}, qty: 1 })}>
                <Photo src={FAMILY_IMG[f.id]} alt=""><FamilyIcon id={f.id} size={26} /></Photo>
                <b>{f.name}</b>
              </button>
            ))}
          </div>
          {fam && (
            <div className="config">
              <div>
                <span className="config-label">Tipo</span>
                <div className="chips">{fam.types.map((t) => <button key={t} type="button" className={cur.type === t ? 'on' : ''} onClick={() => setCur({ ...cur, type: t })}>{t}</button>)}</div>
              </div>
              {cur.type && fam.fields.map((f) => (
                <div key={f.id}>
                  <span className="config-label">{f.label}</span>
                  <div className="chips">{f.options.map((o) => <button key={o} type="button" className={cur.specs[f.id] === o ? 'on' : ''} onClick={() => setCur({ ...cur, specs: { ...cur.specs, [f.id]: o } })}>{o}</button>)}</div>
                </div>
              ))}
              {cur.type && (
                <div className="config-row">
                  <Field label="Unidades"><input type="number" min="1" max="50" value={cur.qty} onChange={(e) => setCur({ ...cur, qty: e.target.value })} /></Field>
                  <button type="button" className="btn btn-ghost" disabled={!curReady} onClick={addItem}><Plus size={16} /> Añadir y pedir otra máquina</button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="card">
          <h2>¿Dónde y cuándo?</h2>
          <div className="form-grid">
            {sites.length > 0 && (
              <Field label="Obra">
                <select value={site.siteId} onChange={(e) => pickSite(e.target.value)}>
                  <option value="">Obra nueva…</option>
                  {sites.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </Field>
            )}
            {!site.siteId && <Field label="Nombre de la obra (opcional)"><input value={site.siteName} onChange={(e) => setSite({ ...site, siteName: e.target.value })} placeholder="Reforma calle Larios" /></Field>}
            <Field label="Municipio"><input value={site.municipio} onChange={(e) => setSite({ ...site, municipio: e.target.value })} placeholder="Marbella" disabled={!!site.siteId} /></Field>
            <Field label="Código postal"><input value={site.cp} onChange={(e) => setSite({ ...site, cp: e.target.value })} placeholder="29600" inputMode="numeric" /></Field>
            <Field label="Provincia"><select value={site.province} disabled={!!site.siteId} onChange={(e) => setSite({ ...site, province: e.target.value })}>{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select></Field>
            <Field label="Fecha de inicio"><input type="date" min={todayISO()} value={site.start} onChange={(e) => setSite({ ...site, start: e.target.value })} /></Field>
            <Field label="Días previstos"><input type="number" min="1" value={site.days} onChange={(e) => setSite({ ...site, days: e.target.value })} /></Field>
            <Field label="Entrega"><select value={site.delivery} onChange={(e) => setSite({ ...site, delivery: e.target.value })}><option>Transporte incluido</option><option>Recogida en proveedor</option></select></Field>
          </div>
          <p className="hint">Fin estimado: {fmtDate(addDays(site.start, +site.days || 0))}</p>
          <label className="check"><input type="checkbox" checked={site.indefinite} onChange={(e) => setSite({ ...site, indefinite: e.target.checked })} /> Alquiler abierto: hasta finalizar la obra (daré de baja la máquina cuando termine)</label>
          <label className="check"><input type="checkbox" checked={site.urgent} onChange={(e) => setSite({ ...site, urgent: e.target.checked })} /> <Zap size={15} /> Es urgente</label>
          <Field label="Información adicional (opcional)" wide><textarea rows="3" value={site.notes} onChange={(e) => setSite({ ...site, notes: e.target.value })} placeholder="Accesos, horarios de descarga, condiciones de la obra…" /></Field>
        </section>
      )}

      {step === 3 && (
        <form className="card" id="company-form" onSubmit={submit}>
          <h2>Empresa que utilizará la maquinaria</h2>
          <p className="hint">La guardamos para no volver a pedírtela.</p>
          <div className="form-grid">
            <Field label="Razón social"><input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></Field>
            <Field label="CIF"><input value={company.cif} onChange={(e) => setCompany({ ...company, cif: e.target.value })} /></Field>
            <Field label="Persona de contacto"><input value={company.contact} onChange={(e) => setCompany({ ...company, contact: e.target.value })} /></Field>
            <Field label="Teléfono"><input type="tel" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} /></Field>
            <Field label="Email"><input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} /></Field>
            <Field label="Forma de pago preferida"><select value={company.payment} onChange={(e) => setCompany({ ...company, payment: e.target.value })}>{PAYMENT_METHODS.map((p) => <option key={p}>{p}</option>)}</select></Field>
          </div>
          <div className="summary">
            <b>Resumen</b>
            <ul>{items.map((it, i) => <li key={i}>{it.qty} × {itemLabel(it)}</li>)}</ul>
            <span>{site.municipio} ({site.province}), desde el {fmtDate(site.start)}, {site.days} días{site.indefinite ? ' (abierto)' : ''}. {site.delivery}.</span>
          </div>
        </form>
      )}

      {err && <p className="error" role="alert">{err}</p>}

      <div className="wizard-foot">
        {step > 1 ? <button type="button" className="btn btn-ghost" onClick={() => { setErr(''); setStep(step - 1); }}><ArrowLeft size={16} /> Atrás</button> : <span />}
        <span className="reach">{reach > 0 && `Pediremos oferta a ${reach} proveedores`}</span>
        {step < 3
          ? <button key="next" type="button" className="btn btn-primary" onClick={next}>Continuar <ArrowRight size={16} /></button>
          : <button key="send" type="submit" className="btn btn-primary btn-lg" form="company-form">Solicitar ofertas</button>}
      </div>
    </div>
  );
}
