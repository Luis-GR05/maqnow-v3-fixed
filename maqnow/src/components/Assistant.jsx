import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { FAMILIES, familyById, MUNICIPIOS } from '../data/catalog';
import { actions, getState, setDraft } from '../lib/store';
import { addDays, todayISO, fmtDate } from '../lib/format';
import { go } from './ui';

// Asistente guiado (sin IA externa todavía): entiende frases sencillas por palabras clave
// y pregunta solo lo que falta. Al terminar deja la solicitud preparada en el cuestionario.

const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function parseRequest(text, slots = {}) {
  const t = norm(text);
  const out = { ...slots };
  if (!out.family) {
    const fam = FAMILIES.find((f) => f.keywords.some((k) => t.includes(norm(k))) || t === norm(f.task));
    if (fam) out.family = fam.id;
  }
  if (out.family && !out.type) {
    const fam = familyById(out.family);
    const ty = fam.types.find((x) => t.includes(norm(x))) || fam.types.find((x) => norm(x).split(' ').some((w) => w.length > 5 && t.includes(w)));
    if (ty) out.type = ty;
  }
  const h = t.match(/(\d+)\s*(m|metros)\b/);
  if (h && out.family === 'elevacion' && !out.size) {
    const opts = familyById('elevacion').fields[0].options;
    out.size = opts.find((o) => parseInt(o, 10) >= +h[1]) || opts[opts.length - 1];
  }
  if (!out.municipio) {
    const m = Object.keys(MUNICIPIOS).find((k) => t.includes(norm(k)));
    if (m) { out.municipio = m; out.province = MUNICIPIOS[m]; }
  }
  if (!out.start) {
    if (/\bhoy\b|urgente|ya mismo/.test(t)) out.start = todayISO();
    else if (/pasado manana/.test(t)) out.start = addDays(todayISO(), 2);
    else if (/manana/.test(t)) out.start = addDays(todayISO(), 1);
    else if (/semana que viene|proxima semana/.test(t)) out.start = addDays(todayISO(), 7);
  }
  if (!out.days) {
    const d = t.match(/(\d+)\s*dias?/);
    const w = t.match(/(\d+|una|dos|tres)\s*semanas?/);
    const mo = t.match(/(\d+|un)\s*mes/);
    const num = (x) => ({ una: 1, un: 1, dos: 2, tres: 3 }[x] || +x);
    if (d) out.days = +d[1]; else if (w) out.days = num(w[1]) * 7; else if (mo) out.days = num(mo[1]) * 30;
  }
  return out;
}

export function slotsToItem(s) {
  const fam = familyById(s.family);
  return { family: fam.id, type: s.type || fam.types[0], qty: 1, specs: { [fam.fields[0].id]: s.size || fam.fields[0].options[1] } };
}

function nextQuestion(s) {
  if (!s.family) return { key: 'family', text: '¿Qué trabajo vas a hacer?', chips: FAMILIES.map((f) => f.task) };
  if (!s.type) return { key: 'type', text: `De acuerdo, ${familyById(s.family).name.toLowerCase()}. ¿Qué tipo de equipo?`, chips: familyById(s.family).types };
  if (!s.municipio) return { key: 'municipio', text: '¿En qué municipio está la obra?', chips: ['Málaga', 'Marbella', 'Estepona', 'Fuengirola'] };
  if (!s.start) return { key: 'start', text: '¿Para cuándo la necesitas?', chips: ['Hoy', 'Mañana', 'La semana que viene'] };
  if (!s.days) return { key: 'days', text: '¿Cuántos días aproximadamente?', chips: ['1 día', '3 días', '7 días', '15 días', '30 días'] };
  return null;
}

const HELLO = [{ from: 'bot', text: 'Hola. Cuéntame qué necesitas con tus palabras, por ejemplo: "una plataforma para trabajar a 14 metros en Marbella mañana, 5 días".' }];

