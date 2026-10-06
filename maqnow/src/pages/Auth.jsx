import React, { useState } from 'react';
import { ArrowLeft, HardHat, Truck, ShieldCheck } from 'lucide-react';
import { FAMILIES, PROVINCES } from '../data/catalog';
import { IMG } from '../data/images';
import { actions } from '../lib/store';
import { Field, go } from '../components/ui';

export function Auth({ mode = 'acceso', preset }) {
  const isReg = mode === 'registro';
  const [role, setRole] = useState(preset === 'proveedor' ? 'proveedor' : 'cliente');
  const [f, setF] = useState({ name: '', company: '', cif: '', phone: '', email: '', password: '', province: 'Málaga', families: [] });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggleFam = (id) => setF({ ...f, families: f.families.includes(id) ? f.families.filter((x) => x !== id) : [...f.families, id] });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (isReg && f.password.length < 6) return setErr('La contraseña debe tener al menos 6 caracteres.');
    if (isReg && role === 'proveedor' && !f.families.length) return setErr('Marca al menos una familia de maquinaria que alquilas.');
    setBusy(true);
    const error = isReg ? await actions.register({ ...f, role }) : await actions.login(f.email, f.password);
    setBusy(false);
    if (error) return setErr(error);
    return go('/app/inicio');
  };
  const guest = (r) => { actions.enterGuest(r); go('/app/inicio'); };

  return (
    <div className="auth">
      <aside className="auth-side">
        <img src={IMG.auth} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div>
          <a className="brand" href="#/"><img src={`${import.meta.env.BASE_URL}logo-mark.svg`} alt="" />MAQ<span>NOW</span></a>
          <p>Tú nos dices qué necesitas. Nosotros buscamos quién la tiene disponible, comparamos precio y condiciones, y tú eliges.</p>
        </div>
      </aside>

      <main className="auth-main">
        <a className="back" href="#/"><ArrowLeft size={15} /> Volver a la web</a>
        <h1>{isReg ? 'Crea tu cuenta' : 'Entra en tu área'}</h1>
        <p className="sub">{isReg ? <>¿Ya tienes cuenta? <a href="#/acceso">Inicia sesión</a></> : <>¿Aún no tienes cuenta? <a href="#/registro">Créala gratis</a></>}</p>

        <form onSubmit={submit} className="auth-form">
          {isReg && (
            <div className="role-pick" role="radiogroup" aria-label="Tipo de cuenta">
              <button type="button" role="radio" aria-checked={role === 'cliente'} className={role === 'cliente' ? 'on' : ''} onClick={() => setRole('cliente')}>
                <HardHat size={22} /><b>Necesito alquilar</b><small>Constructoras, instaladores, autónomos</small>
              </button>
              <button type="button" role="radio" aria-checked={role === 'proveedor'} className={role === 'proveedor' ? 'on' : ''} onClick={() => setRole('proveedor')}>
                <Truck size={22} /><b>Alquilo maquinaria</b><small>Empresas alquiladoras</small>
              </button>
            </div>
          )}
          {isReg && (
            <div className="form-grid two">
              <Field label="Tu nombre"><input required value={f.name} onChange={set('name')} autoComplete="name" /></Field>
              <Field label="Empresa"><input required value={f.company} onChange={set('company')} autoComplete="organization" /></Field>
              <Field label="Teléfono"><input required type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" /></Field>
              {role === 'cliente'
                ? <Field label="CIF (opcional)"><input value={f.cif} onChange={set('cif')} /></Field>
                : <Field label="Provincia"><select value={f.province} onChange={set('province')}>{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select></Field>}
            </div>
          )}
          {isReg && role === 'proveedor' && (
            <div className="field">
              <span>¿Qué maquinaria alquilas?</span>
              <div className="chips">{FAMILIES.map((x) => <button type="button" key={x.id} className={f.families.includes(x.id) ? 'on' : ''} onClick={() => toggleFam(x.id)}>{x.name}</button>)}</div>
            </div>
          )}
          <Field label="Email"><input required type="email" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
          <Field label="Contraseña"><input required type="password" value={f.password} onChange={set('password')} autoComplete={isReg ? 'new-password' : 'current-password'} /></Field>
          {err && <p className="error" role="alert">{err}</p>}
          <button className="btn btn-primary btn-lg" disabled={busy}>{isReg ? 'Crear cuenta' : 'Entrar'}</button>
        </form>

        <div className="guest">
          <span>O entra sin registrarte, como invitado</span>
          <div>
            <button className="btn btn-ghost" onClick={() => guest('cliente')}><HardHat size={16} /> Como cliente</button>
            <button className="btn btn-ghost" onClick={() => guest('proveedor')}><Truck size={16} /> Como proveedor</button>
            <button className="btn btn-ghost" onClick={() => guest('admin')}><ShieldCheck size={16} /> Como equipo MAQNOW</button>
          </div>
          <small>El invitado ve una empresa de ejemplo con datos de demostración. Las cuentas se guardan solo en este navegador.</small>
        </div>
      </main>
    </div>
  );
}
