import React, { useEffect, useRef, useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { CATEGORIES, getConsent, saveConsent } from '../lib/consent';

// Aviso de cookies: aceptar y rechazar tienen el mismo peso y nada no técnico se activa sin una acción expresa.
export function CookieBanner() {
  const [consent, setConsent] = useState(getConsent);
  const [panel, setPanel] = useState(false);
  const [choices, setChoices] = useState(() => ({ analitica: !!getConsent()?.choices?.analitica }));
  const dialog = useRef(null);
  const opener = useRef(null);

  useEffect(() => {
    const open = () => { opener.current = document.activeElement; setChoices({ analitica: !!getConsent()?.choices?.analitica }); setPanel(true); };
    window.addEventListener('maqnow:cookies', open);
    return () => window.removeEventListener('maqnow:cookies', open);
  }, []);

  // el panel es un diálogo: recibe el foco, lo retiene y se cierra con Escape
  useEffect(() => {
    if (!panel) return undefined;
    const el = dialog.current;
    el?.querySelector('h2')?.focus();
    const on = (e) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      const items = [...el.querySelectorAll('button, a[href], input:not([disabled])')];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !el.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', on);
    return () => document.removeEventListener('keydown', on);
  }, [panel]);

  const close = () => { setPanel(false); opener.current?.focus?.(); };
  const decide = (c) => { saveConsent(c); setConsent(getConsent()); setPanel(false); opener.current?.focus?.(); };

  if (panel) {
    return (
      <div className="ck-wrap" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
        <div className="ck-panel" role="dialog" aria-modal="true" aria-labelledby="ck-title" ref={dialog}>
          <div className="ck-head">
            <h2 id="ck-title" tabIndex={-1}>Configurar cookies</h2>
            <button className="icon-btn" onClick={close} aria-label="Cerrar sin cambiar nada"><X size={20} aria-hidden /></button>
          </div>
          <p>Elige qué permites. Puedes cambiarlo cuando quieras desde el pie de la web. Tienes el detalle en la <a href="#/legal/cookies" onClick={close}>política de cookies</a>.</p>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <div><b id={`ck-${c.id}`}>{c.name}</b><span>{c.text}</span></div>
                {c.locked
                  ? <em>Siempre activas</em>
                  : <label className="switch"><input type="checkbox" checked={!!choices[c.id]} onChange={(e) => setChoices({ ...choices, [c.id]: e.target.checked })} aria-labelledby={`ck-${c.id}`} /><i aria-hidden /></label>}
              </li>
            ))}
          </ul>
          <div className="ck-foot">
            <button className="btn btn-ghost" onClick={() => decide({ analitica: false })}>Rechazar todas</button>
            <button className="btn btn-ghost" onClick={() => decide({ analitica: true })}>Aceptar todas</button>
            <button className="btn btn-primary" onClick={() => decide(choices)}>Guardar mi elección</button>
          </div>
        </div>
      </div>
    );
  }

  if (consent) return null;
  return (
    <section className="ck-bar" role="region" aria-label="Aviso de cookies">
      <Cookie size={22} aria-hidden />
      <p><b>Tu privacidad.</b> Usamos almacenamiento técnico imprescindible para que la web funcione. Lo demás, como la analítica, solo se activa si lo aceptas. <a href="#/legal/cookies">Política de cookies</a></p>
      <div>
        <button className="ck-link" onClick={() => { opener.current = null; setPanel(true); }}>Configurar</button>
        <button className="ck-btn" onClick={() => decide({ analitica: false })}>Rechazar</button>
        <button className="ck-btn" onClick={() => decide({ analitica: true })}>Aceptar</button>
      </div>
    </section>
  );
}
