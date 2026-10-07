import React from 'react';
import { ArrowLeft, Settings2, TriangleAlert } from 'lucide-react';
import { Logo } from '../components/Logo';
import { NotFound } from '../components/Screens';
import { LEGAL_DOCS, LEGAL_DRAFT, LEGAL_UPDATED, STORAGE, legalDoc } from '../data/legal';
import { openCookieSettings } from '../lib/consent';

const slug = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function Block({ b }) {
  if (Array.isArray(b)) return <ul>{b.map((x) => <li key={x}>{x}</li>)}</ul>;
  if (b?.table === 'storage') {
    return (
      <div className="legal-table" role="region" aria-label="Almacenamiento que usa la web" tabIndex={0}>
        <table>
          <thead><tr><th scope="col">Nombre</th><th scope="col">Tipo</th><th scope="col">Titular</th><th scope="col">Para qué sirve</th><th scope="col">Duración</th></tr></thead>
          <tbody>{STORAGE.map((x) => <tr key={x.name}><td><code>{x.name}</code><small>{x.where}</small></td><td>{x.kind}</td><td>{x.who}</td><td>{x.why}</td><td>{x.time}</td></tr>)}</tbody>
        </table>
      </div>
    );
  }
  if (b?.action === 'cookies') return <p><button className="btn btn-dark" onClick={openCookieSettings}><Settings2 size={17} aria-hidden /> Configurar cookies</button></p>;
  return <p>{b}</p>;
}

export function Legal({ doc: id }) {
  const doc = legalDoc(id || LEGAL_DOCS[0].id);
  if (!doc) return <NotFound />;
  return (
    <div className="legal">
      <header className="legal-top">
        <a className="brand" href="#/" aria-label="MAQNOW, inicio"><Logo /></a>
        <a className="legal-back" href="#/"><ArrowLeft size={16} aria-hidden /> Volver a la web</a>
      </header>
      <div className="legal-grid">
        <nav className="legal-nav" aria-label="Textos legales">
          <b>Legal</b>
          {LEGAL_DOCS.map((d) => <a key={d.id} href={`#/legal/${d.id}`} className={d.id === doc.id ? 'on' : ''} aria-current={d.id === doc.id ? 'page' : undefined}>{d.title}</a>)}
          <button onClick={openCookieSettings}><Settings2 size={15} aria-hidden /> Configurar cookies</button>
        </nav>
        <main className="legal-doc" id="contenido" tabIndex={-1} key={doc.id}>
          {LEGAL_DRAFT && (
            <p className="legal-draft" role="note"><TriangleAlert size={18} aria-hidden /> <span><b>Borrador pendiente de revisión.</b> Faltan los datos de la empresa (lo que aparece entre corchetes) y la revisión de un profesional antes de darlo por definitivo.</span></p>
          )}
          <h1>{doc.title}</h1>
          <p className="legal-intro">{doc.intro}</p>
          <p className="legal-date">Última actualización: {LEGAL_UPDATED}</p>
          {doc.sections.map(([h, blocks]) => (
            <section key={h} aria-labelledby={slug(h)}>
              <h2 id={slug(h)}>{h}</h2>
              {blocks.map((b, i) => <Block key={i} b={b} />)}
            </section>
          ))}
        </main>
      </div>
      <footer className="legal-foot">
        <span>© {new Date().getFullYear()} MAQNOW</span>
        {LEGAL_DOCS.map((d) => <a key={d.id} href={`#/legal/${d.id}`}>{d.title}</a>)}
      </footer>
    </div>
  );
}
