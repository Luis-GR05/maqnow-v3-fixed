import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MessageCircle } from 'lucide-react';
import './styles.css';
import { actions, useStore } from './lib/store';
import { Assistant } from './components/Assistant';
import { AppShell } from './components/AppShell';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { ClientPages } from './pages/Client';
import { ProviderPages } from './pages/Provider';
import { AdminPages } from './pages/Admin';

// Rutas por hash (#/app/alquileres): funcionan en cualquier hosting estático sin configurar nada.
// Los enlaces #seccion de la landing no son rutas: el navegador hace scroll hasta la sección.
function useRoute() {
  const read = () => {
    const h = window.location.hash;
    return h.startsWith('#/') ? h.slice(2).split('/').filter(Boolean).map(decodeURIComponent) : [];
  };
  const [parts, setParts] = useState(read);
  useEffect(() => {
    const on = () => {
      setParts(read());
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
  const openAssistant = () => setAssistant(true);

  // Reloj de la demo: va revelando las respuestas simuladas de los proveedores
  useEffect(() => {
    const t = setInterval(() => actions.tick(), 1000);
    return () => clearInterval(t);
  }, []);

  // El área privada necesita sesión (registrada o de invitado)
  const needsLogin = section === 'app' && !s.session;
  useEffect(() => { if (needsLogin) window.location.hash = '/acceso'; }, [needsLogin]);

  let view;
  if (section === 'app' && s.session) {
    const page = a || 'inicio';
    const Pages = { cliente: ClientPages, proveedor: ProviderPages, admin: AdminPages }[s.session.role];
    view = <AppShell s={s} page={page} onAssistant={openAssistant}><Pages s={s} page={page} id={b} onAssistant={openAssistant} /></AppShell>;
  } else if (section === 'acceso' || section === 'registro') {
    view = <Auth key={section + (a || '')} mode={section} preset={a} />;
  } else if (needsLogin) {
    view = null;
  } else {
    view = <Landing onAssistant={openAssistant} />;
  }

  return (
    <>
      {view}
      {!assistant && section !== 'acceso' && section !== 'registro' && section !== 'app' && (
        <button className="assistant-fab" onClick={openAssistant} aria-label="Abrir asistente"><MessageCircle size={20} /> <span>Asistente</span></button>
      )}
      <Assistant open={assistant} onClose={() => setAssistant(false)} />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
