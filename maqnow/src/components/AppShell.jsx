import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard, PlusCircle, ClipboardList, Tags, Truck, Building2, CalendarClock, Wrench, FileCheck2, Receipt, Star, BarChart3,
  Briefcase, Bell, MessageCircle, LogOut, Menu, X, Warehouse, Users, Bot, Percent, Settings, HardHat, ShieldCheck, UserPlus,
} from 'lucide-react';
import { actions, notificationsFor, providerById } from '../lib/store';
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
    ['Mi empresa', [['facturacion', 'Facturación y comisiones', Receipt], ['ficha', 'Ficha de proveedor', Briefcase]]],
  ],
  admin: [
    ['', [['inicio', 'Panel', LayoutDashboard], ['agente', 'Agente comercial', Bot]]],
    ['CRM', [['solicitudes', 'Solicitudes', ClipboardList], ['clientes', 'Clientes y riesgo', Users], ['proveedores', 'Proveedores', Warehouse]]],
    ['Operación', [['alquileres', 'Alquileres', Truck], ['incidencias', 'Incidencias', Wrench], ['comisiones', 'Comisiones y cobros', Percent]]],
    ['Sistema', [['ajustes', 'Ajustes', Settings]]],
  ],
};
const ROLE_LABEL = { cliente: 'Cliente', proveedor: 'Proveedor', admin: 'Equipo MAQNOW' };
const ROLE_ICON = { cliente: HardHat, proveedor: Truck, admin: ShieldCheck };

export function AppShell({ s, page, children, onAssistant }) {
  const ss = s.session;
  const [drawer, setDrawer] = useState(false);
  const [bell, setBell] = useState(false);
  useEffect(() => { setDrawer(false); setBell(false); }, [page]);

  const notes = notificationsFor(s);
  const who = ss.role === 'cliente' ? s.clients.find((c) => c.id === ss.clientId)?.name : ss.role === 'proveedor' ? providerById(ss.providerId, s).name : 'Operaciones MAQNOW';
  const counts = badgeCounts(s);
  const switchRole = (r) => { actions.switchRole(r); go('/app/inicio'); };

  return (
    <div className={`shell ${drawer ? 'drawer-open' : ''}`}>
      <aside className="side">
        <a className="brand" href="#/"><img src={`${import.meta.env.BASE_URL}logo-mark.svg`} alt="" />MAQ<span>NOW</span></a>
        <nav>
          {NAV[ss.role].map(([group, items]) => (
            <div key={group || 'top'} className="side-group">
              {group && <span>{group}</span>}
              {items.map(([id, label, Icon]) => (
                <a key={id} href={`#/app/${id}`} className={`${page === id ? 'on' : ''} ${id === 'nueva' ? 'cta' : ''}`} aria-current={page === id ? 'page' : undefined}>
                  <Icon size={18} strokeWidth={1.7} /> {label}
                  {counts[id] > 0 && <em>{counts[id]}</em>}
                </a>
              ))}
            </div>
          ))}
        </nav>

        {ss.guest && (
          <div className="role-switch">
            <span>Vista de demostración</span>
            <div>
              {Object.keys(ROLE_LABEL).map((r) => {
                const I = ROLE_ICON[r];
                return <button key={r} className={ss.role === r ? 'on' : ''} onClick={() => switchRole(r)} title={ROLE_LABEL[r]}><I size={16} /> {ROLE_LABEL[r]}</button>;
              })}
            </div>
          </div>
        )}
        <div className="side-user">
          <div className="avatar">{(ss.name || '?').slice(0, 1).toUpperCase()}</div>
          <div><b>{ss.name}</b><small>{who}</small></div>
          <button className="icon-btn" onClick={() => { actions.logout(); go('/'); }} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={17} /></button>
        </div>
      </aside>
      <div className="scrim" onClick={() => setDrawer(false)} />

      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setDrawer(!drawer)} aria-label="Menú">{drawer ? <X /> : <Menu />}</button>
          <span className="top-who">{ROLE_LABEL[ss.role]} <b>{who}</b></span>
          <span className="demo-pill" title="Precios, valoraciones y respuestas de proveedores son simulados">Demo, datos simulados</span>
          {ss.guest && <a className="btn btn-ghost btn-sm top-reg" href="#/registro"><UserPlus size={15} /> Crear cuenta</a>}
          <button className="icon-btn" onClick={onAssistant} aria-label="Abrir asistente" title="Asistente"><MessageCircle size={20} /></button>
          <div className="bell-wrap">
            <button className="icon-btn" onClick={() => setBell(!bell)} aria-label={`Avisos: ${notes.length}`} aria-expanded={bell}><Bell size={20} />{notes.length > 0 && <i>{notes.length}</i>}</button>
            {bell && (
              <div className="bell-menu">
                <b>Avisos</b>
                {notes.length === 0 && <p>No tienes avisos pendientes.</p>}
                {notes.slice(0, 8).map((n, i) => <a key={i} href={`#${n.href}`} className={`tone-${n.tone}`}>{n.text}</a>)}
              </div>
            )}
          </div>
        </header>
        <div className="content" key={`${ss.role}-${page}`}>{children}</div>
      </div>
    </div>
  );
}

function badgeCounts(s) {
  const ss = s.session;
  if (ss.role === 'cliente') {
    return {
      solicitudes: s.requests.filter((r) => r.clientId === ss.clientId && ['buscando', 'ofertas'].includes(r.status)).length,
      alquileres: s.rentals.filter((r) => r.clientId === ss.clientId && r.status !== 'finalizada').length,
      averias: s.incidents.filter((i) => i.status !== 'resuelta' && s.rentals.some((r) => r.id === i.rentalId && r.clientId === ss.clientId)).length,
    };
  }
  if (ss.role === 'proveedor') {
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
