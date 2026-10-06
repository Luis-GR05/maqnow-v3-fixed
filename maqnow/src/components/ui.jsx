import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpFromLine, Shovel, Forklift, Layers, Zap, Hammer, Pickaxe, Droplets, Star, X, Check } from 'lucide-react';

const ICONS = { elevacion: ArrowUpFromLine, tierras: Shovel, manutencion: Forklift, compactacion: Layers, energia: Zap, herramientas: Hammer, demolicion: Pickaxe, bombas: Droplets };
export function FamilyIcon({ id, size = 28 }) {
  const I = ICONS[id] || Hammer;
  return <I size={size} strokeWidth={1.6} aria-hidden />;
}

export const go = (hash) => { window.location.hash = hash; };

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

const STATUS_TONE = {
  buscando: 'info', ofertas: 'warn', aceptada: 'ok', cancelada: 'neutral',
  reservada: 'info', 'en alquiler': 'ok', 'baja solicitada': 'warn', finalizada: 'neutral',
  abierta: 'bad', 'en curso': 'warn', resuelta: 'ok', pendiente: 'warn', liquidada: 'ok', pagada: 'ok', vencida: 'bad',
  operativa: 'ok', alquilada: 'info', mantenimiento: 'warn', Bajo: 'ok', Medio: 'warn', Alto: 'bad',
};
const STATUS_LABEL = { buscando: 'Buscando disponibilidad', ofertas: 'Ofertas recibidas' };
export function Status({ value }) {
  const label = STATUS_LABEL[value] || value.charAt(0).toUpperCase() + value.slice(1);
  return <Badge tone={STATUS_TONE[value] || 'neutral'}>{label}</Badge>;
}

export function Stars({ value, onChange, size = 15 }) {
  return (
    <span className="stars" aria-label={`${Number(value).toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= Math.round(value);
        const star = <Star size={size} fill={on ? 'currentColor' : 'none'} className={on ? 'on' : ''} />;
        return onChange
          ? <button key={n} type="button" className="star-btn" onClick={() => onChange(n)} aria-label={`${n} estrellas`}>{star}</button>
          : <span key={n}>{star}</span>;
      })}
    </span>
  );
}

export function Kpi({ label, value, hint, tone, href }) {
  const body = <><span>{label}</span><b>{value}</b>{hint && <small>{hint}</small>}</>;
  return href ? <a className={`kpi ${tone || ''}`} href={`#${href}`}>{body}</a> : <div className={`kpi ${tone || ''}`}>{body}</div>;
}

// Barras horizontales de una sola serie, con el valor escrito junto a cada barra
export function Bars({ rows, format = (v) => v }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="bars">
      {rows.map((r) => (
        <div className="bar-row" key={r.label}>
          <span className="bar-label">{r.label}</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${(r.value / max) * 100}%` }} /></div>
          <span className="bar-value">{format(r.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Columnas verticales por mes
export function Columns({ rows, format = (v) => v }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="cols" role="img" aria-label={rows.map((r) => `${r.label}: ${format(r.value)}`).join(', ')}>
      {rows.map((r) => (
        <div className="col" key={r.label}>
          <span className="col-value">{r.value ? format(r.value) : ''}</span>
          <div className="col-bar" style={{ height: `${Math.max(2, (r.value / max) * 100)}%` }} />
          <span className="col-label">{r.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Empty({ children, action }) {
  return <div className="empty"><p>{children}</p>{action}</div>;
}

export function Field({ label, children, wide }) {
  return (
    <label className={`field ${wide ? 'wide' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div><h1>{title}</h1>{sub && <p className="sub">{sub}</p>}</div>
      {children && <div className="page-tools">{children}</div>}
    </div>
  );
}

export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && <div className="card-head"><h2>{title}</h2>{action}</div>}
      {children}
    </section>
  );
}

// Tabla de datos. En pantallas estrechas cada fila se convierte en una ficha:
// por eso cada celda recibe en data-label el título de su columna.
export function Table({ head, children, empty }) {
  const labels = head.map((h) => (typeof h === 'object' ? h.num : h));
  const label = (node) => {
    if (!React.isValidElement(node)) return node;
    if (node.type === React.Fragment) return React.cloneElement(node, {}, React.Children.map(node.props.children, label));
    if (node.type !== 'tr' || /detail/.test(node.props.className || '')) return node;
    return React.cloneElement(node, {}, React.Children.map(node.props.children, (td, i) => (React.isValidElement(td) ? React.cloneElement(td, { 'data-label': labels[i] || '' }) : td)));
  };
  const rows = React.Children.toArray(children).map(label);
  if (!rows.length && empty) return <Empty>{empty}</Empty>;
  return (
    <section className="card table-card">
      <div className="table-scroll">
        <table className="data">
          <thead><tr>{head.map((h, i) => <th key={i} className={typeof h === 'object' ? 'num' : ''}>{labels[i]}</th>)}</tr></thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </section>
  );
}

// Línea de etapas (ciclo de la solicitud)
export function Stepline({ stages, current }) {
  return (
    <div className="stepline-wrap">
      <ol className="stepline">
        {stages.map((s, i) => (
          <li key={s} className={i < current ? 'done' : i === current ? 'now' : ''}>
            <i>{i < current ? <Check size={12} /> : null}</i><span>{s}</span>
          </li>
        ))}
      </ol>
      <div className="stepline-compact">
        <div><b>{stages[current]}</b><span>Paso {current + 1} de {stages.length}</span></div>
        <div className="stepline-bar">{stages.map((s, i) => <i key={s} className={i < current ? 'done' : i === current ? 'now' : ''} />)}</div>
        {current < stages.length - 1 && <small>Siguiente: {stages[current + 1].toLowerCase()}</small>}
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const on = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [onClose]);
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <header><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={20} /></button></header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// Marca un elemento como visible la primera vez que entra en pantalla
export function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return undefined;
    if (!('IntersectionObserver' in window)) { setSeen(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const [ref, seen] = useInView(0.15);
  return <Tag ref={ref} className={`reveal ${seen ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>{children}</Tag>;
}

// Imagen con respaldo: si la foto no carga, queda el bloque de color con el icono
export function Photo({ src, alt = '', className = '', children }) {
  const [ok, setOk] = useState(!!src);
  return (
    <div className={`photo ${className} ${ok ? '' : 'no-img'}`}>
      {ok && <img src={src} alt={alt} loading="lazy" onError={() => setOk(false)} />}
      {children}
    </div>
  );
}