export function Assistant({ open, onClose }) {
  const [msgs, setMsgs] = useState(HELLO);
  const [slots, setSlots] = useState({});
  const [pending, setPending] = useState(null);
  const [text, setText] = useState('');
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [msgs, open]);

  if (!open) return null;

  const reply = (userText) => {
    if (!userText.trim()) return;
    const t = norm(userText);
    const next = [...msgs, { from: 'user', text: userText }];
    if (/averia|no arranca|incidencia|rota|estropead/.test(t)) {
      setMsgs([...next, { from: 'bot', text: 'Para una avería entra en "Alquileres", elige la máquina y pulsa "Avisar avería". Avisamos al proveedor y a nuestro equipo al momento.', action: { label: 'Ir a mis alquileres', hash: '/app/alquileres' } }]);
      return;
    }
    if (/como funciona|que haceis|cuanto cuesta|gratis/.test(t)) {
      setMsgs([...next, { from: 'bot', text: 'Haces una sola solicitud, pedimos oferta a todos los proveedores compatibles y te enseñamos el comparativo de las 5 mejores por disponibilidad, precio, transporte y servicio técnico. Para ti es gratis. ¿Qué máquina necesitas?' }]);
      return;
    }
    const s = parseRequest(userText, slots);
    if (pending === 'municipio' && !s.municipio) { s.municipio = userText.trim(); s.province = 'Málaga'; }
    if (pending === 'days' && !s.days && /\d+/.test(t)) s.days = +t.match(/\d+/)[0];
    if (pending === 'type' && !s.type) s.type = familyById(s.family).types[0];
    setSlots(s);
    const q = nextQuestion(s);
    if (q) {
      setPending(q.key);
      setMsgs([...next, { from: 'bot', text: q.text, chips: q.chips }]);
    } else {
      setPending(null);
      setMsgs([...next, {
        from: 'bot',
        text: `Perfecto. He preparado tu solicitud: ${s.type}${s.size ? ' de ' + s.size : ''} en ${s.municipio}, desde el ${fmtDate(s.start)}, ${s.days} días. Revísala y pedimos ofertas.`,
        action: { label: 'Revisar y pedir ofertas', draft: s },
      }]);
    }
  };

  const send = (e) => { e.preventDefault(); reply(text); setText(''); };
  const runAction = (a) => {
    const ss = getState().session;
    if (!ss) actions.enterGuest('cliente');
    else if (ss.guest && ss.role !== 'cliente') actions.switchRole('cliente');
    if (a.draft) {
      setDraft({ items: [slotsToItem(a.draft)], municipio: a.draft.municipio, province: a.draft.province, start: a.draft.start, days: a.draft.days, step: 2 });
      go('/app/nueva');
    } else go(a.hash);
    onClose();
  };
  const last = msgs[msgs.length - 1];

  return (
    <aside className="assistant" role="dialog" aria-label="Asistente MAQNOW">
      <header>
        <MessageCircle size={18} />
        <b>Asistente MAQNOW</b>
        <button onClick={() => { setMsgs(HELLO); setSlots({}); setPending(null); }} className="link">Reiniciar</button>
        <button onClick={onClose} aria-label="Cerrar asistente"><X size={18} /></button>
      </header>
      <div className="assistant-body">
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>
            <p>{m.text}</p>
            {m.action && <button className="btn btn-primary btn-sm" onClick={() => runAction(m.action)}>{m.action.label}</button>}
          </div>
        ))}
        {last.chips && <div className="chips">{last.chips.map((c) => <button key={c} onClick={() => reply(c)}>{c}</button>)}</div>}
        {msgs.length === 1 && <div className="chips">{['No sé qué máquina necesito', '¿Cómo funciona?', 'Tengo una avería'].map((c) => <button key={c} onClick={() => reply(c)}>{c}</button>)}</div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe aquí…" aria-label="Mensaje" autoFocus />
        <button className="btn btn-primary" aria-label="Enviar"><Send size={16} /></button>
      </form>
    </aside>
  );
}
