import React, { useEffect, useState } from 'react';
import { ArrowRight, MessageCircle, Phone, Mail, Menu, X, Check, FileCheck2, Wrench, LogOut, BarChart3, Plus } from 'lucide-react';
import { FAMILIES } from '../data/catalog';
import { CONTACT } from '../data/providers';
import { IMG, FAMILY_IMG } from '../data/images';
import { actions, getState, setDraft } from '../lib/store';
import { FamilyIcon, Photo, Reveal, go, useInView } from '../components/ui';

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

const FAQ = [
  ['¿Cuánto me cuesta usar MAQNOW?', 'Nada. Para quien alquila es gratis: pides ofertas, comparas y contratas sin coste. MAQNOW cobra una comisión al proveedor solo cuando se cierra un alquiler.'],
  ['¿Cuánto tardan en llegar las ofertas?', 'Los proveedores reciben tu solicitud al momento. Lo habitual es tener las primeras respuestas en minutos; si alguno no contesta, se lo reclamamos nosotros.'],
  ['¿Qué pasa si no sé qué máquina necesito?', 'Cuéntaselo al asistente con tus palabras: qué trabajo vas a hacer, dónde y cuándo. Te propone el equipo adecuado y deja la solicitud preparada.'],
  ['¿Y si la máquina se avería en la obra?', 'Desde tu área avisas de la avería con un click. El aviso llega al proveedor y a nuestro equipo, y queda registrado con sus tiempos de respuesta.'],
  ['¿Puedo pedir varias máquinas para la misma obra?', 'Sí. Añades todas las que necesites a una única solicitud y los proveedores ofertan el conjunto.'],
  ['Soy alquilador, ¿cómo entro?', 'Date de alta gratis como proveedor. Recibirás solo solicitudes de tu zona y de tu tipo de maquinaria, y respondes con disponibilidad y precio en un minuto.'],
];

export function Landing({ onAssistant }) {
  const [menu, setMenu] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(t); }, []);

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
        <a className="brand" href="#/"><img src={`${import.meta.env.BASE_URL}logo-mark.svg`} alt="" />MAQ<span>NOW</span></a>
        <nav className={menu ? 'open' : ''} onClick={() => setMenu(false)}>
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
          <button className="menu-btn" onClick={() => setMenu(!menu)} aria-label="Menú">{menu ? <X /> : <Menu />}</button>
        </div>
      </header>

      {/* Portada: foto + acciones a la izquierda, "cómo lo hacemos" a la derecha */}
      <section className="hero">
        <div className="hero-photo">
          <img src={IMG.hero} alt="Parque de maquinaria de alquiler" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="hero-photo-inner">
            <h1>
              <span className="line"><span>Ahorra tiempo</span></span>
              <span className="line"><span>y dinero en el alquiler</span></span>
              <span className="line"><span>de maquinaria.</span></span>
            </h1>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => start()}>Comenzar ya <ArrowRight size={18} /></button>
              <button className="btn btn-glass btn-lg" onClick={onAssistant}><MessageCircle size={18} /> Asistente o ayuda</button>
            </div>
            <p className="hero-note">Gratis para quien alquila. Sin registro para probarlo.</p>
          </div>
        </div>
        <div className="hero-how">
          <h2>Cómo lo hacemos</h2>
          <ol>
            {HOW.map(([title, text], i) => (
              <li key={title} style={{ transitionDelay: `${350 + i * 110}ms` }}>
                <span className="how-num">{i + 1}</span>
                <div><b>{title}</b><p>{text}</p></div>
              </li>
            ))}
          </ol>
          <div className="hero-contact">
            <span>Atención urgente</span>
            <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}><Phone size={15} /> {CONTACT.phone}</a>
            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>
            <a href={`mailto:${CONTACT.email}`}><Mail size={15} /> {CONTACT.email}</a>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden>
        <div>
          {[0, 1].map((k) => (
            <span key={k}>{FAMILIES.flatMap((f) => f.types.slice(0, 3)).map((t) => <i key={t + k}>{t}</i>)}</span>
          ))}
        </div>
      </div>

      {/* Antes / después */}
      <section className="lsec split" id="como">
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
        <div className="fam-grid">
          {FAMILIES.map((f, i) => (
            <Reveal as="button" key={f.id} className="fam" delay={i * 50} onClick={() => start(f.id)}>
              <Photo src={FAMILY_IMG[f.id]} alt=""><FamilyIcon id={f.id} size={44} /></Photo>
              <span className="fam-copy"><b>{f.name}</b><small>{f.task}</small></span>
              <ArrowRight size={18} />
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
          <Reveal as="h2">¿Alquilas maquinaria? Te traemos clientes que ya quieren alquilar.</Reveal>
          <Reveal as="p" delay={80} className="lead">No es un directorio más. Recibes solicitudes concretas de tu zona y tu especialidad, con fechas y obra, y respondes con disponibilidad y precio.</Reveal>
          <Reveal className="terms" delay={140}>
            <div><b>0 €</b><span>alta y uso del portal</span></div>
            <div><b>3 – 7 %</b><span>comisión, solo si se cierra el alquiler</span></div>
            <div><b>1 min</b><span>para enviar una oferta</span></div>
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
        <img src={IMG.cta} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div>
          <Reveal as="h2">Una sola solicitud. Todas las ofertas. Una sola decisión.</Reveal>
          <Reveal className="hero-actions" delay={120}>
            <button className="btn btn-primary btn-lg" onClick={() => start()}>Pedir ofertas ahora <ArrowRight size={18} /></button>
            <a className="btn btn-glass btn-lg" href="#/registro">Crear cuenta</a>
          </Reveal>
        </div>
      </section>

      <footer className="lfoot">
        <div>
          <a className="brand" href="#/"><img src={`${import.meta.env.BASE_URL}logo-mark.svg`} alt="" />MAQ<span>NOW</span></a>
          <p>Busca. Compara. Alquila.</p>
        </div>
        <div><b>Plataforma</b><a href="#como">Cómo funciona</a><a href="#maquinaria">Maquinaria</a><a href="#preguntas">Preguntas</a></div>
        <div><b>Cuenta</b><a href="#/acceso">Entrar</a><a href="#/registro">Crear cuenta</a><a href="#/registro/proveedor">Soy proveedor</a></div>
        <div><b>Contacto</b><a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></div>
        <small>Versión de demostración: precios, valoraciones y respuestas de proveedores son simulados. Fotografías de Unsplash.</small>
      </footer>
    </div>
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
