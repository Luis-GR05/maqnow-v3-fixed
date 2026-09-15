import React, { useState, useEffect } from 'react';
import {
  Activity, CalendarDays, Euro, WalletCards, Plus, Eye, Check,
  Clock, ShieldCheck, MapPin, Truck, AlertTriangle, ArrowRight,
  FileCheck, Sparkles, X, ChevronRight, RefreshCw, FileText
} from 'lucide-react';
import { MaqnowAPI } from '../../lib/supabase';

export function ClientDashboard({ onOpenPassport }) {
  const [activeRentals, setActiveRentals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showSignContractModal, setShowSignContractModal] = useState(null); // quote to sign
  const [showIncidentModal, setShowIncidentModal] = useState(null); // machine/rental to report incident
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState('medium');

  // New Request Wizard State
  const [reqStep, setReqStep] = useState(1);
  const [newCategory, setNewCategory] = useState('boomlift');
  const [newMachineType, setNewMachineType] = useState('Plataforma Articulada Diésel 16m');
  const [newZip, setNewZip] = useState('29602, Marbella');
  const [newStartDate, setNewStartDate] = useState('15 OCT 2026');
  const [newEndDate, setNewEndDate] = useState('25 OCT 2026');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newNotes, setNewNotes] = useState('');

  const loadData = async () => {
    const [r, reqs, q, p] = await Promise.all([
      MaqnowAPI.getActiveRentals(),
      MaqnowAPI.getRequests(),
      MaqnowAPI.getAllQuotes(),
      MaqnowAPI.getProjects()
    ]);
    setActiveRentals(r);
    setRequests(reqs);
    setQuotes(q);
    setProjects(p);
    if (reqs.length > 0 && !selectedRequest) {
      setSelectedRequest(reqs[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    await MaqnowAPI.createRequest({
      category: newCategory,
      machine_type_requested: newMachineType,
      quantity: Number(newQuantity),
      location: newZip,
      postal_code: newZip.split(',')[0].trim(),
      start_date: newStartDate,
      end_date: newEndDate,
      duration_days: 10,
      notes: newNotes
    });
    setShowNewRequestModal(false);
    setReqStep(1);
    await loadData();
  };

  const handleConfirmContract = async (quote) => {
    await MaqnowAPI.acceptQuote(quote.id, 'Carlos Morales (Constructora Mediterránea S.A.)');
    setShowSignContractModal(null);
    await loadData();
    alert(`¡Contrato formalizado con éxito! La orden de transporte hacia tu obra ha sido programada con Transportes Especiales Sur.`);
  };

  const handleReportIncident = async (e) => {
    e.preventDefault();
    if (!incidentTitle) return;
    await MaqnowAPI.reportIncident({
      rental_id: showIncidentModal.id,
      machine_name: showIncidentModal.machine_name,
      title: incidentTitle,
      description: incidentDesc,
      severity: incidentSeverity
    });
    setShowIncidentModal(null);
    setIncidentTitle('');
    setIncidentDesc('');
    alert('Parte de incidencia registrado en MAQNOW. Se ha notificado al servicio de asistencia técnica del alquilador.');
  };

  const selectedQuotes = selectedRequest
    ? quotes.filter((q) => q.request_id === selectedRequest.id)
    : [];

  return (
    <div className="dash">
      {/* Dashboard Top Header */}
      <div className="dash-head">
        <div>
          <div className="kicker">CONSTRUCTORA MEDITERRÁNEA · CÓD. CM-29004 · GOLD VERIFIED</div>
          <h1>Buenos días, Carlos.</h1>
          <p>Gestiona el parque de alquileres en obra, compara ofertas de proveedores y accede a pasaportes 3D.</p>
        </div>
        <button className="primary" onClick={() => setShowNewRequestModal(true)}>
          <Plus size={17} /> Nueva solicitud de maquinaria
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="metrics">
        <div className="metric">
          <div className="metric-icon"><Activity /></div>
          <div>
            <span>Alquileres activos</span>
            <strong>{activeRentals.length}</strong>
            <small>En 2 obras activas</small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon"><CalendarDays /></div>
          <div>
            <span>Solicitudes en curso</span>
            <strong>{requests.length}</strong>
            <small>{requests.filter(r => r.status === 'quoted').length} listas para comparar</small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon"><Euro /></div>
          <div>
            <span>Inversión este mes</span>
            <strong>38.450 €</strong>
            <small>−12% vs. mes anterior</small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon"><WalletCards /></div>
          <div>
            <span>Ahorro Renting Score</span>
            <strong>6.820 €</strong>
            <small>18% ahorro medio MAQNOW</small>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Quotes Comparison & Active Rentals), Right Column (Requests & Projects) */}
      <div className="dashgrid">
        {/* SECTION 1: COMPARADOR DE OFERTAS EN VIVO */}
        <section className="dashcard large">
          <div className="cardhead">
            <div>
              <small>COMPARADOR INTELIGENTE DE COTIZACIONES</small>
              <h3>
                Ofertas para: {selectedRequest ? selectedRequest.machine_type_requested : 'Selecciona una solicitud'}
              </h3>
            </div>
            {selectedRequest && (
              <span className="counter">{selectedQuotes.length} ofertas</span>
            )}
          </div>

          {selectedQuotes.length === 0 ? (
            <div className="empty-box">
              <Clock size={28} />
              <p>Esperando cotizaciones de alquiladores verificados en tu radio de Málaga / Marbella.</p>
            </div>
          ) : (
            <div className="quotes-stack">
              {selectedQuotes.map((q, idx) => (
                <div className={`quote-card-b2b ${idx === 0 ? 'recommended' : ''}`} key={q.id}>
                  <div className="quote-top">
                    <div className="quote-provider">
                      <span className="provider-badge">{q.provider_verified === 'gold' ? '★ GOLD' : '● SILVER'}</span>
                      <b>{q.provider_name}</b>
                      <small>{q.distance} · {q.machine_name}</small>
                    </div>

                    <div className="quote-score-box">
                      <strong>{q.score}<span>/100</span></strong>
                      <small>RENTING SCORE</small>
                    </div>
                  </div>

                  <div className="quote-financials">
                    <div>
                      <span>Tarifa día:</span>
                      <b>{q.daily_rate} €/día</b>
                    </div>
                    <div>
                      <span>Total estimado:</span>
                      <b className="price-tag">{q.total_price}</b>
                    </div>
                    <div>
                      <span>Transporte:</span>
                      <b>{q.transport}</b>
                    </div>
                    <div>
                      <span>Fianza retenida:</span>
                      <b>{q.deposit}</b>
                    </div>
                    <div>
                      <span>Entrega asegurada:</span>
                      <b>{q.delivery}</b>
                    </div>
                  </div>

                  <p className="quote-note">"{q.notes}"</p>

                  <div className="quote-actions">
                    <button
                      className="outline"
                      onClick={() => onOpenPassport({
                        id: q.machine_id,
                        name: q.machine_name,
                        brand: q.machine_name.split(' ')[0],
                        model: q.machine_name.split(' ').slice(1, 3).join(' '),
                        three_d_model: selectedRequest?.category || 'boomlift',
                        category: selectedRequest?.category || 'boomlift'
                      })}
                    >
                      <Eye size={14} /> Inspeccionar Pasaporte 3D
                    </button>
                    <button
                      className="primary small"
                      onClick={() => setShowSignContractModal(q)}
                    >
                      <Check size={14} /> Aceptar y formalizar contrato
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: MIS SOLICITUDES ACTIVAS */}
        <section className="dashcard">
          <div className="cardhead">
            <div>
              <small>BANDEJA DE DEMANDA</small>
              <h3>Mis solicitudes emitidas</h3>
            </div>
          </div>

          <div className="request-items-list">
            {requests.map((r) => (
              <div
                key={r.id}
                className={`req-item ${selectedRequest?.id === r.id ? 'active' : ''}`}
                onClick={() => setSelectedRequest(r)}
              >
                <div className="req-item-head">
                  <span className="req-code">{r.reference_code}</span>
                  <span className={`status-pill ${r.status}`}>
                    {r.status === 'quoted' ? '3 Ofertas listas' : r.status === 'accepted' ? 'Contratada' : 'Cotizando'}
                  </span>
                </div>
                <b>{r.machine_type_requested}</b>
                <small><MapPin size={11} /> {r.location} · {r.duration_days} días</small>
              </div>
            ))}
          </div>

          <button className="outline full" style={{ marginTop: '15px' }} onClick={() => setShowNewRequestModal(true)}>
            + Añadir otra solicitud
          </button>
        </section>

        {/* SECTION 3: PARQUE DE ALQUILERES ACTIVOS EN OBRA */}
        <section className="dashcard large">
          <div className="cardhead">
            <div>
              <small>PARQUE DE MAQUINARIA EN OBRA</small>
              <h3>Alquileres en producción activa</h3>
            </div>
            <Activity />
          </div>

          <div className="active-rentals-grid">
            {activeRentals.map((item) => (
              <div className="active-rental-card" key={item.id}>
                <div className="rental-card-top">
                  <span className="pulse" />
                  <div>
                    <b>{item.machine_name}</b>
                    <small>{item.contract_ref} · {item.provider_name}</small>
                  </div>
                  <strong className="rate">{item.daily_rate}</strong>
                </div>

                <div className="rental-meta-grid">
                  <div>
                    <span>Ubicación en obra:</span>
                    <b>{item.location}</b>
                  </div>
                  <div>
                    <span>Periodo contratado:</span>
                    <b>{item.start_date} — {item.end_date}</b>
                  </div>
                  <div>
                    <span>Horómetro de trabajo:</span>
                    <b>{item.hours_used}</b>
                  </div>
                  <div>
                    <span>Telemetría GPS:</span>
                    <b style={{ color: '#68d391' }}>{item.telemetry}</b>
                  </div>
                </div>

                <div className="rental-card-actions">
                  <button
                    className="outline"
                    onClick={() => onOpenPassport({
                      id: item.machine_id,
                      name: item.machine_name,
                      brand: item.machine_name.split(' ')[0],
                      model: item.machine_name.split(' ').slice(1, 3).join(' '),
                      three_d_model: item.machine_name.includes('Plataforma') ? 'boomlift' : 'generator',
                      category: item.machine_name.includes('Plataforma') ? 'boomlift' : 'generator'
                    })}
                  >
                    <Eye size={14} /> Pasaporte 3D
                  </button>
                  <button
                    className="btn-warn"
                    onClick={() => setShowIncidentModal(item)}
                  >
                    <AlertTriangle size={14} /> Avería
                  </button>
                  <button
                    className="btn-return"
                    onClick={() => alert(`Solicitud de fin de alquiler y recogida emitida para ${item.contract_ref}.`)}
                  >
                    <Truck size={14} /> Fin Alquiler
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: MIS OBRAS Y PROYECTOS */}
        <section className="dashcard">
          <div className="cardhead">
            <div>
              <small>CENTROS DE TRABAJO</small>
              <h3>Mis proyectos y obras</h3>
            </div>
          </div>

          <div className="projects-list">
            {projects.map((p) => (
              <div className="project-item" key={p.id}>
                <div className="project-item-top">
                  <b>{p.name}</b>
                  <span className="badge-count">{p.active_machines_count} máquinas</span>
                </div>
                <small><MapPin size={11} /> {p.location}</small>
                <div className="bar">
                  <i style={{ width: `${p.coverage_pct || 70}%` }} />
                </div>
                <div className="project-item-sub">
                  <span>Jefe de Obra: {p.site_manager}</span>
                  <b>{p.coverage_pct || 70}% cubierta</b>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MODAL 1: NEW REQUEST WIZARD */}
      {showNewRequestModal && (
        <div className="modal-overlay" onClick={() => setShowNewRequestModal(false)}>
          <div className="wizard-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Solicitud de Maquinaria</h3>
              <button className="btn-close" onClick={() => setShowNewRequestModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateRequest} className="wizard-form">
              <div className="step-indicator-bar">
                <span>Paso {reqStep} de 3</span>
                <div className="progress-track"><i style={{ width: `${(reqStep / 3) * 100}%` }} /></div>
              </div>

              {reqStep === 1 && (
                <div className="wizard-step">
                  <label>CATEGORÍA DE MÁQUINA</label>
                  <div className="chips-grid">
                    {[
                      { id: 'excavator', label: 'Excavación y Tierras (Miniexcavadora)' },
                      { id: 'boomlift', label: 'Elevación de personas (Plataforma 16m)' },
                      { id: 'forklift', label: 'Manutención (Manipulador 14m)' },
                      { id: 'generator', label: 'Energía (Grupo Electrógeno 60kVA)' },
                      { id: 'roller', label: 'Compactación (Rodillo Tándem 2.5t)' }
                    ].map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        className={`chip-btn ${newCategory === cat.id ? 'active' : ''}`}
                        onClick={() => {
                          setNewCategory(cat.id);
                          setNewMachineType(cat.label.split('(')[1]?.replace(')', '') || cat.label);
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <label style={{ marginTop: '16px' }}>TIPO ESPECÍFICO REQUERIDO</label>
                  <input
                    type="text"
                    value={newMachineType}
                    onChange={(e) => setNewMachineType(e.target.value)}
                    required
                  />
                </div>
              )}

              {reqStep === 2 && (
                <div className="wizard-step">
                  <label>UBICACIÓN DE LA OBRA O ENTREGA</label>
                  <input
                    type="text"
                    value={newZip}
                    onChange={(e) => setNewZip(e.target.value)}
                    placeholder="Ej. 29602, Marbella (Golden Mile)"
                    required
                  />

                  <div className="dates-row" style={{ marginTop: '16px' }}>
                    <div>
                      <label>FECHA ENTREGA</label>
                      <input
                        type="text"
                        value={newStartDate}
                        onChange={(e) => setNewStartDate(e.target.value)}
                        placeholder="15 OCT 2026"
                      />
                    </div>
                    <div>
                      <label>FECHA DEVOLUCIÓN</label>
                      <input
                        type="text"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        placeholder="25 OCT 2026"
                      />
                    </div>
                    <div>
                      <label>UNIDADES</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {reqStep === 3 && (
                <div className="wizard-step">
                  <label>NOTAS TÉCNICAS O REQUERIMIENTOS ESPECIALES</label>
                  <textarea
                    rows="3"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Ej. Ruedas que no manchen, certificado de revisión reciente, entrega antes de las 9:00 AM."
                  />

                  <div className="summary-box">
                    <div><span>Máquina:</span> <b>{newMachineType} ({newQuantity} ud.)</b></div>
                    <div><span>Ubicación:</span> <b>{newZip}</b></div>
                    <div><span>Periodo:</span> <b>{newStartDate} — {newEndDate} (10 días)</b></div>
                  </div>
                </div>
              )}

              <div className="wizard-nav">
                {reqStep > 1 && (
                  <button type="button" className="btn-secondary" onClick={() => setReqStep(reqStep - 1)}>
                    Atrás
                  </button>
                )}
                {reqStep < 3 ? (
                  <button type="button" className="btn-primary" onClick={() => setReqStep(reqStep + 1)}>
                    Continuar <ArrowRight size={14} />
                  </button>
                ) : (
                  <button type="submit" className="btn-primary">
                    Emitir Solicitud a la Red MAQNOW <Check size={14} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SIGN CONTRACT CONFIRMATION */}
      {showSignContractModal && (
        <div className="modal-overlay" onClick={() => setShowSignContractModal(null)}>
          <div className="contract-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FileCheck className="title-icon" />
                <div>
                  <h3>Formalización de Contrato de Alquiler</h3>
                  <small>Acuerdo de Arrendamiento de Maquinaria Profesional</small>
                </div>
              </div>
              <button className="btn-close" onClick={() => setShowSignContractModal(null)}><X size={18} /></button>
            </div>

            <div className="contract-body">
              <div className="contract-summary-card">
                <div><span>Proveedor:</span> <b>{showSignContractModal.provider_name}</b></div>
                <div><span>Equipo:</span> <b>{showSignContractModal.machine_name}</b></div>
                <div><span>Tarifa acordada:</span> <b>{showSignContractModal.total_price} ({showSignContractModal.daily_rate} €/día)</b></div>
                <div><span>Transporte:</span> <b>{showSignContractModal.transport}</b></div>
                <div><span>Fianza retenida:</span> <b>{showSignContractModal.deposit} (devolución al fin de obra)</b></div>
                <div><span>Fecha de entrega:</span> <b>{showSignContractModal.delivery}</b></div>
              </div>

              <div className="contract-terms">
                <p><ShieldCheck size={14} /> Seguro de RC y daños propios incluido sin franquicia.</p>
                <p><Check size={14} /> Despacho de camión góndola gestionado por Transportes Especiales Sur.</p>
                <p><Check size={14} /> Trazabilidad con Pasaporte Digital 3D y marcado CE garantizado.</p>
              </div>

              <div className="signature-box">
                <label>FIRMA DIGITAL CONSTRUCTORA</label>
                <div className="signature-line">
                  Carlos Morales — Constructora Mediterránea S.A.
                </div>
                <small>Al confirmar, aceptas las condiciones generales de contratación de la red MAQNOW.</small>
              </div>

              <div className="contract-actions">
                <button className="btn-secondary" onClick={() => setShowSignContractModal(null)}>
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  onClick={() => handleConfirmContract(showSignContractModal)}
                >
                  Confirmar y Firmar Contrato <Check size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REPORT INCIDENT */}
      {showIncidentModal && (
        <div className="modal-overlay" onClick={() => setShowIncidentModal(null)}>
          <div className="incident-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <AlertTriangle className="title-icon text-amber" />
                <div>
                  <h3>Reportar Avería o Incidencia Técnica</h3>
                  <small>{showIncidentModal.machine_name} · {showIncidentModal.contract_ref}</small>
                </div>
              </div>
              <button className="btn-close" onClick={() => setShowIncidentModal(null)}><X size={18} /></button>
            </div>

            <form onSubmit={handleReportIncident} className="incident-form">
              <label>TÍTULO DE LA INCIDENCIA</label>
              <input
                type="text"
                value={incidentTitle}
                onChange={(e) => setIncidentTitle(e.target.value)}
                placeholder="Ej. Fuga en latiguillo hidráulico de elevación"
                required
              />

              <label>SEVERIDAD / IMPACTO EN OBRA</label>
              <select
                value={incidentSeverity}
                onChange={(e) => setIncidentSeverity(e.target.value)}
              >
                <option value="low">Baja (Equipo operativo, mantenimiento preventivo)</option>
                <option value="medium">Media (Rendimiento reducido o pérdida parcial)</option>
                <option value="high">Alta (Máquina inmovilizada en obra)</option>
                <option value="critical">Crítica (Parada total de obra / Urgente)</option>
              </select>

              <label>DESCRIPCIÓN DETALLADA</label>
              <textarea
                rows="3"
                value={incidentDesc}
                onChange={(e) => setIncidentDesc(e.target.value)}
                placeholder="Describe el síntoma, código de error en pantalla o causas detectadas por el maquinista..."
                required
              />

              <div className="incident-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowIncidentModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-warn-solid">
                  Despachar Asistencia Móvil en Obra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
