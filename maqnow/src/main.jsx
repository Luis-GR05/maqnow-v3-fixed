import React, { useEffect, useRef, useState, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, PerspectiveCamera, Float, OrbitControls } from '@react-three/drei';
import {
  ArrowDown, ArrowRight, Check, ChevronRight, Clock3, Compass, FileCheck, MapPin, Menu, Search,
  ShieldCheck, Sparkles, Truck, Users, WalletCards, X, Zap, LayoutDashboard, Building2, CalendarDays,
  Euro, Activity, PackageCheck, FileText, Settings, LogOut, Bell, ChevronDown, RotateCcw, Eye, Layers, Filter,
  Database, Shield
} from 'lucide-react';

import './styles.css';
import {
  DetailedExcavator,
  DetailedBoomLift,
  DetailedForklift,
  DetailedGenerator,
  DetailedRoller
} from './components/3d/MachineryModels';
import { DigitalPassportModal } from './components/DigitalPassportModal';
import { SupabaseConnectModal } from './components/SupabaseConnectModal';
import { ClientDashboard } from './components/dashboards/ClientDashboard';
import { ProviderDashboard } from './components/dashboards/ProviderDashboard';
import { LogisticsDashboard } from './components/dashboards/LogisticsDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { isSupabaseConfigured, MaqnowAPI } from './lib/supabase';

const cats = [
  { id: 'excavator', n: '01', name: 'Movimiento de tierras', desc: 'Miniexcavadora 3.5t con hoja dozer y cadenas', modelName: 'CAT 303.5 CR' },
  { id: 'boomlift', n: '02', name: 'Elevación de personas', desc: 'Plataforma articulada diésel 4x4 con plumín', modelName: 'JLG 450AJ 16m' },
  { id: 'forklift', n: '03', name: 'Manutención y telescópicos', desc: 'Manipulador telescópico 4t con estabilizadores', modelName: 'Manitou MT 1440' },
  { id: 'generator', n: '04', name: 'Energía y grupos electrógenos', desc: 'Generador insonorizado Stage V con tomas CETAC', modelName: 'Atlas Copco 60kVA' },
  { id: 'roller', n: '05', name: 'Compactación y pequeña maquinaria', desc: 'Rodillo tándem doble vibración con arco ROPS', modelName: 'Bomag BW 120' }
];

const offers = [
  { name: 'GAM España', score: 96, price: '1.280 €', transport: '150 €', delivery: '10 OCT', tag: 'Mejor equilibrio · Verificado Gold', location: 'Málaga (12 km)' },
  { name: 'mateco Alquiler', score: 93, price: '1.340 €', transport: 'Incluido', delivery: '10 OCT', tag: 'Mejor valoración clientes', location: 'Antequera (35 km)' },
  { name: 'RentAlis Local', score: 89, price: '1.180 €', transport: '100 €', delivery: '11 OCT', tag: 'Mejor precio directo', location: 'Marbella (24 km)' }
];

function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.classList.add('in');
        io.disconnect();
      }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

/* Studio Lighting Rig */
function StudioLighting() {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[8, 12, 8]} intensity={3.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-8, 8, -6]} intensity={1.4} color="#5eead4" />
      <directionalLight position={[0, -5, 6]} intensity={0.9} color="#b8ff4d" />
      <pointLight position={[0, 6, 0]} intensity={1.5} distance={15} />
      <hemisphereLight intensity={0.8} groundColor="#080d12" color="#e2f5f8" />
    </>
  );
}

