import React, { Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MessageCircle } from 'lucide-react';
// Tipografías alojadas en la propia web (solo el juego de caracteres latino): sin terceros ni bloqueo del pintado
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-500.css';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/barlow/latin-700.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/barlow-condensed/latin-800.css';
import './styles.css';
import { actions, initAuth, useStore } from './lib/store';
import { ROLES, areaOf, canOpen } from './lib/roles';
import { isKnownPage, pageTitle } from './data/site';
import { ErrorBoundary, Loading, NoAccess, NotFound, OfflineBar } from './components/Screens';
import { Landing } from './pages/Landing';

// La web pública carga de inmediato; el área privada, el acceso y el asistente se descargan
// solo cuando hacen falta (así la portada pesa menos y pinta antes).
const AppShell = lazy(() => import('./components/AppShell').then((m) => ({ default: m.AppShell })));
const Auth = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Auth })));
const Assistant = lazy(() => import('./components/Assistant').then((m) => ({ default: m.Assistant })));
const Legal = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Legal })));
const CookieBanner = lazy(() => import('./components/CookieBanner').then((m) => ({ default: m.CookieBanner })));
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
  // el aviso de cookies se carga después de pintar la página, para no retrasarla
  const [late, setLate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLate(true), 1200); return () => clearTimeout(t); }, []);

  // El área privada necesita sesión (registrada o de invitado)
  const needsLogin = section === 'app' && !s.session;
  useEffect(() => { if (needsLogin) window.location.hash = '/acceso'; }, [needsLogin]);

  const isApp = section === 'app' && s.session;
  const isAuth = section === 'acceso' || section === 'registro';
  const isLegal = section === 'legal';
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
        <ErrorBoundary inApp key={page}>
          {!isKnownPage(area, page) ? <NotFound inApp />
            : canOpen(s.session.role, page) ? <Suspense fallback={<Loading />}><Pages s={s} page={page} id={b} onAssistant={openAssistant} /></Suspense>
              : <NoAccess roleLabel={ROLES[s.session.role].label} />}
        </ErrorBoundary>
      </AppShell>
    );
  } else if (isAuth) {
    view = <Auth key={section + (a || '')} mode={section} preset={a} />;
  } else if (isLegal) {
    view = <Legal doc={a} />;
  } else if (needsLogin) {
    view = null;
  } else if (section) {
    view = <NotFound />;
  } else {
    view = <Landing onAssistant={openAssistant} />;
  }

  return (
    <>
      <a className="skip-link" href="#contenido" onClick={(e) => { e.preventDefault(); document.getElementById('contenido')?.focus(); document.getElementById('contenido')?.scrollIntoView(); }}>Saltar al contenido</a>
      <OfflineBar />
      <ErrorBoundary><Suspense fallback={<Loading full />}>{view}</Suspense></ErrorBoundary>
      {!assistant && !section && (
        <button className="assistant-fab" onClick={openAssistant} aria-label="Abrir asistente"><MessageCircle size={20} aria-hidden /> <span>Asistente</span></button>
      )}
      {assistantUsed && <Suspense fallback={null}><Assistant open={assistant} onClose={() => setAssistant(false)} /></Suspense>}
      {late && <Suspense fallback={null}><CookieBanner /></Suspense>}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);

// La pantalla de carga de index.html se retira en cuanto la aplicación ha pintado
requestAnimationFrame(() => {
  const splash = document.getElementById('splash');
  if (!splash) return;
  splash.classList.add('out');
  setTimeout(() => splash.remove(), 320);
});
