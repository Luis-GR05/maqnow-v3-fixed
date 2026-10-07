import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { ArrowLeft, HardHat, Truck, ShieldCheck, Eye, EyeOff, Check, Headset, Calculator } from 'lucide-react';
import { FAMILIES, PROVINCES } from '../data/catalog';
import { IMG } from '../data/images';
import { actions } from '../lib/store';
import { supabaseEnabled } from '../lib/supabase';
import { Field, go, srcSetFor } from '../components/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CIF_RE = /^[A-HJNP-SUVW]\d{7}[0-9A-J]$|^\d{8}[A-Z]$|^[XYZ]\d{7}[A-Z]$/i; // CIF, NIF o NIE (solo formato)

// Fuerza orientativa de la contraseña: longitud y variedad de caracteres
function strength(pw) {
  let n = 0;
  if (pw.length >= 8) n++;
  if (pw.length >= 12) n++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) n++;
  if (/\d/.test(pw)) n++;
  if (/[^A-Za-z0-9]/.test(pw)) n++;
  return Math.min(4, n);
}
const STRENGTH = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'];

export function Auth({ mode = 'acceso', preset }) {
  const isReg = mode === 'registro';
  const [role, setRole] = useState(preset === 'proveedor' ? 'proveedor' : 'cliente');
  const [f, setF] = useState({ name: '', company: '', cif: '', phone: '', email: '', password: '', province: 'Málaga', families: [], terms: false });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null); // { tone, text }
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: undefined }); };
  const toggleFam = (id) => setF({ ...f, families: f.families.includes(id) ? f.families.filter((x) => x !== id) : [...f.families, id] });
  const score = strength(f.password);

  const validate = () => {
    const e = {};
    if (!EMAIL_RE.test(f.email.trim())) e.email = 'Escribe un email válido, por ejemplo nombre@empresa.es.';
    if (!f.password) e.password = 'Escribe tu contraseña.';
    if (isReg) {
      if (f.name.trim().length < 2) e.name = 'Dinos tu nombre.';
      if (f.company.trim().length < 2) e.company = 'Indica el nombre de tu empresa.';
      if (f.phone.replace(/\D/g, '').length < 9) e.phone = 'El teléfono debe tener al menos 9 cifras.';
      if (role === 'cliente' && f.cif.trim() && !CIF_RE.test(f.cif.trim())) e.cif = 'El CIF no tiene un formato válido (ejemplo: B12345678).';
      if (f.password.length < 8) e.password = 'Usa al menos 8 caracteres.';
      else if (score < 2) e.password = 'Añade mayúsculas, números o símbolos para hacerla más segura.';
      if (role === 'proveedor' && !f.families.length) e.families = 'Marca al menos una familia de maquinaria que alquilas.';
      if (!f.terms) e.terms = 'Tienes que aceptar las condiciones para crear la cuenta.';
    }
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setMsg(null);
    const e = validate();
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) { document.getElementById(`f-${first}`)?.focus(); return; }
    setBusy(true);
    const res = isReg ? await actions.register({ ...f, role }) : await actions.login(f.email, f.password);
    setBusy(false);
    if (res.error) return setMsg({ tone: 'error', text: res.error });
    if (res.info) return setMsg({ tone: 'info', text: res.info });
    return go('/app/inicio');
  };
  const forgot = async () => {
    if (!EMAIL_RE.test(f.email.trim())) { setErrors({ email: 'Escribe primero tu email para enviarte el enlace.' }); document.getElementById('f-email')?.focus(); return; }
    const res = await actions.resetPassword(f.email);
    setMsg({ tone: res.error ? 'error' : 'info', text: res.error || res.info });
  };
  const guest = (r) => { actions.enterGuest(r); go('/app/inicio'); };
  // enlaza cada campo con su mensaje de error para los lectores de pantalla
  const fld = (k) => ({ id: `f-${k}`, 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': errors[k] ? `e-${k}` : undefined });
  const Err = ({ k }) => (errors[k] ? <small className="field-error" id={`e-${k}`}>{errors[k]}</small> : null);

  return (
    <div className="auth">
      <aside className="auth-side">
        <img crossOrigin="anonymous" src={IMG.auth} srcSet={srcSetFor(IMG.auth, [700, 1000, 1400])} sizes="(max-width: 900px) 100vw, 45vw" alt="" width="1400" height="933" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div>
          <a className="brand" href="#/" aria-label="MAQNOW, inicio"><Logo /></a>
          <p>Tú nos dices qué necesitas. Nosotros buscamos quién la tiene disponible, comparamos precio y condiciones, y tú eliges.</p>
        </div>
      </aside>

      <main className="auth-main" id="contenido" tabIndex={-1}>
        <a className="back" href="#/"><ArrowLeft size={15} aria-hidden /> Volver a la web</a>
        <h1>{isReg ? 'Crea tu cuenta' : 'Entra en tu área'}</h1>
        <p className="sub">{isReg ? <>¿Ya tienes cuenta? <a href="#/acceso">Inicia sesión</a></> : <>¿Aún no tienes cuenta? <a href="#/registro">Créala gratis</a></>}</p>

        <form onSubmit={submit} className="auth-form" noValidate>
          {isReg && (
            <div className="role-pick" role="radiogroup" aria-label="Tipo de cuenta">
              <button type="button" role="radio" aria-checked={role === 'cliente'} className={role === 'cliente' ? 'on' : ''} onClick={() => setRole('cliente')}>
                <HardHat size={22} aria-hidden /><b>Necesito alquilar</b><small>Constructoras, instaladores, autónomos</small>
              </button>
              <button type="button" role="radio" aria-checked={role === 'proveedor'} className={role === 'proveedor' ? 'on' : ''} onClick={() => setRole('proveedor')}>
                <Truck size={22} aria-hidden /><b>Alquilo maquinaria</b><small>Empresas alquiladoras</small>
              </button>
            </div>
          )}
          {isReg && (
            <div className="form-grid two">
              <Field label="Tu nombre"><input {...fld('name')} required value={f.name} onChange={set('name')} autoComplete="name" /><Err k="name" /></Field>
              <Field label="Empresa"><input {...fld('company')} required value={f.company} onChange={set('company')} autoComplete="organization" /><Err k="company" /></Field>
              <Field label="Teléfono"><input {...fld('phone')} required type="tel" inputMode="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" /><Err k="phone" /></Field>
              {role === 'cliente'
                ? <Field label="CIF (opcional)"><input {...fld('cif')} value={f.cif} onChange={set('cif')} autoCapitalize="characters" /><Err k="cif" /></Field>
                : <Field label="Provincia"><select value={f.province} onChange={set('province')} autoComplete="address-level1">{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select></Field>}
            </div>
          )}
          {isReg && role === 'proveedor' && (
            <fieldset className="field">
              <legend>¿Qué maquinaria alquilas?</legend>
              <div className="chips" id="f-families" tabIndex={-1}>{FAMILIES.map((x) => <button type="button" key={x.id} aria-pressed={f.families.includes(x.id)} className={f.families.includes(x.id) ? 'on' : ''} onClick={() => toggleFam(x.id)}>{x.name}</button>)}</div>
              <Err k="families" />
              <small>Revisamos cada alta: empezarás a recibir solicitudes cuando homologuemos tu empresa.</small>
            </fieldset>
          )}
          <Field label="Email"><input {...fld('email')} required type="email" inputMode="email" value={f.email} onChange={set('email')} autoComplete="email" /><Err k="email" /></Field>
          <Field label="Contraseña">
            <span className="pw">
              <input {...fld('password')} required type={show ? 'text' : 'password'} value={f.password} onChange={set('password')} autoComplete={isReg ? 'new-password' : 'current-password'} />
              <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={show}>{show ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}</button>
            </span>
            {isReg && f.password && (
              <span className={`meter m${score}`} role="status"><i /><i /><i /><i /><em>Seguridad: {STRENGTH[score].toLowerCase()}</em></span>
            )}
            <Err k="password" />
          </Field>
          {!isReg && <button type="button" className="link forgot" onClick={forgot}>¿Has olvidado la contraseña?</button>}
          {isReg && (
            <div>
              <label className="check"><input {...fld('terms')} type="checkbox" checked={f.terms} onChange={set('terms')} /> <span>Acepto las condiciones de uso y la política de privacidad.</span></label>
              <Err k="terms" />
            </div>
          )}
          {msg && <p className={msg.tone === 'error' ? 'error' : 'notice ok'} role={msg.tone === 'error' ? 'alert' : 'status'}>{msg.tone !== 'error' && <Check size={16} aria-hidden />}{msg.text}</p>}
          <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Un momento…' : isReg ? 'Crear cuenta' : 'Entrar'}</button>
        </form>

        <section className="guest" aria-labelledby="invitado">
          <h2 id="invitado">O entra sin registrarte, como invitado</h2>
          <div>
            <button className="btn btn-ghost" onClick={() => guest('cliente')}><HardHat size={16} aria-hidden /> Cliente</button>
            <button className="btn btn-ghost" onClick={() => guest('proveedor')}><Truck size={16} aria-hidden /> Proveedor</button>
            <button className="btn btn-ghost" onClick={() => guest('agente')}><Headset size={16} aria-hidden /> Agente comercial</button>
            <button className="btn btn-ghost" onClick={() => guest('administracion')}><Calculator size={16} aria-hidden /> Administración</button>
            <button className="btn btn-ghost" onClick={() => guest('superadmin')}><ShieldCheck size={16} aria-hidden /> Superadmin</button>
          </div>
          <small>{supabaseEnabled
            ? 'El invitado ve una empresa de ejemplo. Las cuentas registradas se guardan en el servidor.'
            : 'El invitado ve una empresa de ejemplo. En esta demo las cuentas se guardan solo en este navegador.'}</small>
        </section>
      </main>
    </div>
  );
}
