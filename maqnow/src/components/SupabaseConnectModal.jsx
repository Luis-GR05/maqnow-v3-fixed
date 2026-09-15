import React, { useState, useEffect } from 'react';
import { Database, Check, Copy, ExternalLink, X, AlertCircle, RefreshCw, Server, Shield } from 'lucide-react';
import { MaqnowAPI, isSupabaseConfigured } from '../lib/supabase';

export function SupabaseConnectModal({ onClose }) {
  const status = MaqnowAPI.getConnectionStatus();
  const [url, setUrl] = useState(localStorage.getItem('maqnow_supabase_url') || '');
  const [key, setKey] = useState(localStorage.getItem('maqnow_supabase_key') || '');
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    MaqnowAPI.getDbStats().then(setStats);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!url || !key) {
      alert('Por favor introduce la URL y la Anon Key de tu proyecto Supabase.');
      return;
    }
    MaqnowAPI.saveCredentials(url, key);
  };

  const handleClear = () => {
    if (confirm('¿Deseas volver al modo local simulado?')) {
      MaqnowAPI.clearCredentials();
    }
  };

  const handleReset = () => {
    if (confirm('¿Restablecer todos los datos locales al estado semilla inicial?')) {
      MaqnowAPI.resetDatabase();
    }
  };

  const copySqlNotice = () => {
    navigator.clipboard.writeText('supabase/schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="connect-modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Database className="title-icon" />
            <div>
              <h3>Conexión con Base de Datos Supabase</h3>
              <small>Arquitectura híbrida PostgreSQL B2B de MAQNOW</small>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {/* Status Badge Card */}
          <div className={`status-card ${isSupabaseConfigured ? 'live' : 'mock'}`}>
            <div className="status-indicator">
              <span className={`status-dot ${isSupabaseConfigured ? 'green' : 'amber'}`} />
              <div>
                <b>{isSupabaseConfigured ? 'CONECTADO A SUPABASE POSTGRESQL' : 'MODO LOCAL REACTIVO ACTIVO'}</b>
                <span>{status.provider}</span>
              </div>
            </div>
            <span className="status-tag">
              {isSupabaseConfigured ? 'Producción / Supabase' : 'Persistencia Local'}
            </span>
          </div>

          {/* Database Statistics Summary */}
          {stats && (
            <div className="stats-row">
              <div className="stat-pill">
                <span>Máquinas:</span>
                <b>{stats.totalMachines}</b>
              </div>
              <div className="stat-pill">
                <span>Solicitudes:</span>
                <b>{stats.activeRequests}</b>
              </div>
              <div className="stat-pill">
                <span>Cotizaciones:</span>
                <b>{stats.totalQuotes}</b>
              </div>
              <div className="stat-pill">
                <span>Alquileres activos:</span>
                <b>{stats.activeRentals}</b>
              </div>
              <div className="stat-pill">
                <span>Portes:</span>
                <b>{stats.logisticsOrders}</b>
              </div>
            </div>
          )}

          {/* SQL Setup Instructions Box */}
          <div className="sql-box">
            <div className="sql-box-header">
              <Server size={15} />
              <span>Esquema SQL Maestro: <code>supabase/schema.sql</code></span>
              <button className="btn-copy-sql" onClick={copySqlNotice}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? '¡Ruta copiada!' : 'Copiar ruta'}
              </button>
            </div>
            <p>
              El archivo <strong>supabase/schema.sql</strong> contiene las 10 tablas relacionales, políticas de seguridad RLS, triggers y datos semilla de empresas reales (GAM, mateco, Constructora Mediterránea).
            </p>
            <ol className="sql-steps">
              <li>Abre tu proyecto en <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Supabase.com <ExternalLink size={11} /></a></li>
              <li>Entra en <strong>SQL Editor</strong> y pega el contenido de <code>supabase/schema.sql</code></li>
              <li>Pega tu <strong>Project URL</strong> y <strong>Anon Key</strong> en el formulario inferior para activar la sincronización remota en vivo</li>
            </ol>
          </div>

          {/* Form to Connect Live Supabase */}
          <form onSubmit={handleSave} className="connect-form">
            <label>SUPABASE PROJECT URL</label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <label>SUPABASE ANON PUBLIC KEY</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />

            <div className="connect-actions">
              <button type="submit" className="btn-save-conn">
                Guardar y Conectar Supabase
              </button>
              {isSupabaseConfigured && (
                <button type="button" className="btn-clear-conn" onClick={handleClear}>
                  Desconectar
                </button>
              )}
              <button type="button" className="btn-reset-data" onClick={handleReset} title="Restablecer datos de prueba">
                <RefreshCw size={14} /> Resetear Datos Locales
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
