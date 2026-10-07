import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard, PlusCircle, Plus, ClipboardList, Tags, Truck, Building2, CalendarClock, Wrench, FileCheck2, Receipt, Star, BarChart3,
  Briefcase, Bell, MessageCircle, LogOut, Menu, X, Warehouse, Users, Bot, Percent, Settings, HardHat, ShieldCheck, UserPlus, UserCog, Headset, Calculator,
  Scale, Search, PanelLeftClose, PanelLeftOpen, ChevronDown, Check, CornerDownLeft,
} from 'lucide-react';
import { Logo } from './Logo';
import { actions, itemsText, notificationsFor, providerById } from '../lib/store';
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
// las fichas de detalle marcan su listado en el menú
const PARENT = { solicitud: 'solicitudes', alquiler: 'alquileres' };
// accesos de la barra inferior en móvil, por orden de preferencia
const TABS = {
  cliente: ['inicio', 'solicitudes', 'alquileres', 'facturas'],
  proveedor: ['inicio', 'solicitudes', 'ofertas', 'alquileres'],
  admin: ['inicio', 'solicitudes', 'alquileres', 'proveedores', 'incidencias', 'comisiones'],
};
const KEY = 'maqnow-nav';
const readCollapsed = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };

export function AppShell({ s, page, children, onAssistant }) {
  const ss = s.session;
  const area = areaOf(ss.role);
  const current = PARENT[page] || page;
  const [drawer, setDrawer] = useState(false);
  const [open, setOpen] = useState(null); // 'bell' | 'user' | 'search'
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const topRef = useRef(null);

  useEffect(() => { setDrawer(false); setOpen(null); }, [page, ss.role]);
  useEffect(() => {
    const on = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => (o === 'search' ? null : 'search')); }
      else if (e.key === 'Escape') { setDrawer(false); setOpen((o) => (o === 'search' ? o : null)); }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);
  // los desplegables se cierran al pulsar fuera
  useEffect(() => {
    if (open !== 'bell' && open !== 'user') return undefined;
    const on = (e) => { if (!topRef.current?.contains(e.target)) setOpen(null); };
    document.addEventListener('pointerdown', on);
    return () => document.removeEventListener('pointerdown', on);
  }, [open]);

  const toggleCollapsed = () => {
    const v = !collapsed;
    setCollapsed(v);
    try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* sin almacenamiento, no se recuerda */ }
  };

  const notes = notificationsFor(s);
  const who = area === 'cliente' ? s.clients.find((c) => c.id === ss.clientId)?.name : area === 'proveedor' ? providerById(ss.providerId, s).name : 'Equipo MAQNOW';
  const counts = badgeCounts(s);
  const switchRole = (r) => { actions.switchRole(r); go('/app/inicio'); };
  // cada rol ve solo las páginas a las que puede entrar
  const groups = NAV[area].map(([group, items]) => [group, items.filter(([id]) => canOpen(ss.role, id))]).filter(([, items]) => items.length);
  const flat = groups.flatMap(([, items]) => items);
  const canNew = flat.some(([id]) => id === 'nueva');
  const tabs = TABS[area].map((id) => flat.find(([x]) => x === id)).filter(Boolean).slice(0, canNew ? 3 : 4);
  const initial = (ss.name || '?').slice(0, 1).toUpperCase();

  return (
    <div className={`app ${drawer ? 'drawer-open' : ''} ${collapsed ? 'nav-collapsed' : ''}`}>
      <header className="app-top" ref={topRef}>
        <a className="brand" href="#/app/inicio" aria-label="MAQNOW, inicio"><Logo /></a>

        <button className="app-search" onClick={() => setOpen('search')} aria-haspopup="dialog">
          <Search size={17} aria-hidden /><span>Buscar solicitud, alquiler o página</span><kbd aria-hidden>Ctrl K</kbd>
        </button>

        <div className="app-actions">
          <span className="demo-pill" title="Precios, valoraciones y respuestas de proveedores son simulados">Demo</span>
          <button className="app-ico app-ico-search" onClick={() => setOpen('search')} aria-label="Buscar"><Search size={20} aria-hidden /></button>
          <button className="app-ico" onClick={onAssistant} aria-label="Abrir asistente" title="Asistente"><MessageCircle size={20} aria-hidden /></button>
          <div className="app-pop-wrap">
            <button className="app-ico" onClick={() => setOpen(open === 'bell' ? null : 'bell')} aria-label={`Avisos: ${notes.length}`} aria-expanded={open === 'bell'} aria-haspopup="true"><Bell size={20} aria-hidden />{notes.length > 0 && <i aria-hidden>{notes.length}</i>}</button>
            {open === 'bell' && (
              <div className="app-pop bell-menu" role="region" aria-label="Avisos">
                <b>Avisos</b>
                {notes.length === 0 && <p>No tienes avisos pendientes.</p>}
                {notes.slice(0, 8).map((n, i) => <a key={i} href={`#${n.href}`} className={`tone-${n.tone}`}>{n.text}</a>)}
              </div>
            )}
          </div>
          <div className="app-pop-wrap">
            <button className="app-user" onClick={() => setOpen(open === 'user' ? null : 'user')} aria-label={`Cuenta de ${ss.name}`} aria-expanded={open === 'user'} aria-haspopup="true">
              <span className="avatar" aria-hidden>{initial}</span>
              <span className="app-user-txt"><b>{ss.name}</b><small>{ROLES[ss.role].label}</small></span>
              <ChevronDown size={16} aria-hidden />
            </button>
            {open === 'user' && (
              <div className="app-pop user-menu" role="region" aria-label="Cuenta">
                <div className="user-menu-head"><b>{ss.name}</b><small>{ROLES[ss.role].label} · {who}</small></div>
                {ss.guest && (
                  <div className="user-menu-roles" role="group" aria-labelledby="rol-demo">
                    <span id="rol-demo">Ver la demo como</span>
                    {Object.keys(ROLES).map((r) => {
                      const I = ROLE_ICON[r];
                      return <button key={r} aria-pressed={ss.role === r} className={ss.role === r ? 'on' : ''} onClick={() => switchRole(r)} title={ROLES[r].desc}><I size={16} aria-hidden /> {ROLES[r].label}{ss.role === r && <Check size={16} aria-hidden />}</button>;
                    })}
                  </div>
                )}
                {ss.guest && <a className="user-menu-item" href="#/registro"><UserPlus size={16} aria-hidden /> Crear cuenta</a>}
                <a className="user-menu-item" href="#/legal/condiciones"><Scale size={16} aria-hidden /> Legal y privacidad</a>
                <button className="user-menu-item" onClick={() => { actions.logout(); go('/'); }}><LogOut size={16} aria-hidden /> Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className="app-nav" id="menu-lateral" aria-label="Menú de la aplicación">
        <div className="nav-drawer-head"><b>Menú</b><button className="nav-close" onClick={() => setDrawer(false)} aria-label="Cerrar menú"><X size={20} aria-hidden /></button></div>
        {canNew && (
          <a className={`btn btn-primary app-new ${page === 'nueva' ? 'on' : ''}`} href="#/app/nueva" aria-current={page === 'nueva' ? 'page' : undefined} title="Nueva solicitud">
            <Plus size={18} aria-hidden /> <span>Nueva solicitud</span>
          </a>
        )}
        <nav aria-label="Secciones">
          {groups.map(([group, items]) => {
            const list = items.filter(([id]) => id !== 'nueva');
            if (!list.length) return null;
            return (
              <div key={group || 'top'} className="nav-group">
                {group && <span>{group}</span>}
                {list.map(([id, label, Icon]) => (
                  <a key={id} href={`#/app/${id}`} className={current === id ? 'on' : ''} aria-current={current === id ? 'page' : undefined} title={collapsed ? label : undefined}>
                    <Icon size={18} strokeWidth={1.8} aria-hidden /> <span>{label}</span>
                    {counts[id] > 0 && <em aria-label={`${counts[id]} pendientes`}>{counts[id]}</em>}
                  </a>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="app-nav-foot">
          <div className="nav-org" title={who}><span aria-hidden>{(who || '?').slice(0, 1).toUpperCase()}</span><div><b>{who}</b><small>{ROLES[ss.role].label}{ss.guest ? ' · invitado' : ''}</small></div></div>
          <button className="nav-collapse" onClick={toggleCollapsed} aria-label={collapsed ? 'Ampliar el menú' : 'Reducir el menú'} aria-pressed={collapsed} title={collapsed ? 'Ampliar el menú' : 'Reducir el menú'}>{collapsed ? <PanelLeftOpen size={18} aria-hidden /> : <PanelLeftClose size={18} aria-hidden />}</button>
        </div>
      </aside>
      <div className="app-scrim" onClick={() => setDrawer(false)} aria-hidden />

      <main className="content" id="contenido" tabIndex={-1} key={`${ss.role}-${page}`}>{children}</main>

      <nav className="app-tabs" aria-label="Accesos rápidos">
        {tabs.slice(0, canNew ? 2 : 4).map(([id, label, Icon]) => <TabLink key={id} id={id} label={label} Icon={Icon} current={current} count={counts[id]} />)}
        {canNew && <a className="app-tab-new" href="#/app/nueva" aria-label="Nueva solicitud" aria-current={page === 'nueva' ? 'page' : undefined}><Plus size={24} aria-hidden /></a>}
        {canNew && tabs.slice(2, 3).map(([id, label, Icon]) => <TabLink key={id} id={id} label={label} Icon={Icon} current={current} count={counts[id]} />)}
        <button onClick={() => setDrawer(true)} aria-label="Abrir el menú completo" aria-expanded={drawer} aria-controls="menu-lateral"><Menu size={21} aria-hidden /><span>Más</span></button>
      </nav>

      {open === 'search' && <Palette s={s} pages={flat} onClose={() => setOpen(null)} />}
    </div>
  );
}

function TabLink({ id, label, Icon, current, count }) {
  return (
    <a href={`#/app/${id}`} className={current === id ? 'on' : ''} aria-current={current === id ? 'page' : undefined}>
      <Icon size={21} strokeWidth={1.8} aria-hidden /><span>{label}</span>{count > 0 && <em aria-label={`${count} pendientes`}>{count}</em>}
    </a>
  );
}

// Buscador global: páginas del menú, solicitudes y alquileres visibles para el rol.
function Palette({ s, pages, onClose }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef(null);
  const list = useRef(null);
  const ss = s.session;
  const area = areaOf(ss.role);

  const all = useMemo(() => {
    const reqs = s.requests.filter((r) => (area === 'cliente' ? r.clientId === ss.clientId : area === 'proveedor' ? r.contacted.some((c) => c.providerId === ss.providerId) : true));
    const rents = s.rentals.filter((r) => (area === 'cliente' ? r.clientId === ss.clientId : area === 'proveedor' ? r.providerId === ss.providerId : true));
    return [
      ...pages.map(([id, label, Icon]) => ({ key: `p-${id}`, group: 'Páginas', label, hint: '', href: `/app/${id}`, Icon })),
      ...reqs.map((r) => ({ key: `r-${r.id}`, group: 'Solicitudes', label: itemsText(r.items), hint: `${r.id} · ${r.municipio}`, href: `/app/solicitud/${r.id}`, Icon: ClipboardList })),
      ...(area === 'admin' ? [] : rents.map((r) => ({ key: `a-${r.id}`, group: 'Alquileres', label: itemsText(r.items), hint: `${r.id} · ${r.municipio}`, href: `/app/alquiler/${r.id}`, Icon: Truck }))),
    ];
  }, [s.requests, s.rentals, pages, area, ss.clientId, ss.providerId]);

  const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const results = useMemo(() => {
    const t = norm(q.trim());
    const hit = t ? all.filter((x) => norm(`${x.label} ${x.hint}`).includes(t)) : all.filter((x) => x.group === 'Páginas');
    return hit.slice(0, 12);
  }, [q, all]);

  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }); }, [sel]);

  const pick = (x) => { if (!x) return; onClose(); go(x.href); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(results[sel]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'Tab') { e.preventDefault(); }
  };

  let last = '';
  return (
    <div className="palette-wrap" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Buscar">
        <div className="palette-in">
          <Search size={19} aria-hidden />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Buscar solicitud, alquiler o página" aria-label="Buscar solicitud, alquiler o página"
            role="combobox" aria-expanded="true" aria-controls="palette-list" aria-activedescendant={results[sel] ? `opt-${results[sel].key}` : undefined} autoComplete="off" spellCheck={false} />
          <button className="palette-x" onClick={onClose} aria-label="Cerrar el buscador">Esc</button>
        </div>
        <div className="palette-list" id="palette-list" role="listbox" aria-label="Resultados" ref={list}>
          {results.length === 0 && <p className="palette-empty">Nada coincide con “{q}”. Prueba con el número de solicitud o el tipo de máquina.</p>}
          {results.map((x, i) => {
            const head = x.group !== last ? x.group : null;
            last = x.group;
            return (
              <React.Fragment key={x.key}>
                {head && <div className="palette-group" role="presentation">{head}</div>}
                <div id={`opt-${x.key}`} role="option" aria-selected={i === sel} className="palette-opt" onMouseEnter={() => setSel(i)} onClick={() => pick(x)}>
                  <x.Icon size={17} strokeWidth={1.8} aria-hidden />
                  <span>{x.label}</span>
                  {x.hint && <small>{x.hint}</small>}
                  {i === sel && <CornerDownLeft size={15} aria-hidden />}
                </div>
              </React.Fragment>
            );
          })}
        </div>
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
