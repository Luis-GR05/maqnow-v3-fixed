import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Float, ContactShadows, OrbitControls } from '@react-three/drei';
import {
  X, Check, ShieldCheck, FileCheck, QrCode, Clock, Calendar,
  Download, Activity, AlertTriangle, ChevronRight, Info
} from 'lucide-react';
import {
  DetailedExcavator,
  DetailedBoomLift,
  DetailedForklift,
  DetailedGenerator,
  DetailedRoller
} from './3d/MachineryModels';
import { MaqnowAPI } from '../lib/supabase';

function StudioLighting() {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[8, 12, 8]} intensity={3.0} castShadow />
      <directionalLight position={[-8, 8, -6]} intensity={1.5} color="#5eead4" />
      <directionalLight position={[0, -5, 6]} intensity={0.8} color="#b8ff4d" />
      <pointLight position={[0, 6, 0]} intensity={1.5} distance={15} />
      <hemisphereLight intensity={0.8} groundColor="#080d12" color="#e2f5f8" />
    </>
  );
}

export function DigitalPassportModal({ machine, onClose }) {
  const [passport, setPassport] = useState(null);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'docs' | 'maintenance'

  useEffect(() => {
    if (!machine) return;
    MaqnowAPI.getDigitalPassport(machine.id).then(setPassport);
  }, [machine]);

  if (!machine) return null;

  const modelType = machine.three_d_model || machine.category || 'excavator';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="passport-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="passport-modal-header">
          <div className="header-left">
            <span className="badge-live"><span className="pulse" /> PASAPORTE DIGITAL 3D CERTIFICADO</span>
            <h2>{machine.name}</h2>
            <div className="machine-meta">
              <b>{machine.brand} {machine.model}</b> · <span>Año {machine.year || 2024}</span> · <em>{passport?.machine_code || 'RM-MQN-000482'}</em>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Modal Body: 2 Columns (3D Viewer Left + Tech Document Right) */}
        <div className="passport-modal-grid">
          {/* Left Column: 3D Interactive Inspection Viewport */}
          <div className="passport-3d-viewport">
            <div className="viewport-badge">INSPECCIÓN 3D INTERACTIVA · ARRASTRA PARA ROTAR</div>
            <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
              <PerspectiveCamera makeDefault position={[5.2, 2.8, 6.2]} fov={38} />
              <StudioLighting />
              <Suspense fallback={null}>
                <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.1}>
                  {modelType === 'excavator' && <DetailedExcavator progress={0.15} />}
                  {modelType === 'boomlift' && <DetailedBoomLift progress={0.2} />}
                  {modelType === 'forklift' && <DetailedForklift progress={0.2} />}
                  {modelType === 'generator' && <DetailedGenerator progress={0.1} />}
                  {modelType === 'roller' && <DetailedRoller progress={0.15} />}
                </Float>
                <ContactShadows position={[0, -0.65, 0]} opacity={0.6} scale={9} blur={2.2} far={6} color="#000000" />
              </Suspense>
              <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.8} />
            </Canvas>

            {/* Telemetry Footer inside 3D viewport */}
            <div className="telemetry-bar">
              <div>
                <Clock size={14} />
                <span>HORÓMETRO ACTUAL:</span>
                <b>{passport?.hours_meter || 420} HORAS</b>
              </div>
              <div>
                <ShieldCheck size={14} />
                <span>ESTADO:</span>
                <b className="verified-text">100% AUDITADO CE</b>
              </div>
            </div>
          </div>

          {/* Right Column: Tabbed Documentation & Audits */}
          <div className="passport-details-panel">
            {/* Tabs */}
            <div className="passport-tabs">
              <button
                className={activeTab === 'specs' ? 'active' : ''}
                onClick={() => setActiveTab('specs')}
              >
                Ficha Técnica
              </button>
              <button
                className={activeTab === 'docs' ? 'active' : ''}
                onClick={() => setActiveTab('docs')}
              >
                Documentación & CE
              </button>
              <button
                className={activeTab === 'maintenance' ? 'active' : ''}
                onClick={() => setActiveTab('maintenance')}
              >
                Historial de Taller
              </button>
            </div>

            {/* Tab 1: Technical Specs */}
            {activeTab === 'specs' && (
              <div className="tab-content">
                <div className="specs-list">
                  <div className="spec-row">
                    <span>Número de bastidor / Serie:</span>
                    <b>{machine.serial_number || 'CAT3035-ES-2024-8842'}</b>
                  </div>
                  <div className="spec-row">
                    <span>Categoría de maquinaria:</span>
                    <b>{machine.category?.toUpperCase() || 'ELEVACIÓN'}</b>
                  </div>
                  <div className="spec-row">
                    <span>Propietario / Flotista:</span>
                    <b>{machine.provider_name || 'GAM España Alquileres'}</b>
                  </div>
                  <div className="spec-row">
                    <span>Tarifa diaria de referencia:</span>
                    <b>{machine.daily_rate ? `${machine.daily_rate} €/día` : '128 €/día'}</b>
                  </div>

                  {machine.specs && Object.entries(machine.specs).map(([key, val]) => (
                    <div className="spec-row" key={key}>
                      <span style={{ textTransform: 'capitalize' }}>{key.replace('_', ' ')}:</span>
                      <b>{val}</b>
                    </div>
                  ))}
                </div>

                <div className="audit-card">
                  <FileCheck className="audit-icon" />
                  <div>
                    <b>Auditoría Técnica Superada</b>
                    <p>Equipo homologado conforme a la Directiva Europea de Máquinas 2006/42/CE.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Legal Docs & Certificates */}
            {activeTab === 'docs' && (
              <div className="tab-content">
                <div className="doc-cards-grid">
                  <div className="doc-item verified">
                    <div className="doc-icon"><Check /></div>
                    <div>
                      <b>Certificado de Marcado CE</b>
                      <small>Homologación original fabricante con placa troquelada</small>
                      <span>VÁLIDO DE POR VIDA</span>
                    </div>
                  </div>

                  <div className="doc-item verified">
                    <div className="doc-icon"><Check /></div>
                    <div>
                      <b>Inspección Periódica Obligatoria (ITV / OCA)</b>
                      <small>Última: {passport?.itv_inspection_date || '15/06/2026'}</small>
                      <span>VIGENTE HASTA: {passport?.itv_expiry_date || '15/06/2027'}</span>
                    </div>
                  </div>

                  <div className="doc-item verified">
                    <div className="doc-icon"><Check /></div>
                    <div>
                      <b>Seguro de Responsabilidad Civil en Vigor</b>
                      <small>{passport?.insurance_policy || 'POL-MAPFRE-RC-9842109'}</small>
                      <span>VENCIMIENTO: {passport?.insurance_expiry || '30/04/2027'}</span>
                    </div>
                  </div>

                  <div className="doc-item verified">
                    <div className="doc-icon"><Check /></div>
                    <div>
                      <b>Manual de Uso y Mantenimiento en Español</b>
                      <small>Disponible en cabina física y en visor digital</small>
                      <span>DESCARGABLE PDF</span>
                    </div>
                  </div>
                </div>

                <div className="qr-badge-box">
                  <QrCode size={42} />
                  <div>
                    <b>Token de Verificación QR en Obra</b>
                    <small>Cualquier inspector o coordinador de seguridad puede escanear la pegatina NFC de la máquina para validar este pasaporte al instante.</small>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Maintenance & Service History */}
            {activeTab === 'maintenance' && (
              <div className="tab-content">
                <div className="service-timeline">
                  {passport?.service_history?.map((s, idx) => (
                    <div className="timeline-item" key={idx}>
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="timeline-head">
                          <b>{s.date}</b>
                          <span>{s.tech}</span>
                        </div>
                        <p>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                  <div className="timeline-item next">
                    <div className="timeline-dot next" />
                    <div className="timeline-content">
                      <div className="timeline-head">
                        <b>Próxima revisión programada</b>
                        <span>A las {passport?.next_service_hours || 500} horas</span>
                      </div>
                      <p>Mantenimiento preventivo oficial de 500h: sustitución de aceites y filtros hidráulicos.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="passport-footer-actions">
              <button className="btn-secondary" onClick={onClose}>
                Cerrar Pasaporte
              </button>
              <button
                className="btn-primary"
                onClick={() => alert(`Descargando certificado digital oficial del Pasaporte 3D ${passport?.machine_code}...`)}
              >
                <Download size={15} /> Descargar Expediente PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