/* Master 3D Machinery Scene Component */
export function MachineryScene({ progress = 0, hero = false, machineType = 'excavator', style, autoRotate = true }) {
  return (
    <div className={`scene ${hero ? 'scene-hero' : ''}`} style={style}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[5.4, 2.9, 6.4]} fov={38} />
        <StudioLighting />
        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0.06} floatIntensity={0.12}>
            {machineType === 'excavator' && <DetailedExcavator progress={progress} />}
            {machineType === 'boomlift' && <DetailedBoomLift progress={progress} />}
            {machineType === 'forklift' && <DetailedForklift progress={progress} />}
            {machineType === 'generator' && <DetailedGenerator progress={progress} />}
            {machineType === 'roller' && <DetailedRoller progress={progress} />}
          </Float>
          <ContactShadows position={[0, -0.65, 0]} opacity={0.58} scale={9.5} blur={2.2} far={6} color="#000000" />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={0.9}
          maxPolarAngle={Math.PI / 2.02}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  );
}

/* Interactive Scroll Storytelling Section */
function ScrollMachine({ activeMachine, setActiveMachine }) {
  const ref = useRef(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const total = Math.max(1, r.height - window.innerHeight);
      const v = Math.min(1, Math.max(0, -r.top / total));
      setP(v);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const currentStep = Math.min(3, Math.floor(p * 4));

  const steps = [
    {
      num: '01',
      kicker: 'FLEET INTELLIGENCE',
      title: 'Una máquina no es una foto.',
      highlight: 'Es un activo 3D verificado.',
      desc: 'MAQNOW reproduce la geometría exacta de la maquinaria: orugas con tacos reales, hoja dozer niveladora, plumín articulado y protecciones antivuelco homologadas.'
    },
    {
      num: '02',
      kicker: 'AUTOMATED MATCHING',
      title: 'El brazo hidráulico se mueve.',
      highlight: 'El algoritmo también.',
      desc: 'El comparador inteligente contrasta en tiempo real tonelaje, alcance de elevación, radio geográfico local y tarifas de los alquiladores verificados.'
    },
    {
      num: '03',
      kicker: 'LOGÍSTICA Y CERCANÍA',
      title: 'La distancia logística',
      highlight: 'define la rentabilidad.',
      desc: 'Despacho automatizado con camiones góndola y pluma de Transportes Especiales Sur. Firma biométrica de albarán digital directo en la obra.'
    },
    {
      num: '04',
      kicker: 'PASAPORTE DIGITAL 3D',
      title: 'Del parque a la obra con',
      highlight: 'pasaporte digital CE.',
      desc: 'Cada máquina cuenta con Machine ID y QR inviolable: marcado CE original de fábrica, revisiones periódicas OCA e ITV al día y seguro en vigor.'
    }
  ];

  return (
    <section ref={ref} className="machine-story-v2">
      <div className="story-container">
        {/* Left Side: Scrolling Step Cards */}
        <div className="story-steps-list">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className={`story-step-card ${currentStep === i ? 'active' : ''}`}
            >
              <div className="step-badge">{s.num} / {s.kicker}</div>
              <h2>
                {s.title}<br />
                <em>{s.highlight}</em>
              </h2>
              <p>{s.desc}</p>
              <div className="step-indicator">
                <span className={`dot ${currentStep === i ? 'pulse' : ''}`} />
                <small>{currentStep === i ? 'FASE ACTIVA EN 3D' : 'DESPLAZA PARA AVANZAR'}</small>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Sticky 3D Preview */}
        <div className="story-sticky-box">
          <div className="sticky-3d-wrapper">
            <MachineryScene progress={p} machineType={activeMachine} />
            <div className="sticky-progress-bar">
              <div className="progress-fill" style={{ width: `${p * 100}%` }} />
            </div>
            <div className="sticky-caption">
              <span>MODELO 3D REALISTA CON CINEMÁTICA</span>
              <b>PASO {currentStep + 1} DE 4 · {steps[currentStep].kicker}</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Top Global Role Switcher Bar */
function RoleSwitcherBar({ currentView, setView, onOpenSupabaseModal }) {
  const roles = [
    { id: 'landing', label: 'Marketplace (Landing)' },
    { id: 'client', label: 'Cliente (Constructora)' },
    { id: 'provider', label: 'Alquilador (Flotista)' },
    { id: 'logistics', label: 'Logística (Transporte)' },
    { id: 'admin', label: 'Admin (Motor Central)' }
  ];

  return (
    <div className="role-switcher-bar">
      <div className="role-switcher-inner">
        <div className="role-switcher-left">
          <span className="role-label">VISTA / ROL:</span>
          <div className="role-tabs">
            {roles.map((r) => (
              <button
                key={r.id}
                className={`role-tab ${currentView === r.id ? 'active' : ''}`}
                onClick={() => setView(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="role-switcher-right">
          <button className="btn-supabase-status" onClick={onOpenSupabaseModal} title="Configurar conexión con Supabase">
            <span className={`db-pill ${isSupabaseConfigured ? 'green' : 'amber'}`} />
            <Database size={13} />
            <span>{isSupabaseConfigured ? 'Supabase Live' : 'Modo Local (SQL Listo)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* Application Shell for Workspace Views */
function AppShell({ children, view, setView, onOpenSupabaseModal }) {
  const getRoleInfo = () => {
    switch (view) {
      case 'provider':
        return {
          title: 'Panel Alquilador',
          code: 'GAM España Alquileres S.A.',
          avatar: 'GAM',
          roleDesc: 'Alquilador Verificado Gold'
        };
      case 'logistics':
        return {
          title: 'Logística y Transporte',
          code: 'Transportes Especiales Sur S.L.',
          avatar: 'TES',
          roleDesc: 'Flota de Góndolas 24/7'
        };
      case 'admin':
        return {
          title: 'Motor Central MAQNOW',
          code: 'MAQNOW Operations & Compliance',
          avatar: 'MQN',
          roleDesc: 'Superintendencia de Red'
        };
      case 'client':
      default:
        return {
          title: 'Dashboard Cliente',
          code: 'Constructora Mediterránea S.A.',
          avatar: 'CM',
          roleDesc: 'Cuenta Profesional Gold'
        };
    }
  };

  const info = getRoleInfo();

  return (
    <div className="shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setView('landing')}>
          <img src="/logo-mark.svg" alt="MAQNOW Logo" />
          <span>MAQ<span>NOW</span></span>
        </button>

        <div className="sidegroup">
          <small>PLATAFORMA & ROLES</small>
          <button className={view === 'client' ? 'active' : ''} onClick={() => setView('client')}>
            <LayoutDashboard size={17} /> Dashboard Cliente
          </button>
          <button className={view === 'provider' ? 'active' : ''} onClick={() => setView('provider')}>
            <Building2 size={17} /> Panel Alquilador
          </button>
          <button className={view === 'logistics' ? 'active' : ''} onClick={() => setView('logistics')}>
            <Truck size={17} /> Logística y Portes
          </button>
          <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>
            <Shield size={17} /> Central MAQNOW
          </button>
        </div>

        <div className="sidegroup">
          <small>BASE DE DATOS & CONFIG</small>
          <button onClick={onOpenSupabaseModal}>
            <Database size={17} /> Supabase PostgreSQL
          </button>
          <button onClick={() => setView('landing')}>
            <LogOut size={17} /> Salir a Marketplace
          </button>
        </div>

        <div className="sidebottom">
          <div className="avatar">{info.avatar}</div>
          <div>
            <b>{info.code}</b>
            <span>{info.roleDesc}</span>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="workspace-nav">
          <button className="mobileback" onClick={() => setView('landing')}>← Marketplace</button>
          <div className="crumb">
            MAQNOW <span>/</span> <b>{info.title}</b> <span>/</span> {info.code}
          </div>
          <div className="workspace-actions">
            <button className="btn-supabase-pill" onClick={onOpenSupabaseModal}>
              <span className={`db-pill ${isSupabaseConfigured ? 'green' : 'amber'}`} />
              <Database size={13} /> {isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Local'}
            </button>
            <Bell size={18} />
            <div className="avatar">{info.avatar}</div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

/* Landing Page Component */
function Landing({ setView, onOpenPassport }) {
  const [menu, setMenu] = useState(false);
  const [activeMachine, setActiveMachine] = useState('excavator');

  const machineLabels = [
    { id: 'excavator', name: 'Miniexcavadora 3.5t', label: 'Movimiento de tierras' },
    { id: 'boomlift', name: 'Plataforma 16m', label: 'Trabajo en altura' },
    { id: 'forklift', name: 'Manipulador 14m', label: 'Manutención' },
    { id: 'generator', name: 'Generador 60kVA', label: 'Energía' },
    { id: 'roller', name: 'Rodillo Tándem 2.5t', label: 'Compactación' }
  ];

  return (
    <div className="app">
      <header className="nav">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/logo-mark.svg" alt="MAQNOW Logo" />
          <span>MAQ<span>NOW</span></span>
        </button>
        <nav className={menu ? 'open' : ''}>
          <a href="#como" onClick={() => setMenu(false)}>Cómo funciona</a>
          <a href="#maquinaria" onClick={() => setMenu(false)}>Modelos 3D</a>
          <a href="#pasaporte" onClick={() => setMenu(false)}>Pasaporte Digital</a>
          <a href="#proveedores" onClick={() => setMenu(false)}>Rentability Score</a>
          <button className="ghost" onClick={() => setView('client')}>Acceso Clientes</button>
          <button className="ghost" onClick={() => setView('provider')}>Acceso Alquiladores</button>
          <button className="primary small" onClick={() => setView('client')}>
            Solicitar maquinaria <ArrowRight size={15} />
          </button>
        </nav>
        <button className="menu" onClick={() => setMenu(!menu)}>
          {menu ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        {/* HERO SECTION WITH REALISTIC 3D CANVAS */}
        <section className="hero-v2">
          <div className="hero-grid">
            <Reveal className="hero-copy-v2">
              <div className="eyebrow">
                <span className="pulse" /> MARKETPLACE B2B DE MAQUINARIA · MODELOS 3D FOTORREALISTAS
              </div>
              <h1>
                Alquila maquinaria<br />
                <span>sin perseguir proveedores.</span>
              </h1>
              <p>
                Una sola solicitud unificada. Red de alquiladores con pasaporte 3D e inspección técnica digital. <strong>Decisiones respaldadas con comparativa de scoring en vivo.</strong>
              </p>
              <div className="hero-actions">
                <button className="primary" onClick={() => setView('client')}>
                  Comenzar solicitud de maquinaria <ArrowRight size={17} />
                </button>
                <a className="textlink" href="#maquinaria">
                  Explorar flota 3D <ChevronRight size={16} />
                </a>
              </div>
              <div className="hero-meta">
                <span><b>01</b> REQUEST</span>
                <span><b>02</b> MATCH</span>
                <span><b>03</b> COMPARE</span>
                <span><b>04</b> RENT 3D</span>
              </div>
            </Reveal>

            {/* 3D INTERACTIVE HERO VIEWER */}
            <Reveal className="hero-visual">
              <div className="hero-3d-container">
                <MachineryScene hero machineType={activeMachine} progress={0.15} />

                {/* Machine Switcher Bar */}
                <div className="machine-switcher">
                  {machineLabels.map((m) => (
                    <button
                      key={m.id}
                      className={activeMachine === m.id ? 'active' : ''}
                      onClick={() => setActiveMachine(m.id)}
                    >
                      <span>{m.name}</span>
                    </button>
                  ))}
                </div>

                <div className="visual-caption">
                  <span>MODELO 3D REALISTA · ARRASTRA PARA ROTAR 360°</span>
                  <b>{machineLabels.find(m => m.id === activeMachine)?.name} · 100% OPERATIVA EN RED</b>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="hero-scroll">
            <ArrowDown /> <span>DESPLAZA PARA EXPLORAR</span>
          </div>
        </section>

        {/* MANIFESTO SECTION */}
        <section id="como" className="manifesto">
          <Reveal>
            <div className="kicker">01 — LA IDEA MAQNOW</div>
            <h2>
              La maquinaria está disponible.<br />
              <em>El problema es encontrarla a tiempo.</em>
            </h2>
            <p>
              El mercado tradicional sufre falta de transparencia de tarifas, dispersión de llamadas y pasaportes en papel desactualizados. MAQNOW conecta constructoras con los mejores alquiladores de Málaga, Costa del Sol y toda España con pasaporte digital 3D.
            </p>
          </Reveal>
          <div className="manifesto-numbers">
            <Reveal>
              <b>1</b>
              <span>solicitud unificada</span>
            </Reveal>
            <Reveal>
              <b>100%</b>
              <span>inspección 3D auditada</span>
            </Reveal>
            <Reveal>
              <b>4</b>
              <span>roles integrados</span>
            </Reveal>
            <Reveal>
              <b>28 min</b>
              <span>tiempo medio de cotización</span>
            </Reveal>
          </div>
        </section>

        {/* SCROLLING 3D STORYTELLING SECTION */}
        <ScrollMachine activeMachine={activeMachine} setActiveMachine={setActiveMachine} />

        {/* CATEGORY & 3D MODEL CATALOG SECTION */}
        <section id="maquinaria" className="category-section">
          <div className="section-head-v2">
            <Reveal>
              <div className="kicker">03 — CATÁLOGO TÉCNICO EN 3D</div>
              <h2>
                Cinco categorías clave.<br />
                <em>Modeladas con especificación real.</em>
              </h2>
            </Reveal>
            <Reveal>
              <p>
                Cada máquina ha sido diseñada siguiendo catálogos reales de fabricantes: Caterpillar, JLG, Manitou, Atlas Copco y Bomag con hoja dozer, latiguillos hidráulicos, estabilizadores y marcado CE.
              </p>
            </Reveal>
          </div>

          <div className="category-grid">
            {cats.map((c, i) => (
              <Reveal
                key={c.id}
                className={i === 0 ? 'category featured' : 'category'}
              >
                <div
                  className="category-image"
                  onClick={() => {
                    setActiveMachine(c.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <MachineryScene
                    machineType={c.id}
                    progress={0.15}
                    style={{ height: '100%' }}
                    autoRotate={false}
                  />
                  <span>{c.n}</span>
                  <div className="cat-badge">VER MODELO 3D</div>
                </div>
                <div className="category-copy">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3>{c.name}</h3>
                    <small style={{ color: '#b8ff4d', fontFamily: 'DM Mono' }}>{c.modelName}</small>
                  </div>
                  <p>{c.desc}</p>
                  <button
                    className="ghost"
                    style={{ padding: 0, marginTop: '10px', color: '#b8ff4d', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => onOpenPassport({
                      id: `m-cat-${c.id}`,
                      name: c.modelName,
                      brand: c.modelName.split(' ')[0],
                      model: c.modelName.split(' ').slice(1).join(' '),
                      category: c.id,
                      three_d_model: c.id
                    })}
                  >
                    Abrir Pasaporte 3D <ArrowRight size={14} />
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* RENTING SCORE & COMPARISON SECTION */}
        <section id="proveedores" className="compare-section">
          <div className="section-head-v2">
            <Reveal>
              <div className="kicker">05 — RENTING SCORE INTELIGENTE</div>
              <h2>
                El precio es importante.<br />
                <em>Pero no decide solo.</em>
              </h2>
            </Reveal>
            <Reveal>
              <p>
                Nuestro algoritmo analiza en tiempo real precio, disponibilidad garantizada, cercanía logística, pasaporte digital y valoraciones de clientes para recomendar la mejor opción.
              </p>
            </Reveal>
          </div>

          <Reveal>
            <div className="score-layout">
              <div className="score-ring">
                <div>
                  <strong>96</strong>
                  <span>/100</span>
                  <small>RENTING SCORE</small>
                </div>
              </div>
              <div className="weights">
                <div><span>Precio de alquiler</span><b>30%</b><i style={{ width: '30%' }} /></div>
                <div><span>Disponibilidad inmediata</span><b>25%</b><i style={{ width: '25%' }} /></div>
                <div><span>Logística y transporte local</span><b>15%</b><i style={{ width: '15%' }} /></div>
                <div><span>Valoración de alquilador</span><b>15%</b><i style={{ width: '15%' }} /></div>
                <div><span>Pasaporte digital y marcado CE</span><b>15%</b><i style={{ width: '15%' }} /></div>
              </div>
              <div className="offer-stack">
                {offers.map((o, i) => (
                  <div className={i === 0 ? 'offer-card best' : 'offer-card'} key={o.name}>
                    <span className="offer-rank">0{i + 1}</span>
                    <div>
                      <b>{o.name}</b>
                      <small>{o.tag} · {o.location}</small>
                    </div>
                    <strong>{o.price}</strong>
                    <span>{o.score}/100</span>
                    <button
                      className="ghost"
                      style={{ padding: 0 }}
                      onClick={() => setView('client')}
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* DIGITAL PASSPORT SECTION WITH 3D PREVIEW */}
        <section id="pasaporte" className="passport-v2">
          <div className="passport-content">
            <Reveal>
              <div className="kicker">06 — PASAPORTE DIGITAL DE MAQUINARIA</div>
              <h2>
                Cada máquina tiene<br />
                <em>su propia identidad digital.</em>
              </h2>
              <p>
                Un Machine ID único reúne expediente de mantenimiento, certificado de marcado CE, inspección técnica periódica y póliza de seguro. Transparencia total en obra.
              </p>
              <div className="passport-checks">
                <span><Check /> Ficha técnica verificada</span>
                <span><Check /> Certificado CE original</span>
                <span><Check /> Revisiones periódicas OCA</span>
                <span><Check /> Histórico de mantenimiento</span>
                <span><Check /> Seguro en vigor</span>
                <span><Check /> Horómetro y telemetría</span>
              </div>
              <button
                className="primary"
                style={{ marginTop: '30px' }}
                onClick={() => onOpenPassport({
                  id: 'm2222222-2222-2222-2222-222222222222',
                  name: 'Plataforma Articulada Diésel 16m',
                  brand: 'JLG',
                  model: '450AJ Serie II 4x4',
                  category: 'boomlift',
                  three_d_model: 'boomlift'
                })}
              >
                <Eye size={16} /> Ver Pasaporte 3D en pantalla completa
              </button>
            </Reveal>
          </div>

          <Reveal className="passport-card-v2">
            <div className="machine-id">
              <span>MACHINE ID DIGITAL</span>
              <b>RM-MQN-000482</b>
              <i>● OPERATIVA EN RED</i>
            </div>
            <div className="passport-machine">
              <MachineryScene machineType="boomlift" progress={0.2} style={{ height: '220px' }} />
              <div>
                <span>PLATAFORMA ARTICULADA 3D</span>
                <b>JLG 450AJ · 15,7 m</b>
                <small>Año 2023 · Altura de trabajo 15,7 m · Tracción 4x4</small>
              </div>
            </div>
            <div className="passport-bar">
              <span>ESTADO DOCUMENTAL Y SEGURO</span>
              <b>100% AUDITADO</b>
            </div>
            <div className="passport-dates">
              <div>
                <span>ÚLTIMA INSPECCIÓN</span>
                <b>12/09/2026</b>
              </div>
              <div>
                <span>PRÓXIMA REVISIÓN</span>
                <b>12/12/2026</b>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ROLES BANNER SECTION */}
        <section className="provider-band">
          <Reveal>
            <div>
              <div className="kicker">07 — ECOSISTEMA B2B COMPLETO</div>
              <h2>
                Cuatro roles conectados.<br />
                <em>Cero fricción en obra.</em>
              </h2>
              <p>
                Cliente, Alquilador, Operador Logístico y Motor Central operan sobre la misma base de datos relacional y pasaportes 3D.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
                <button className="primary" onClick={() => setView('client')}>
                  Panel Constructora <ArrowRight size={15} />
                </button>
                <button className="outline" onClick={() => setView('provider')}>
                  Panel Alquilador <Building2 size={15} />
                </button>
                <button className="outline" onClick={() => setView('logistics')}>
                  Despacho Logística <Truck size={15} />
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="provider-notification">
              <div className="notif-top">
                <Zap />
                <span>DEMANDA ACTIVA EN TIEMPO REAL</span>
              </div>
              <h3>Plataforma Articulada 16 m</h3>
              <p>Marbella Obra Residencial · 15—25 OCT · ×2 Unidades</p>
              <div className="notif-grid">
                <div>
                  <span>DISPONIBILIDAD FLOTA</span>
                  <b>● Disponible en base GAM</b>
                </div>
                <div>
                  <span>RENTING SCORE</span>
                  <b>96/100 Recom.</b>
                </div>
              </div>
              <button onClick={() => setView('provider')}>
                Acceder y cotizar solicitud <ArrowRight size={14} />
              </button>
            </div>
          </Reveal>
        </section>
      </main>

      <footer>
        <button className="brand">
          <img src="/logo-mark.svg" alt="MAQNOW Logo" />
          <span>MAQ<span>NOW</span></span>
        </button>
        <span>Marketplace B2B de maquinaria profesional · Modelos 3D interactivos · Supabase PostgreSQL</span>
        <small>React 19 · Three.js / R3F · High Performance 3D · Esquema SQL en supabase/schema.sql</small>
      </footer>
    </div>
  );
}

function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'client' | 'provider' | 'logistics' | 'admin'
  const [passportMachine, setPassportMachine] = useState(null);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  const handleOpenPassport = (machine) => {
    setPassportMachine(machine);
  };

  const handleClosePassport = () => {
    setPassportMachine(null);
  };

  return (
    <>
      {/* Top Persistent Role Switcher Bar */}
      <RoleSwitcherBar
        currentView={view}
        setView={setView}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
      />

      {/* Main Views */}
      {view === 'landing' && (
        <Landing
          setView={setView}
          onOpenPassport={handleOpenPassport}
        />
      )}

      {view === 'client' && (
        <AppShell view={view} setView={setView} onOpenSupabaseModal={() => setShowSupabaseModal(true)}>
          <ClientDashboard onOpenPassport={handleOpenPassport} />
        </AppShell>
      )}

      {view === 'provider' && (
        <AppShell view={view} setView={setView} onOpenSupabaseModal={() => setShowSupabaseModal(true)}>
          <ProviderDashboard onOpenPassport={handleOpenPassport} />
        </AppShell>
      )}

      {view === 'logistics' && (
        <AppShell view={view} setView={setView} onOpenSupabaseModal={() => setShowSupabaseModal(true)}>
          <LogisticsDashboard />
        </AppShell>
      )}

      {view === 'admin' && (
        <AppShell view={view} setView={setView} onOpenSupabaseModal={() => setShowSupabaseModal(true)}>
          <AdminDashboard onOpenSupabaseModal={() => setShowSupabaseModal(true)} />
        </AppShell>
      )}

      {/* Global 3D Digital Passport Modal */}
      {passportMachine && (
        <DigitalPassportModal
          machine={passportMachine}
          onClose={handleClosePassport}
        />
      )}

      {/* Global Supabase Connection & SQL Modal */}
      {showSupabaseModal && (
        <SupabaseConnectModal
          onClose={() => setShowSupabaseModal(false)}
        />
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
