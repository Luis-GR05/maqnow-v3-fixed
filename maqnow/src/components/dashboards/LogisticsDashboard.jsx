import React, { useState, useEffect } from 'react';
import {
  Truck, CalendarDays, MapPin, Check, Clock, FileCheck, Phone,
  X, ArrowRight, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { MaqnowAPI } from '../../lib/supabase';

export function LogisticsDashboard() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);
  const [receiverName, setReceiverName] = useState('Andrés Varela (Jefe de Obra)');
  const [initialHours, setInitialHours] = useState('420');
  const [fuelCheck, setFuelCheck] = useState('100% (Depósito lleno)');
  const [deliveryNotes, setDeliveryNotes] = useState('Equipo descargado en zona habilitada de obra sin desperfectos estéticos ni mecánicos.');

  const loadData = async () => {
    const data = await MaqnowAPI.getLogisticsOrders();
    setOrders(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartTransit = async (orderId) => {
    await MaqnowAPI.updateLogisticsStatus(orderId, 'in_transit');
    await loadData();
    alert('Transporte iniciado. Estado actualizado a: En tránsito hacia la obra.');
  };

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!selectedOrderForDelivery) return;

    await MaqnowAPI.updateLogisticsStatus(selectedOrderForDelivery.id, 'delivered', {
      signed_by: receiverName,
      delivery_notes: `${deliveryNotes} | Horómetro: ${initialHours}h | Combustible: ${fuelCheck}`
    });

    setSelectedOrderForDelivery(null);
    await loadData();
    alert(`¡Albarán digital firmado con éxito por ${receiverName}! Entrega completada.`);
  };

  const scheduledCount = orders.filter((o) => o.status === 'scheduled').length;
  const inTransitCount = orders.filter((o) => o.status === 'in_transit').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <div className="kicker">PANEL LOGÍSTICO · TRANSPORTES ESPECIALES SUR S.L. · FLOTA DE GÓNDOLAS</div>
          <h1>Despacho y Trazabilidad de Portes</h1>
          <p>Supervisa recogidas en parque de alquiladores, asigna camiones y formaliza albaranes digitales en obra.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics">
        <div className="metric">
          <div className="metric-icon"><CalendarDays /></div>
          <div>
            <span>Portes programados</span>
            <strong>{scheduledCount}</strong>
            <small>Próximas 48 horas</small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon"><Truck /></div>
          <div>
            <span>En tránsito hoy</span>
            <strong>{inTransitCount}</strong>
            <small>En ruta por carretera</small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon"><CheckCircle2 /></div>
          <div>
            <span>Entregas completadas</span>
            <strong>{deliveredCount}</strong>
            <small>Con albarán digital firmado</small>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon"><ShieldCheck /></div>
          <div>
            <span>Flota asignada</span>
            <strong>6 camiones</strong>
            <small>Góndolas rebajadas y plumas</small>
          </div>
        </div>
      </div>

      {/* Orders Table & Dispatch Section */}
      <div className="dashgrid">
        <section className="dashcard large" style={{ gridColumn: '1 / -1' }}>
          <div className="cardhead">
            <div>
              <small>HOJA DE RUTA Y EXPEDICIONES</small>
              <h3>Órdenes de Transporte de Maquinaria</h3>
            </div>
          </div>

          <div className="logistics-orders-list">
            {orders.map((o) => (
              <div className="logistics-card" key={o.id}>
                <div className="logistics-card-head">
                  <div className="logistics-title">
                    <Truck className="truck-icon" />
                    <div>
                      <b>{o.machine_name}</b>
                      <small>{o.truck} · Conductor: {o.driver}</small>
                    </div>
                  </div>

                  <span className={`status-pill ${o.status}`}>
                    {o.status === 'scheduled' ? 'Programado' : o.status === 'in_transit' ? 'En Tránsito' : 'Entregado en Obra'}
                  </span>
                </div>

                <div className="route-flow">
                  <div className="route-step">
                    <span className="dot-origin" />
                    <div>
                      <small>ORIGEN (BASE ALQUILADOR)</small>
                      <b>{o.origin}</b>
                    </div>
                  </div>

                  <div className="route-arrow">
                    <ArrowRight size={18} />
                    <span>Ruta optimizada</span>
                  </div>

                  <div className="route-step">
                    <span className="dot-dest" />
                    <div>
                      <small>DESTINO (OBRA CLIENTE)</small>
                      <b>{o.destination}</b>
                    </div>
                  </div>
                </div>

                <div className="logistics-card-footer">
                  <div className="scheduled-badge">
                    <Clock size={14} /> Fecha entrega: <b>{o.scheduled_date}</b>
                  </div>

                  {o.signed_by && (
                    <div className="signed-badge">
                      <Check size={14} /> Firmado por: <b>{o.signed_by}</b>
                    </div>
                  )}

                  <div className="logistics-actions">
                    {o.status === 'scheduled' && (
                      <button
                        className="outline small"
                        onClick={() => handleStartTransit(o.id)}
                      >
                        Iniciar transporte
                      </button>
                    )}

                    {o.status !== 'delivered' ? (
                      <button
                        className="primary small"
                        onClick={() => setSelectedOrderForDelivery(o)}
                      >
                        <FileCheck size={14} /> Albarán de entrega en obra
                      </button>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '11px' }}>
                        Albarán completado y archivado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MODAL: DIGITAL DELIVERY NOTE (Albarán digital) */}
      {selectedOrderForDelivery && (
        <div className="modal-overlay" onClick={() => setSelectedOrderForDelivery(null)}>
          <div className="delivery-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FileCheck className="title-icon" />
                <div>
                  <h3>Albarán Digital de Entrega en Obra</h3>
                  <small>Recepción y comprobación de estado de la maquinaria</small>
                </div>
              </div>
              <button className="btn-close" onClick={() => setSelectedOrderForDelivery(null)}><X size={18} /></button>
            </div>

            <form onSubmit={handleConfirmDelivery} className="delivery-form">
              <div className="delivery-summary-card">
                <div><span>Máquina entregada:</span> <b>{selectedOrderForDelivery.machine_name}</b></div>
                <div><span>Camión de porte:</span> <b>{selectedOrderForDelivery.truck}</b></div>
                <div><span>Lugar de descarga:</span> <b>{selectedOrderForDelivery.destination}</b></div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label>HORÓMETRO DE RECEPCIÓN (HORAS)</label>
                  <input
                    type="number"
                    value={initialHours}
                    onChange={(e) => setInitialHours(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>ESTADO DE COMBUSTIBLE</label>
                  <input
                    type="text"
                    value={fuelCheck}
                    onChange={(e) => setFuelCheck(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label>NOMBRE DEL RECEPTOR / ENCARGADO EN OBRA</label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Nombre y DNI del receptor"
                required
              />

              <label>OBSERVACIONES DE RECEPCIÓN TÉCNICA</label>
              <textarea
                rows="2"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                required
              />

              <div className="signature-box">
                <label>FIRMA CONFORME DEL RECEPTOR EN OBRA</label>
                <div className="signature-line">
                  {receiverName} — Firma Biométrica Digital
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setSelectedOrderForDelivery(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Validar Albarán y Confirmar Entrega <Check size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
