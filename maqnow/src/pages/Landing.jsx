import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowUp, ArrowDown, Pause, Play, MessageCircle, Phone, Mail, Menu, X, Check, FileCheck2, Wrench, LogOut, BarChart3, Plus } from 'lucide-react';
import { FAMILIES, familyById } from '../data/catalog';
import { CONTACT } from '../data/providers';
import { IMG, FAMILY_IMG } from '../data/images';
import { actions, getState, setDraft } from '../lib/store';
import { SITE, FAQ, SECTORS } from '../data/site';
import { FamilyIcon, Photo, Reveal, go, srcSetFor, useInView } from '../components/ui';

const HOW = [
  ['Una solicitud, todos los proveedores', 'Pedimos oferta a todos los proveedores en un solo click.'],
  ['El comparativo de las 5 mejores ofertas', 'Por disponibilidad, precio, transporte y servicio técnico.'],
  ['Proveedores cualificados', 'Los cualificamos nosotros, para tu tranquilidad.'],
  ['Tu CRM incluido', 'Toda la información y las gestiones realizadas, guardadas para tus informes.'],
];

// Ofertas de ejemplo para la demostración animada (alquiladores ficticios)
const RACE = [
  { name: 'Alquilador local A', km: 12, rent: 880, trans: 0, score: 97, tag: 'Recomendada' },
  { name: 'Alquilador local B', km: 10, rent: 845, trans: 65, score: 96, tag: 'Mejor precio de alquiler' },
  { name: 'Operador nacional C', km: 14, rent: 900, trans: 70, score: 92 },
  { name: 'Operador nacional D', km: 42, rent: 860, trans: 125, score: 87 },
  { name: 'Alquilador local E', km: 13, rent: 865, trans: 70, score: 85, tag: 'Entrega un día después' },
];

