import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard, PlusCircle, ClipboardList, Tags, Truck, Building2, CalendarClock, Wrench, FileCheck2, Receipt, Star, BarChart3,
  Briefcase, Bell, MessageCircle, LogOut, Menu, X, Warehouse, Users, Bot, Percent, Settings, HardHat, ShieldCheck, UserPlus, UserCog, Headset, Calculator,
} from 'lucide-react';
import { actions, notificationsFor, providerById } from '../lib/store';
import { ROLES, areaOf, canOpen } from '../lib/roles';
import { go } from './ui';

export const NAV = {
  cliente: [
    ['', [['inicio', 'Inicio', LayoutDashboard], ['nueva', 'Nueva solicitud', PlusCircle]]],
    ['Contratación', [['solicitudes', 'Solicitudes', ClipboardList], ['ofertas', 'Ofertas', Tags], ['alquileres', 'Alquileres', Truck], ['obras', 'Obras', Building2]]],
    ['Seguimiento', [['entregas', 'Entregas y recogidas', CalendarClock], ['averias', 'Averías', Wrench], ['documentacion', 'Documentación', FileCheck2], ['facturas', 'Facturas', Receipt]]],
    ['Mi cuenta', [['favoritos', 'Maquinaria habitual', Star], ['informes', 'Informes', BarChart3], ['empresa', 'Mi empresa', Briefcase]]],
  ],
  proveedor: [
    ['', [['inicio', 'Inicio', LayoutDashboard]]],
    ['Comercial', [['solicitudes', 'Solicitudes', ClipboardList], ['ofertas', 'Mis ofertas', Tags], ['alquileres', 'Alquileres', Truck]]],
    ['Operación', [['flota', 'Mi maquinaria', Warehouse], ['entregas', 'Entregas y recogidas', CalendarClock], ['incidencias', 'Incidencias', Wrench]]],
    ['Mi empresa', [['facturacion', 'Facturación', Receipt], ['ficha', 'Ficha de proveedor', Briefcase]]],
  ],
  admin: [
    ['', [['inicio', 'Panel', LayoutDashboard], ['agente', 'Agente comercial', Bot]]],
    ['CRM', [['solicitudes', 'Solicitudes', ClipboardList], ['clientes', 'Clientes y riesgo', Users], ['proveedores', 'Proveedores', Warehouse]]],
    ['Operación', [['alquileres', 'Alquileres', Truck], ['incidencias', 'Incidencias', Wrench], ['comisiones', 'Comisiones y cobros', Percent]]],
    ['Sistema', [['usuarios', 'Usuarios y roles', UserCog], ['ajustes', 'Ajustes', Settings]]],
  ],
};
const ROLE_ICON = { cliente: HardHat, proveedor: Truck, agente: Headset, administracion: Calculator, superadmin: ShieldCheck };

