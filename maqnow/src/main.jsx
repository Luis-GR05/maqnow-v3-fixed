import React, { Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MessageCircle, Lock } from 'lucide-react';
import './styles.css';
import { actions, initAuth, useStore } from './lib/store';
import { ROLES, areaOf, canOpen } from './lib/roles';
import { pageTitle } from './data/site';
import { Landing } from './pages/Landing';

// La web pública carga de inmediato; el área privada, el acceso y el asistente se descargan
// solo cuando hacen falta (así la portada pesa menos y pinta antes).
const AppShell = lazy(() => import('./components/AppShell').then((m) => ({ default: m.AppShell })));
const Auth = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Auth })));
const Assistant = lazy(() => import('./components/Assistant').then((m) => ({ default: m.Assistant })));
const AREAS = {
  cliente: lazy(() => import('./pages/Client').then((m) => ({ default: m.ClientPages }))),
  proveedor: lazy(() => import('./pages/Provider').then((m) => ({ default: m.ProviderPages }))),
  admin: lazy(() => import('./pages/Admin').then((m) => ({ default: m.AdminPages }))),
};

// Rutas por hash (#/app/alquileres): funcionan en cualquier hosting estático sin configurar nada.
// Los enlaces #seccion de la landing no son rutas: el navegador hace scroll hasta la sección.
const readRoute = () => {
  const h = window.location.hash;
  return h.startsWith('#/') ? h.slice(2).split('/').filter(Boolean).map(decodeURIComponent) : [];
};
function useRoute() {
  const [parts, setParts] = useState(readRoute);
  useEffect(() => {
    const on = () => {
      setParts(readRoute());
      if (window.location.hash.startsWith('#/') || !window.location.hash) window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return parts;
}

const Loading = () => <div className="loading" role="status"><span className="spinner" aria-hidden />Cargando…</div>;

function NoAccess({ role }) {
  return (
    <div className="empty noaccess">
      <Lock size={30} aria-hidden />
      <h1>No tienes permiso para ver esta página</h1>
      <p>Tu rol es {ROLES[role].label}. Si necesitas acceso, pídeselo a un superadmin.</p>
      <a className="btn btn-primary" href="#/app/inicio">Volver al inicio</a>
    </div>
  );
}

function App() {
  const s = useStore();
  const [section, a, b] = useRoute();
  const [assistant, setAssistant] = useState(false);
  const [assistantUsed, setAssistantUsed] = useState(false);
  const openAssistant = () => { setAssistantUsed(true); setAssistant(true); };

  // Reloj de la demo: revela las respuestas simuladas de los proveedores (parado si la pestaña no se ve)
  useEffect(() => {
    const t = setInterval(() => { if (!document.hidden) actions.tick(); }, 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { initAuth(); }, []);

  // El área privada necesita sesión (registrada o de invitado)
  const needsLogin = section === 'app' && !s.session;
  useEffect(() => { if (needsLogin) window.location.hash = '/acceso'; }, [needsLogin]);

  const isApp = section === 'app' && s.session;
  const isAuth = section === 'acceso' || section === 'registro';
  const page = a || 'inicio';
  const area = isApp ? areaOf(s.session.role) : null;

  // Título de la pestaña y foco: al cambiar de pantalla, el lector de pantalla empieza en el contenido
  useEffect(() => {
    document.title = pageTitle(section, isApp ? page : a, area);
    let robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute('content', section ? 'noindex,nofollow' : 'index,follow,max-image-preview:large');
    if (section) requestAnimationFrame(() => document.getElementById('contenido')?.focus({ preventScroll: true }));
  }, [section, a, b, area]);

  let view;
  if (isApp) {
    const Pages = AREAS[area];
    view = (
      <AppShell s={s} page={page} onAssistant={openAssistant}>
        {canOpen(s.session.role, page) ? <Suspense fallback={<Loading />}><Pages s={s} page={page} id={b} onAssistant={openAssistant} /></Suspense> : <NoAccess role={s.session.role} />}
      </AppShell>
    );
  } else if (isAuth) {
    view = <Auth key={section + (a || '')} mode={section} preset={a} />;
  } else if (needsLogin) {
    view = null;
  } else {
    view = <Landing onAssistant={openAssistant} />;
  }

  return (
    <>
      <a className="skip-link" href="#contenido" onClick={(e) => { e.preventDefault(); document.getElementById('contenido')?.focus(); document.getElementById('contenido')?.scrollIntoView(); }}>Saltar al contenido</a>
      <Suspense fallback={<Loading />}>{view}</Suspense>
      {!assistant && !isAuth && section !== 'app' && (
        <button className="assistant-fab" onClick={openAssistant} aria-label="Abrir asistente"><MessageCircle size={20} aria-hidden /> <span>Asistente</span></button>
      )}
      {assistantUsed && <Suspense fallback={null}><Assistant open={assistant} onClose={() => setAssistant(false)} /></Suspense>}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