export function Landing({ onAssistant }) {
  const [menu, setMenu] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(t); }, []);
  const [sector, setSector] = useState(SECTORS[0].id);
  useEffect(() => {
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const start = (family) => {
    const ss = getState().session;
    if (!ss) actions.enterGuest('cliente');
    else if (ss.guest && ss.role !== 'cliente') actions.switchRole('cliente');
    else if (!ss.guest && ss.role !== 'cliente') return go('/app/inicio');
    if (family) setDraft({ familyPreset: family });
    return go('/app/nueva');
  };
  const session = getState().session;

  return (
    <div className={`landing ${ready ? 'ready' : ''}`}>
      <header className="lnav">
        <a className="brand" href="#/" aria-label={`${SITE.name}, inicio`}><img src={`${import.meta.env.BASE_URL}logo-mark.svg`} alt="" width="28" height="28" />MAQ<span>NOW</span></a>
        <nav id="menu-web" aria-label="Secciones de la web" className={menu ? 'open' : ''} onClick={() => setMenu(false)}>
          <a href="#como">Cómo funciona</a>
          <a href="#maquinaria">Maquinaria</a>
          <a href="#empresas">Empresas</a>
          <a href="#proveedores">Proveedores</a>
          <a href="#preguntas">Preguntas</a>
        </nav>
        <div className="lnav-actions">
          {session
            ? <a className="btn btn-primary btn-sm" href="#/app/inicio">Ir a mi área</a>
            : <><a className="lnav-link" href="#/acceso">Entrar</a><a className="btn btn-primary btn-sm" href="#/registro">Crear cuenta</a></>}
          <button className="menu-btn" onClick={() => setMenu(!menu)} aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menu} aria-controls="menu-web">{menu ? <X aria-hidden /> : <Menu aria-hidden />}</button>
        </div>
      </header>

      <main id="contenido" tabIndex={-1}>
      {/* Portada: una foto a toda pantalla, una frase y una acción. Lo demás va debajo. */}
      <Hero onStart={() => start()} onAssistant={onAssistant} />

      <div className="marquee" aria-hidden>
        <div>
          {[0, 1].map((k) => (
            <span key={k}>{FAMILIES.flatMap((f) => f.types.slice(0, 3)).map((t) => <i key={t + k}>{t}</i>)}</span>
          ))}
        </div>
      </div>

      {/* Cómo lo hacemos */}
      <section className="lsec how" id="como">
        <div className="lsec-head">
          <Reveal as="h2">Cómo lo hacemos</Reveal>
          <Reveal as="p" delay={80}>En 5 minutos, lo que te lleva una mañana.</Reveal>
        </div>
        <ol className="how-grid">
          {HOW.map(([title, text], i) => (
            <Reveal as="li" key={title} delay={i * 90}>
              <span className="how-num">{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </ol>
        <Reveal className="how-contact" delay={200}>
          <span>Atención urgente</span>
          <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}><Phone size={16} aria-hidden /> {CONTACT.phone}</a>
          <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={16} aria-hidden /> WhatsApp</a>
          <a href={`mailto:${CONTACT.email}`}><Mail size={16} aria-hidden /> {CONTACT.email}</a>
        </Reveal>
      </section>

      {/* Antes / después */}
      <section className="lsec split">
        <Photo src={IMG.problem} alt="Operarios en una obra" className="split-photo" />
        <div className="split-copy">
          <Reveal as="h2">Hoy pedir precio es llamar a cinco empresas y esperar toda la mañana.</Reveal>
          <Reveal className="versus" delay={120}>
            <div>
              <h3>Como se hace ahora</h3>
              <ul className="minus">
                <li>Cada alquilador tiene su catálogo, su tarifa y su transporte.</li>
                <li>Repites la misma petición por teléfono, mail y WhatsApp.</li>
                <li>Comparas ofertas en papel, con conceptos distintos.</li>
                <li>Nada queda guardado para la siguiente obra.</li>
              </ul>
            </div>
            <div className="versus-good">
              <h3>Con MAQNOW</h3>
              <ul className="plus">
                <li>Dices una vez qué necesitas, dónde y cuándo.</li>
                <li>Hasta 10 proveedores nacionales y locales reciben la petición.</li>
                <li>Ves las 5 mejores ofertas en la misma tabla.</li>
                <li>Aceptas con un click y todo queda en tu historial.</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <OfferRace onStart={() => start('elevacion')} />

      {/* Maquinaria */}
      <section className="lsec" id="maquinaria">
        <div className="lsec-head">
          <Reveal as="h2">¿Qué maquinaria necesitas?</Reveal>
          <Reveal as="p" delay={80}>Elige una familia y te preguntamos solo lo que hace falta para esa máquina.</Reveal>
        </div>
        <div className="sectors">
          <span id="sector-label">¿En qué sector trabajas?</span>
          <div className="chips" role="group" aria-labelledby="sector-label">
            {SECTORS.map((x) => <button key={x.id} aria-pressed={sector === x.id} className={sector === x.id ? 'on' : ''} onClick={() => setSector(x.id)}>{x.name}</button>)}
          </div>
          <p aria-live="polite">Lo más pedido: {SECTORS.find((x) => x.id === sector).families.map((id) => familyById(id).name.toLowerCase()).join(', ')}.</p>
        </div>
        <div className="fam-grid">
          {FAMILIES.map((f, i) => (
            <Reveal as="button" key={f.id} className={`fam ${SECTORS.find((x) => x.id === sector).families.includes(f.id) ? 'hot' : ''}`} delay={i * 50} onClick={() => start(f.id)}>
              <Photo src={FAMILY_IMG[f.id]} alt="" sizes="(max-width: 1080px) 50vw, 25vw"><FamilyIcon id={f.id} size={44} /></Photo>
              <span className="fam-copy"><b>{f.name}</b><small>{f.task}</small></span>
              <ArrowRight size={18} aria-hidden />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Durante el alquiler */}
      <section className="lsec during">
        <div className="during-title">
          <Reveal as="h2">No se acaba cuando llega la máquina.</Reveal>
          <Reveal as="p" delay={80}>Todo lo que pasa durante el alquiler se gestiona en el mismo sitio.</Reveal>
        </div>
        <div className="during-list">
          {[
            [FileCheck2, 'Pasaporte digital de cada máquina', 'Ficha técnica, certificado CE, seguro, revisiones y mantenimiento, listos para tu coordinador de seguridad.'],
            [Wrench, 'Averías con respuesta medida', 'Avisas con un click. Llega al proveedor y a nuestro equipo, y queda el tiempo que tardan en atenderte.'],
            [LogOut, 'Bajas sin llamadas', 'Das de baja la máquina cuando termina el trabajo y el proveedor confirma la recogida.'],
            [BarChart3, 'Informes de lo que gastas', 'Gasto por obra, por mes y por proveedor, y lo que has ahorrado frente a la media de ofertas.'],
          ].map(([Icon, title, text], i) => (
            <Reveal key={title} className="during-row" delay={i * 70}>
              <Icon size={26} strokeWidth={1.5} />
              <div><h3>{title}</h3><p>{text}</p></div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Empresas */}
      <section className="lsec split reverse" id="empresas">
        <Photo src={IMG.companies} alt="Equipo de obra" className="split-photo">
          <div className="float-panel">
            <b>Mi empresa</b>
            {[['Promoción Málaga Centro', 42], ['Villas Marbella Este', 18], ['Reforma hotel Estepona', 27]].map(([n, q]) => (
              <div key={n}><span>{n}</span><em>{q} máquinas</em></div>
            ))}
          </div>
        </Photo>
        <div className="split-copy">
          <Reveal as="h2">Una central de compras de maquinaria para todas tus obras.</Reveal>
          <Reveal as="p" delay={80} className="lead">Constructoras, ingenierías e instaladoras llevan todas sus obras desde una única cuenta: quién ha pedido qué, cuánto cuesta cada obra y qué máquinas siguen contratadas.</Reveal>
          <Reveal as="ul" className="plus" delay={140}>
            <li>Solicita, compara y contrata por obra.</li>
            <li>Controla entregas, recogidas y bajas pendientes.</li>
            <li>Guarda tu maquinaria habitual y repite un alquiler en segundos.</li>
          </Reveal>
          <Reveal delay={200}><a className="btn btn-dark" href="#/registro">Crear cuenta de empresa <ArrowRight size={16} /></a></Reveal>
        </div>
      </section>

      {/* Proveedores */}
      <section className="lsec split dark" id="proveedores">
        <div className="split-copy">
          <Reveal as="h2">¿Alquilas maquinaria? Anúnciate con nosotros.</Reveal>
          <Reveal as="p" delay={80} className="lead">Date de alta gratis y te traemos clientes que ya quieren alquilar: solicitudes concretas de tu zona y tu especialidad, con fechas y obra. Tú respondes con disponibilidad y precio.</Reveal>
          <Reveal className="terms" delay={140}>
            <div><b>0 €</b><span>alta y uso del portal</span></div>
            <div><b>1 min</b><span>para enviar una oferta</span></div>
            <div><b>Tu zona</b><span>solo solicitudes que puedes servir</span></div>
          </Reveal>
          <Reveal delay={200}><a className="btn btn-primary" href="#/registro/proveedor">Dar de alta mi empresa <ArrowRight size={16} /></a></Reveal>
        </div>
        <Photo src={IMG.providers} alt="Plataformas elevadoras en un parque de alquiler" className="split-photo" />
      </section>

      {/* Preguntas */}
      <section className="lsec faq" id="preguntas">
        <Reveal as="h2">Preguntas frecuentes</Reveal>
        <div>
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<Plus size={20} /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <img src={IMG.cta} srcSet={srcSetFor(IMG.cta)} sizes="100vw" alt="" width="1800" height="1200" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div>
          <Reveal as="h2">Una sola solicitud. Todas las ofertas. Una sola decisión.</Reveal>
          <Reveal className="hero-actions" delay={120}>
            <button className="btn btn-primary btn-lg" onClick={() => start()}>Pedir ofertas ahora <ArrowRight size={18} /></button>
            <a className="btn btn-glass btn-lg" href="#/registro">Crear cuenta</a>
          </Reveal>
        </div>
      </section>

      </main>

      <footer className="lfoot">
        <div className="lfoot-top">
          <div className="lfoot-lead">
            <p>Busca. Compara. Alquila.</p>
            <span>La forma más rápida de pedir precio de maquinaria a todos los alquiladores de tu zona.</span>
            <div className="lfoot-cta">
              <button className="btn btn-primary" onClick={() => start()}>Pedir ofertas <ArrowRight size={16} /></button>
              <a className="btn btn-glass" href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>
            </div>
          </div>
          <nav className="lfoot-cols" aria-label="Pie de página">
            <div>
              <b>Plataforma</b>
              <a href="#como">Cómo funciona</a><a href="#maquinaria">Maquinaria</a><a href="#empresas">Para empresas</a><a href="#preguntas">Preguntas frecuentes</a>
            </div>
            <div>
              <b>Proveedores</b>
              <a href="#proveedores">Por qué MAQNOW</a><a href="#/registro/proveedor">Dar de alta mi empresa</a><a href="#/acceso">Portal de proveedor</a>
            </div>
            <div>
              <b>Cuenta</b>
              <a href="#/acceso">Entrar</a><a href="#/registro">Crear cuenta</a><button onClick={() => start()}>Probar sin registro</button>
            </div>
          </nav>
          <div className="lfoot-contact">
            <b>Atención urgente</b>
            <a className="lfoot-phone" href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}`}><Mail size={15} /> {CONTACT.email}</a>
            <span>Málaga y Costa del Sol. Lunes a viernes, de 7:00 a 19:00.</span>
          </div>
        </div>
        <div className="lfoot-word" aria-hidden />
        <div className="lfoot-bottom">
          <span>© {new Date().getFullYear()} MAQNOW</span>
          <span>Versión de demostración: precios, valoraciones y respuestas de proveedores son simulados. Fotografías de Unsplash.</span>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Volver arriba <ArrowUp size={15} /></button>
        </div>
      </footer>
    </div>
  );
}

// Lo que alguien pediría: se va escribiendo solo en la portada
const ASKS = ['una plataforma de 16 m en Marbella', 'una miniexcavadora para mañana en Málaga', 'un generador de 60 kVA para un evento', 'dos dumpers, 15 días, en Estepona', 'un manipulador telescópico en Antequera'];
const SLIDES = [IMG.hero, IMG.providers, IMG.cta];

function Hero({ onStart, onAssistant }) {
  const calm = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [ready, setReady] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(calm);
  const [rest, setRest] = useState(false); // el resto de fotos se piden después de pintar la primera
  const [typed, setTyped] = useState(calm ? ASKS[0] : '');

  useEffect(() => {
    const r = requestAnimationFrame(() => setReady(true));
    const t = setTimeout(() => setRest(true), 2500);
    return () => { cancelAnimationFrame(r); clearTimeout(t); };
  }, []);
  // pase de fotos
  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => { if (!document.hidden) setSlide((i) => (i + 1) % SLIDES.length); }, 6500);
    return () => clearInterval(t);
  }, [paused]);
  // texto que se escribe y se borra
  useEffect(() => {
    if (paused) return undefined;
    let i = 0, n = 0, dir = 1, timer;
    const tick = () => {
      const full = ASKS[i];
      n += dir;
      setTyped(full.slice(0, n));
      let wait = dir > 0 ? 55 : 22;
      if (dir > 0 && n === full.length) { dir = -1; wait = 2000; }
      else if (dir < 0 && n === 0) { dir = 1; i = (i + 1) % ASKS.length; wait = 350; }
      timer = setTimeout(tick, wait);
    };
    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  }, [paused]);

  return (
    <section className={`hx ${ready ? 'ready' : ''}`} aria-label="Portada">
      <div className="hx-bg" aria-hidden>
        {SLIDES.map((src, i) => (
          (i === 0 || rest) && (
            <img key={src} src={src} srcSet={srcSetFor(src, [640, 1000, 1400, 1800])} sizes="100vw" alt="" width="1800" height="1200"
              className={i === slide ? 'on' : ''} fetchPriority={i === 0 ? 'high' : 'low'} decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          )
        ))}
      </div>

      <div className="hx-inner">
        <p className="hx-kicker">Alquiler de maquinaria</p>
        <h1>
          <span className="line"><span>Ahorra tiempo y dinero</span></span>
          <span className="line"><span>en el alquiler</span></span>
          <span className="line"><span>de maquinaria.</span></span>
        </h1>
        <button className="hx-ask" onClick={onStart}>
          <span className="hx-ask-text">
            <span className="sr-only">Pide lo que necesitas, por ejemplo: {ASKS[0]}.</span>
            <span aria-hidden>Necesito <b>{typed}</b><i className="caret" /></span>
          </span>
          <span className="hx-ask-go">Comenzar ya <ArrowRight size={18} aria-hidden /></span>
        </button>
        <p className="hx-sub">
          Una solicitud y te llegan las 5 mejores ofertas. Gratis.
          <button className="hx-help" onClick={onAssistant}><MessageCircle size={16} aria-hidden /> Asistente o ayuda</button>
        </p>
      </div>

      <div className="hx-ctrl">
        <span aria-hidden>{SLIDES.map((_, i) => <i key={i} className={i === slide ? 'on' : ''} />)}</span>
        <button onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? 'Reanudar la animación' : 'Pausar la animación'}>{paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}</button>
      </div>
      <a className="hx-scroll" href="#como" aria-label="Ver cómo lo hacemos"><ArrowDown size={20} aria-hidden /></a>
    </section>
  );
}

// Demostración animada: las ofertas van llegando y se ordenan en el comparativo
function OfferRace({ onStart }) {
  const [ref, seen] = useInView(0.35);
  const max = Math.max(...RACE.map((o) => o.rent + o.trans));
  return (
    <section className={`race ${seen ? 'run' : ''}`} ref={ref}>
      <div className="race-inner">
        <div className="race-copy">
          <h2>El precio importa. Pero no decide solo.</h2>
          <p>Cada oferta se puntúa por precio, disponibilidad, transporte, valoración del proveedor y servicio técnico. La recomendada es la que mejor resuelve tu obra, no siempre la más barata.</p>
          <div className="ticket">
            <span>Solicitud MAQ-000254</span>
            <b>Brazo articulado diésel, 16 m</b>
            <dl>
              <div><dt>Obra</dt><dd>Marbella</dd></div>
              <div><dt>Inicio</dt><dd>Mañana</dd></div>
              <div><dt>Duración</dt><dd>5 días</dd></div>
            </dl>
            <em><i /> 10 proveedores contactados</em>
          </div>
          <button className="btn btn-primary" onClick={onStart}>Probar con mi obra <ArrowRight size={16} /></button>
        </div>
        <div className="race-board" role="img" aria-label="Ejemplo de comparativo con cinco ofertas ordenadas por puntuación">
          <div className="race-legend"><span><i className="sw-a" /> Alquiler</span><span><i className="sw-b" /> Transporte</span><span>Puntuación</span></div>
          {RACE.map((o, i) => (
            <div className={`race-row ${i === 0 ? 'best' : ''}`} key={o.name} style={{ '--d': `${i * 260}ms` }}>
              <div className="race-name"><b>{o.name}</b><small>a {o.km} km{o.tag ? ` · ${o.tag}` : ''}</small></div>
              <div className="race-track">
                <i className="ra" style={{ '--w': `${(o.rent / max) * 100}%` }} />
                <i className="rb" style={{ '--w': `${(o.trans / max) * 100}%` }} />
                <span>{o.rent + o.trans} €</span>
              </div>
              <div className="race-score">{o.score}</div>
              {i === 0 && <Check className="race-check" size={18} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
