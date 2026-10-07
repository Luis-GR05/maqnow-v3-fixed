import React, { useEffect, useState } from 'react';
import { RotateCw, Home, WifiOff, Lock } from 'lucide-react';
import { LogoMark, Logo } from './Logo';

// Pantalla de carga: el símbolo se abre y se cierra (la M y la W se encuentran en el centro)
export function Loading({ full = false, label = 'Cargando' }) {
  return (
    <div className={`mq-loader ${full ? 'full' : ''}`} role="status">
      <LogoMark />
      <span className="mq-loader-bar" aria-hidden />
      <span>{label}…</span>
    </div>
  );
}

// Pantalla de error común: 404, sin permiso, fallo inesperado
export function ErrorScreen({ code, title, children, actions, page = false, icon: Icon }) {
  const Body = page ? 'main' : 'div';
  return (
    <div className={`err ${page ? 'err-page' : ''}`}>
      {page && <header><a className="brand" href="#/" aria-label="MAQNOW, inicio"><Logo /></a></header>}
      <Body className="err-body" id={page ? 'contenido' : undefined} tabIndex={page ? -1 : undefined}>
        <p className="err-code" aria-hidden>{Icon ? <Icon size={64} strokeWidth={1.6} /> : code}</p>
        <span className="err-tape" aria-hidden />
        <h1>{title}</h1>
        <div className="err-text">{children}</div>
        <div className="err-actions">{actions}</div>
      </Body>
    </div>
  );
}

export function NotFound({ inApp = false }) {
  return (
    <ErrorScreen code="404" title="Aquí no hay ninguna máquina" page={!inApp}
      actions={<><a className="btn btn-primary" href={inApp ? '#/app/inicio' : '#/'}><Home size={17} aria-hidden /> {inApp ? 'Ir al inicio' : 'Volver a la portada'}</a>{!inApp && <a className="btn btn-glass" href="#/acceso">Entrar en mi área</a>}</>}>
      <p>La página que buscas no existe o ha cambiado de sitio. Comprueba la dirección o vuelve al inicio.</p>
    </ErrorScreen>
  );
}

export function NoAccess({ roleLabel }) {
  return (
    <ErrorScreen icon={Lock} title="No tienes permiso para ver esta página" actions={<a className="btn btn-primary" href="#/app/inicio"><Home size={17} aria-hidden /> Ir al inicio</a>}>
      <p>Tu rol es {roleLabel}. Si necesitas acceso, pídeselo a un superadmin.</p>
    </ErrorScreen>
  );
}

// Recoge cualquier error al pintar para que la persona no se quede ante una pantalla en blanco.
export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }

  static getDerivedStateFromError(error) { return { error }; }

  componentDidCatch(error, info) { console.error('[MAQNOW] Error al pintar la pantalla', error, info?.componentStack); }

  componentDidMount() { window.addEventListener('hashchange', this.reset); }

  componentWillUnmount() { window.removeEventListener('hashchange', this.reset); }

  // al cambiar de página se vuelve a intentar
  reset = () => { if (this.state.error) this.setState({ error: null }); };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    // tras publicar una versión nueva, los trozos antiguos de la aplicación dejan de existir
    const chunk = /dynamically imported module|Importing a module script failed|Failed to fetch|ChunkLoadError/i.test(String(error?.message || error));
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    return (
      <ErrorScreen page={!this.props.inApp} code={offline ? undefined : chunk ? 'Uy' : '500'} icon={offline ? WifiOff : undefined}
        title={offline ? 'Te has quedado sin conexión' : chunk ? 'Hay una versión nueva de MAQNOW' : 'Algo se ha roto en esta pantalla'}
        actions={<><button className="btn btn-primary" onClick={() => window.location.reload()}><RotateCw size={17} aria-hidden /> {chunk && !offline ? 'Actualizar' : 'Volver a intentarlo'}</button><a className={`btn ${this.props.inApp ? 'btn-ghost' : 'btn-glass'}`} href={this.props.inApp ? '#/app/inicio' : '#/'} onClick={this.reset}>Ir al inicio</a></>}>
        {offline ? <p>No hemos podido cargar esta parte. Cuando recuperes la conexión, vuelve a intentarlo: tus datos siguen guardados.</p>
          : chunk ? <p>Hemos publicado cambios mientras tenías la web abierta. Actualiza la página para seguir; no pierdes nada de lo que tenías guardado.</p>
            : <p>Ha fallado algo por nuestra parte, no por la tuya. Vuelve a intentarlo y, si se repite, escríbenos con el detalle de abajo.</p>}
        {!chunk && !offline && <details><summary>Detalle técnico</summary><code>{String(error?.message || error)}</code></details>}
      </ErrorScreen>
    );
  }
}

// Aviso discreto mientras no hay conexión
export function OfflineBar() {
  const [off, setOff] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  useEffect(() => {
    const on = () => setOff(!navigator.onLine);
    window.addEventListener('online', on);
    window.addEventListener('offline', on);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', on); };
  }, []);
  if (!off) return null;
  return <div className="offline-bar" role="status"><WifiOff size={16} aria-hidden /> Sin conexión. Lo que hagas se guarda en este dispositivo.</div>;
}
