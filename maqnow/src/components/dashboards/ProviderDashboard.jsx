import React, { useState, useEffect } from 'react';
import {
  Building2, CalendarDays, Euro, Users, Plus, Truck, Check, Eye,
  ShieldCheck, MapPin, Clock, X, ArrowRight, FileText
} from 'lucide-react';
import { MaqnowAPI } from '../../lib/supabase';

export function ProviderDashboard({ onOpenPassport }) {
  const [machines, setMachines] = useState([]);
  const [requests, setRequests] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(null); // request to quote

  // Add Machine Form State
  const [brand, setBrand] = useState('Caterpillar');
  const [model, setModel] = useState('CAT 303.5 CR Next Gen');
  const [category, setCategory] = useState('excavator');
  const [dailyRate, setDailyRate] = useState('115');
  const [deposit, setDeposit] = useState('600');
  const [location, setLocation] = useState('Base GAM Málaga (Pol. Guadalhorce)');
  const [serial, setSerial] = useState(`SN-${Date.now().toString().slice(-6)}`);

  // Quote Form State
  const [quoteRate, setQuoteRate] = useState('125');
  const [quoteTransport, setQuoteTransport] = useState('150');
  const [quoteDeposit, setQuoteDeposit] = useState('600');
  const [quoteDelivery, setQuoteDelivery] = useState('15 OCT 2026');
  const [quoteNotes, setQuoteNotes] = useState('Equipo disponible en base Málaga con revisión técnica 100% favorable y transporte propio.');

  const loadData = async () => {
    const [m, reqs, r] = await Promise.all([
      MaqnowAPI.getMachines(),
      MaqnowAPI.getRequests(),
      MaqnowAPI.getActiveRentals()
    ]);
    setMachines(m);
    setRequests(reqs);
    setRentals(r);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMachine = async (e) => {
    e.preventDefault();
    await MaqnowAPI.addMachine({
      name: `${brand} ${model}`,
      brand,
      model,
      category,
      three_d_model: category,
      daily_rate: Number(dailyRate),
      deposit_amount: Number(deposit),
      location,
      serial_number: serial,
      provider_name: 'GAM España Alquileres S.A.',
      specs: {
        potencia: 'Stage V compliant',
        marca_ce: 'Certificado oficial verificado',
        incorporacion: 'Flota profesional MAQNOW'
      }
    });
    setShowAddMachineModal(false);
    await loadData();
    alert('¡Nueva máquina dada de alta con Pasaporte Digital 3D generado automáticamente!');
  };

  const handleSendQuote = async (e) => {
    e.preventDefault();
    if (!showQuoteModal) return;

    const days = showQuoteModal.duration_days || 10;
    const totalAmount = Number(quoteRate) * days + Number(quoteTransport);

    await MaqnowAPI.submitQuote({
      request_id: showQuoteModal.id,
      provider_name: 'GAM España Alquileres',
      provider_verified: 'gold',
      machine_name: `${showQuoteModal.machine_type_requested} (Flota GAM)`,
      daily_rate: Number(quoteRate),
      total_price: `${totalAmount.toLocaleString('es-ES')} €`,
      transport: `${quoteTransport} €`,
      deposit: `${quoteDeposit} €`,
      delivery: quoteDelivery,
      score: 95,
      distance: 'Málaga (12 km)',
      tag: 'Mejor equilibrio · Verificado Gold',
      notes: quoteNotes
    });

    setShowQuoteModal(null);
    await loadData();
    alert(`¡Cotización formal de ${totalAmount} € enviada con éxito al cliente!`);
  };

  const availableCount = machines.filter((m) => m.status === 'available').length;
  const rentedCount = machines.filter((m) => m.status === 'rented').length;
  const occupancyRate = machines.length > 0 ? Math.round((rentedCount / machines.length) * 100) : 85;

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <div className="kicker">PANEL ALQUILADOR · GAM ESPAÑA ALQUILERES S.A. · GOLD PARTNER</div>
          <h1>Gestión de Flota y Demanda</h1>
          <p>Cotiza solicitudes cualificadas en tu radio geográfico, gestiona disponibilidad y añade unidades a tu parque.</p>
        </div>
        <button className="primary" onClick={() => setShowAddMachineModal(true)}>
          <Plus size={17} /> Añadir máquina a flota
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics">
        <div className="metric">
          <div className="metric-icon"><CalendarDays /></div>
          <div>
            <span>Ocupación de flota</span>
            <strong>{occupancyRate}%</strong>
            <small>{availableCount} disponibles para alquilar</small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon"><Truck /></div>
          <div>
            <span>Leads en radio 40 km</span>
            <strong>{requests.length}</strong>
            <small>Demanda activa Málaga/Marbella</small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon"><Euro /></div>
          <div>
            <span>Facturación vía MAQNOW</span>
            <strong>24.680 €</strong>
            <small>+32% este mes</small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon"><Users /></div>
          <div>
            <span>Clientes recurrentes</span>
            <strong>19 constructoras</strong>
            <small>100% cobro garantizado</small>
          </div>
        </div>
      </div>

      {/* Main Grid: Fleet on Left, Leads on Right */}
      <div className="dashgrid">
        {/* SECTION 1: INVENTARIO DE FLOTA CON 3D */}
        <section className="dashcard large">
          <div className="cardhead">
            <div>
              <small>PARQUE DE MAQUINARIA REGISTRADO</small>
              <h3>Flota Activa ({machines.length} unidades)</h3>
            </div>
            <button className="outline" onClick={() => setShowAddMachineModal(true)}>
              + Alta Nueva Máquina
            </button>
          </div>

          <div className="fleet-catalog-grid">
            {machines.map((m) => (
              <div className="machine-fleet-card" key={m.id}>
                <div className="fleet-card-top">
                  <span className={`status-pill ${m.status}`}>
                    {m.status === 'available' ? '● Disponible' : m.status === 'rented' ? 'En Obra' : 'Mantenimiento'}
                  </span>
                  <span className="cat-pill">{m.category?.toUpperCase()}</span>
                </div>

                <b>{m.name}</b>
                <div className="fleet-card-meta">
                  <span>{m.brand} · {m.serial_number}</span>
                  <small><MapPin size={11} /> {m.location}</small>
                </div>

                <div className="fleet-card-bottom">
                  <div>
                    <span>Tarifa día:</span>
                    <strong>{m.daily_rate} €</strong>
                  </div>
                  <button
                    className="outline small"
                    onClick={() => onOpenPassport(m)}
                  >
                    <Eye size={13} /> Pasaporte 3D
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: BANDEJA DE LEADS EN RADIO (Solicitudes para cotizar) */}
        <section className="dashcard">
          <div className="cardhead">
            <div>
              <small>SOLICITUDES DE ALQUILER EN TU ZONA</small>
              <h3>Peticiones cualificadas</h3>
            </div>
            <span className="counter">{requests.length}</span>
          </div>

          <div className="leads-list">
            {requests.map((r) => (
              <div className="lead-card" key={r.id}>
                <div className="lead-card-head">
                  <b>{r.machine_type_requested}</b>
                  <span className="badge-days">{r.duration_days} días</span>
                </div>
                <small><MapPin size={11} /> {r.location}</small>
                <div className="lead-card-dates">
                  <span>Periodo: {r.start_date} — {r.end_date}</span>
                </div>
                {r.notes && <p className="lead-notes">"{r.notes}"</p>}

                <div className="lead-action-bar">
                  <span className="req-code">{r.reference_code}</span>
                  <button
                    className="primary small"
                    onClick={() => {
                      setShowQuoteModal(r);
                      setQuoteRate('125');
                    }}
                  >
                    Cotizar oferta →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: CONTRATOS EN CURSO */}
        <section className="dashcard large">
          <div className="cardhead">
            <div>
              <small>CONTRATOS EN EJECUCIÓN</small>
              <h3>Alquileres facturados y en obra</h3>
            </div>
            <Euro />
          </div>

          <div className="rentals-table">
            <div className="table-row head">
              <span>Contrato / Equipo</span>
              <span>Cliente / Obra</span>
              <span>Periodo</span>
              <span>Importe total</span>
              <span>Estado</span>
            </div>
            {rentals.map((r) => (
              <div className="table-row" key={r.id}>
                <div>
                  <b>{r.machine_name}</b>
                  <small>{r.contract_ref}</small>
                </div>
                <div>
                  <b>{r.project_name}</b>
                  <small>{r.location}</small>
                </div>
                <div>
                  <span>{r.start_date}</span>
                  <small>al {r.end_date}</small>
                </div>
                <div>
                  <strong style={{ color: '#b8ff4d' }}>{r.total_amount}</strong>
                  <small>{r.daily_rate}</small>
                </div>
                <div>
                  <span className="status-pill active">Activo en obra</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MODAL 1: ADD MACHINE TO FLEET */}
      {showAddMachineModal && (
        <div className="modal-overlay" onClick={() => setShowAddMachineModal(false)}>
          <div className="add-machine-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Añadir Nueva Máquina a Flota</h3>
              <button className="btn-close" onClick={() => setShowAddMachineModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleAddMachine} className="add-machine-form">
              <label>CATEGORÍA Y MODELO 3D ASOCIADO</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="excavator">Miniexcavadora de cadenas (CAT 303.5 CR 3.5t)</option>
                <option value="boomlift">Plataforma Articulada Diésel (JLG 450AJ 16m)</option>
                <option value="forklift">Manipulador Telescópico (Manitou MT 1440 14m)</option>
                <option value="generator">Grupo Electrógeno Insonorizado (Atlas Copco QAS 60)</option>
                <option value="roller">Rodillo Compactador Tándem (Bomag BW 120 2.5t)</option>
              </select>

              <div className="form-grid-2">
                <div>
                  <label>MARCA</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>MODELO COMERCIAL</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div>
                  <label>TARIFA DÍA (€)</label>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>FIANZA (€)</label>
                  <input
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Nº BASTIDOR / SERIE</label>
                  <input
                    type="text"
                    value={serial}
                    onChange={(e) => setSerial(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label>PARQUE / BASE DE UBICACIÓN</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />

              <div className="compliance-checklist">
                <span><Check size={14} /> Marcado CE original en vigor verificado</span>
                <span><Check /> Ficha técnica e inspección ITV/OCA al día</span>
                <span><Check /> Póliza de seguro de RC empresarial activa</span>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddMachineModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Registrar en Flota y Generar Pasaporte 3D <Check size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SEND QUOTE */}
      {showQuoteModal && (
        <div className="modal-overlay" onClick={() => setShowQuoteModal(null)}>
          <div className="quote-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Truck className="title-icon" />
                <div>
                  <h3>Enviar Cotización a Cliente</h3>
                  <small>Solicitud: {showQuoteModal.reference_code} · {showQuoteModal.machine_type_requested}</small>
                </div>
              </div>
              <button className="btn-close" onClick={() => setShowQuoteModal(null)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSendQuote} className="quote-form">
              <div className="quote-req-summary">
                <div><span>Ubicación:</span> <b>{showQuoteModal.location}</b></div>
                <div><span>Duración requerida:</span> <b>{showQuoteModal.duration_days || 10} días</b></div>
                <div><span>Fechas:</span> <b>{showQuoteModal.start_date} — {showQuoteModal.end_date}</b></div>
              </div>

              <div className="form-grid-3">
                <div>
                  <label>PRECIO DÍA (€)</label>
                  <input
                    type="number"
                    value={quoteRate}
                    onChange={(e) => setQuoteRate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>TRANSPORTE GÓNDOLA (€)</label>
                  <input
                    type="number"
                    value={quoteTransport}
                    onChange={(e) => setQuoteTransport(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>FIANZA (€)</label>
                  <input
                    type="number"
                    value={quoteDeposit}
                    onChange={(e) => setQuoteDeposit(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label>FECHA DE ENTREGA ASEGURADA</label>
              <input
                type="text"
                value={quoteDelivery}
                onChange={(e) => setQuoteDelivery(e.target.value)}
                required
              />

              <label>CONDICIONES Y OBSERVACIONES PARA EL CLIENTE</label>
              <textarea
                rows="3"
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                required
              />

              <div className="quote-total-box">
                <span>TOTAL ESTIMADO (ALQUILER + TRANSPORTE):</span>
                <strong>
                  {(Number(quoteRate) * (showQuoteModal.duration_days || 10) + Number(quoteTransport)).toLocaleString('es-ES')} €
                </strong>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowQuoteModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Enviar Oferta al Cliente <Check size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