export function AppShell({ s, page, children, onAssistant }) {
  const ss = s.session;
  const area = areaOf(ss.role);
  const [drawer, setDrawer] = useState(false);
  const [bell, setBell] = useState(false);
  useEffect(() => { setDrawer(false); setBell(false); }, [page]);
  useEffect(() => {
    if (!drawer && !bell) return undefined;
    const on = (e) => { if (e.key === 'Escape') { setDrawer(false); setBell(false); } };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [drawer, bell]);

  const notes = notificationsFor(s);
  const who = area === 'cliente' ? s.clients.find((c) => c.id === ss.clientId)?.name : area === 'proveedor' ? providerById(ss.providerId, s).name : 'Equipo MAQNOW';
  const counts = badgeCounts(s);
  const switchRole = (r) => { actions.switchRole(r); go('/app/inicio'); };
  // cada rol ve solo las páginas a las que puede entrar
  const groups = NAV[area].map(([group, items]) => [group, items.filter(([id]) => canOpen(ss.role, id))]).filter(([, items]) => items.length);

  return (
    <div className={`shell ${drawer ? 'drawer-open' : ''}`}>
      <aside className="side" id="menu-lateral" aria-label="Menú de la aplicación">
        <a className="brand" href="#/" aria-label="MAQNOW, ir a la web"><img src={`${import.meta.env.BASE_URL}logo-mark.svg`} alt="" width="28" height="28" />MAQ<span>NOW</span></a>
        <nav aria-label="Secciones">
          {groups.map(([group, items]) => (
            <div key={group || 'top'} className="side-group">
              {group && <span>{group}</span>}
              {items.map(([id, label, Icon]) => (
                <a key={id} href={`#/app/${id}`} className={`${page === id ? 'on' : ''} ${id === 'nueva' ? 'cta' : ''}`} aria-current={page === id ? 'page' : undefined}>
                  <Icon size={18} strokeWidth={1.7} aria-hidden /> {label}
                  {counts[id] > 0 && <em aria-label={`${counts[id]} pendientes`}>{counts[id]}</em>}
                </a>
              ))}
            </div>
          ))}
        </nav>

        {ss.guest && (
          <div className="role-switch">
            <span id="rol-demo">Ver la demo como</span>
            <div role="group" aria-labelledby="rol-demo">
              {Object.keys(ROLES).map((r) => {
                const I = ROLE_ICON[r];
                return <button key={r} aria-pressed={ss.role === r} className={ss.role === r ? 'on' : ''} onClick={() => switchRole(r)} title={ROLES[r].desc}><I size={16} aria-hidden /> {ROLES[r].label}</button>;
              })}
            </div>
          </div>
        )}
        <div className="side-user">
          <div className="avatar" aria-hidden>{(ss.name || '?').slice(0, 1).toUpperCase()}</div>
          <div><b>{ss.name}</b><small>{ROLES[ss.role].label} · {who}</small></div>
          <button className="icon-btn" onClick={() => { actions.logout(); go('/'); }} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={17} aria-hidden /></button>
        </div>
      </aside>
      <div className="scrim" onClick={() => setDrawer(false)} aria-hidden />

      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setDrawer(!drawer)} aria-label={drawer ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={drawer} aria-controls="menu-lateral">{drawer ? <X aria-hidden /> : <Menu aria-hidden />}</button>
          <span className="top-who">{ROLES[ss.role].label} <b>{who}</b></span>
          <span className="demo-pill" title="Precios, valoraciones y respuestas de proveedores son simulados">Demo, datos simulados</span>
          {ss.guest && <a className="btn btn-ghost btn-sm top-reg" href="#/registro"><UserPlus size={15} aria-hidden /> Crear cuenta</a>}
          <button className="icon-btn" onClick={onAssistant} aria-label="Abrir asistente" title="Asistente"><MessageCircle size={20} aria-hidden /></button>
          <div className="bell-wrap">
            <button className="icon-btn" onClick={() => setBell(!bell)} aria-label={`Avisos: ${notes.length}`} aria-expanded={bell} aria-haspopup="true"><Bell size={20} aria-hidden />{notes.length > 0 && <i aria-hidden>{notes.length}</i>}</button>
            {bell && (
              <div className="bell-menu" role="region" aria-label="Avisos">
                <b>Avisos</b>
                {notes.length === 0 && <p>No tienes avisos pendientes.</p>}
                {notes.slice(0, 8).map((n, i) => <a key={i} href={`#${n.href}`} className={`tone-${n.tone}`}>{n.text}</a>)}
              </div>
            )}
          </div>
        </header>
        <main className="content" id="contenido" tabIndex={-1} key={`${ss.role}-${page}`}>{children}</main>
      </div>
    </div>
  );
}

function badgeCounts(s) {
  const ss = s.session;
  if (areaOf(ss.role) === 'cliente') {
    return {
      solicitudes: s.requests.filter((r) => r.clientId === ss.clientId && ['buscando', 'ofertas'].includes(r.status)).length,
      alquileres: s.rentals.filter((r) => r.clientId === ss.clientId && r.status !== 'finalizada').length,
      averias: s.incidents.filter((i) => i.status !== 'resuelta' && s.rentals.some((r) => r.id === i.rentalId && r.clientId === ss.clientId)).length,
    };
  }
  if (areaOf(ss.role) === 'proveedor') {
    return {
      solicitudes: s.requests.filter((r) => ['buscando', 'ofertas'].includes(r.status) && r.contacted.some((c) => c.providerId === ss.providerId) && !r.offers.some((o) => o.providerId === ss.providerId)).length,
      incidencias: s.incidents.filter((i) => i.status !== 'resuelta' && s.rentals.some((r) => r.id === i.rentalId && r.providerId === ss.providerId)).length,
    };
  }
  return {
    solicitudes: s.requests.filter((r) => ['buscando', 'ofertas'].includes(r.status)).length,
    incidencias: s.incidents.filter((i) => i.status !== 'resuelta').length,
  };
}
