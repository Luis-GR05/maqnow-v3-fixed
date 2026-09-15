import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Building2, ShieldCheck, AlertTriangle, Check,
  Database, Users, Euro, Activity, FileCheck, CheckCircle2, Clock
} from 'lucide-react';
import { MaqnowAPI, isSupabaseConfigured } from '../../lib/supabase';

export function AdminDashboard({ onOpenSupabaseModal }) {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [companies, setCompanies] = useState([
    { id: '1', name: 'Constructora Mediterránea S.A.', cif: 'A-29182374', role: 'Cliente (Constructora)', status: 'gold', city: 'Málaga', rating: 4.9 },
    { id: '2', name: 'GAM España Alquileres S.A.', cif: 'A-33291827', role: 'Alquilador (Flotista)', status: 'gold', city: 'Málaga', rating: 4.9 },
    { id: '3', name: 'mateco Alquiler de Maquinaria S.L.U.', cif: 'B-61928374', role: 'Alquilador (Flotista)', status: 'gold', city: 'Antequera', rating: 4.9 },
    { id: '4', name: 'RentAlis Equipos y Flotas del Sur', cif: 'B-93827162', role: 'Alquilador (Flotista)', status: 'silver', city: 'Marbella', rating: 4.7 },
    { id: '5', name: 'Transportes Especiales Sur S.L.', cif: 'B-29102938', role: 'Logística y Góndolas', status: 'gold', city: 'Málaga', rating: 5.0 },
    { id: '6', name: 'Ferrocosta Obras y Estructuras S.L.', cif: 'B-29472910', role: 'Cliente (Constructora)', status: 'gold', city: 'Marbella', rating: 4.8 }
  ]);

  const loadData = async () => {
    const [s, incs] = await Promise.all([
      MaqnowAPI.getDbStats(),
      MaqnowAPI.getIncidents()
    ]);
    setStats(s);
    setIncidents(incs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = (id) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'gold' ? 'silver' : 'gold' } : c
      )
    );
  };

  const handleResolveIncident = async (id) => {
    await MaqnowAPI.resolveIncident(id, 'Incidencia resuelta por mediación de operaciones centrales MAQNOW.');
    await loadData();
    alert('Incidencia marcada como resuelta.');
  };

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <div className="kicker">MOTOR CENTRAL · MAQNOW PLATFORM GOVERNANCE & CONTROL</div>
          <h1>Supervisión Global del Marketplace</h1>
          <p>Métricas de transacciones, homologación KYC de empresas, monitor de incidencias y estado de base de datos.</p>
        </div>
        <button className="outline" onClick={onOpenSupabaseModal}>
          <Database size={15} /> Configurar Supabase
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics">
        <div className="metric">
          <div className="metric-icon"><Euro /></div>
          <div>
            <span>Volumen GMV contratado</span>
            <strong>384.200 €</strong>
            <small>Transaccionado en la red</small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon"><Activity /></div>
          <div>
            <span>Ingresos Comisión (3.5%)</span>
            <strong>13.447 €</strong>
            <small>Comisión neta MAQNOW</small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon"><Clock /></div>
          <div>
            <span>Tiempo respuesta cotización</span>
            <strong>28 min</strong>
            <small>Promedio de alquiladores</small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon"><ShieldCheck /></div>
          <div>
            <span>Empresas Homologadas</span>
            <strong>{companies.length}</strong>
            <small>100% verificadas con CIF y CE</small>
          </div>
        </div>
      </div>

      {/* Grid: Companies Audit & Incident Monitor */}
      <div className="dashgrid">
        {/* SECTION 1: HOMOLOGACIÓN KYC DE EMPRESAS */}
        <section className="dashcard large">
          <div className="cardhead">
            <div>
              <small>COMPLIANCE Y AUDITORÍA KYC</small>
              <h3>Empresas en la Red MAQNOW</h3>
            </div>
            <span className="counter">{companies.length}</span>
          </div>

          <div className="companies-table">
            <div className="table-row head">
              <span>Empresa / CIF</span>
              <span>Rol / Tipo</span>
              <span>Sede</span>
              <span>Scoring</span>
              <span>Nivel Verificación</span>
            </div>
            {companies.map((c) => (
              <div className="table-row" key={c.id}>
                <div>
                  <b>{c.name}</b>
                  <small>CIF: {c.cif}</small>
                </div>
                <div>
                  <span>{c.role}</span>
                </div>
                <div>
                  <span>{c.city}</span>
                </div>
                <div>
                  <strong style={{ color: '#b8ff4d' }}>{c.rating} / 5.0</strong>
                </div>
                <div>
                  <button
                    className={`btn-verify ${c.status}`}
                    onClick={() => handleToggleStatus(c.id)}
                    title="Haz clic para alternar nivel Gold/Silver"
                  >
                    {c.status === 'gold' ? '★ VERIFICADO GOLD' : '● VERIFICADO SILVER'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: ESTADO TÉCNICO Y BASE DE DATOS */}
        <section className="dashcard">
          <div className="cardhead">
            <div>
              <small>INFRAESTRUCTURA Y DATOS</small>
              <h3>Estado de Conexión</h3>
            </div>
            <Database />
          </div>

          <div className={`db-status-box ${isSupabaseConfigured ? 'live' : 'mock'}`}>
            <span className={`dot ${isSupabaseConfigured ? 'pulse' : ''}`} />
            <div>
              <b>{isSupabaseConfigured ? 'Supabase Live PostgreSQL' : 'Modo Local Reactivo Persistente'}</b>
              <small>{isSupabaseConfigured ? 'Consultas remotas en tiempo real activas' : 'Esquema SQL listo en supabase/schema.sql'}</small>
            </div>
          </div>

          {stats && (
            <div className="admin-stats-list">
              <div className="stat-line"><span>Máquinas en catálogo:</span> <b>{stats.totalMachines}</b></div>
              <div className="stat-line"><span>Alquileres vigentes:</span> <b>{stats.activeRentals}</b></div>
              <div className="stat-line"><span>Solicitudes emitidas:</span> <b>{stats.activeRequests}</b></div>
              <div className="stat-line"><span>Cotizaciones registradas:</span> <b>{stats.totalQuotes}</b></div>
              <div className="stat-line"><span>Portes y albaranes:</span> <b>{stats.logisticsOrders}</b></div>
            </div>
          )}

          <button className="outline full" style={{ marginTop: '16px' }} onClick={onOpenSupabaseModal}>
            Ver Script SQL y Credenciales Supabase
          </button>
        </section>

        {/* SECTION 3: MONITOR CENTRAL DE INCIDENCIAS */}
        <section className="dashcard large" style={{ gridColumn: '1 / -1' }}>
          <div className="cardhead">
            <div>
              <small>CALIDAD DE SERVICIO Y RESOLUCIÓN DE AVERÍAS</small>
              <h3>Partes de Incidencia Técnica y Asistencia</h3>
            </div>
            <AlertTriangle className="text-amber" />
          </div>

          <div className="incidents-list">
            {incidents.map((inc) => (
              <div className="incident-row" key={inc.id}>
                <div className="incident-info">
                  <div className="incident-tags">
                    <span className={`severity-tag ${inc.severity || 'low'}`}>
                      SEVERIDAD {inc.severity?.toUpperCase() || 'BAJA'}
                    </span>
                    <span className={`status-pill ${inc.status}`}>
                      {inc.status === 'resolved' ? 'Resuelto' : 'Técnico despachado'}
                    </span>
                    <small>{inc.date}</small>
                  </div>
                  <b>{inc.title}</b>
                  <p>{inc.machine_name}</p>
                  {inc.resolution && <small className="res-note">Resolución: {inc.resolution}</small>}
                </div>

                <div className="incident-actions">
                  {inc.status !== 'resolved' ? (
                    <button
                      className="btn-primary small"
                      onClick={() => handleResolveIncident(inc.id)}
                    >
                      <Check size={14} /> Marcar como resuelta
                    </button>
                  ) : (
                    <span className="text-muted" style={{ fontSize: '11px' }}>
                      <Check size={13} style={{ verticalAlign: -2 }} /> Caso archivado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
