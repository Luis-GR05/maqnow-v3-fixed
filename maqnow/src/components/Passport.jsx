import React from 'react';
import { Check, X } from 'lucide-react';
import { familyById } from '../data/catalog';
import { DOCS } from '../data/providers';
import { actions, providerById } from '../lib/store';
import { fmtDate } from '../lib/format';
import { FamilyIcon, Modal, Status } from './ui';

export const docsPct = (m) => Math.round((DOCS.filter((d) => m.docs[d]).length / DOCS.length) * 100);

// Pasaporte digital de una máquina: datos, mantenimiento y documentación
export function PassportModal({ machine: m, s, editable, onClose }) {
  const p = providerById(m.providerId, s);
  const incidents = s.incidents.filter((i) => s.rentals.some((r) => r.id === i.rentalId && r.machineIds?.includes(m.id)));
  return (
    <Modal title="Pasaporte digital" onClose={onClose} wide>
      <div className="passport">
        <div className="passport-head">
          <div className="passport-icon"><FamilyIcon id={m.family} size={34} /></div>
          <div>
            <span className="code">{m.id}</span>
            <h3>{m.type}{m.size ? `, ${m.size}` : ''}</h3>
            <p>{familyById(m.family).name} · {p.name}</p>
          </div>
          <Status value={m.status} />
        </div>
        <dl className="specs">
          <div><dt>Fabricante</dt><dd>{m.brand}</dd></div>
          <div><dt>Año</dt><dd>{m.year}</dd></div>
          <div><dt>N.º de serie</dt><dd>{m.serial}</dd></div>
          <div><dt>Horas</dt><dd>{m.hours.toLocaleString('es-ES')} h</dd></div>
          <div><dt>Último mantenimiento</dt><dd>{fmtDate(m.lastMaint)}</dd></div>
          <div><dt>Próximo mantenimiento</dt><dd>{fmtDate(m.nextMaint)}</dd></div>
          <div><dt>Última inspección</dt><dd>{fmtDate(m.lastInspection)}</dd></div>
          <div><dt>Incidencias registradas</dt><dd>{incidents.length}</dd></div>
        </dl>
        <div className="doc-head"><b>Documentación</b><span>{docsPct(m)} % completa</span></div>
        <ul className="doc-list">
          {DOCS.map((d) => (
            <li key={d} className={m.docs[d] ? 'ok' : 'missing'}>
              {m.docs[d] ? <Check size={16} /> : <X size={16} />}
              <span>{d}</span>
              {editable
                ? <button className="link" onClick={() => actions.toggleDoc(m.id, d)}>{m.docs[d] ? 'Quitar' : 'Marcar como subido'}</button>
                : <em>{m.docs[d] ? 'Disponible' : 'Pendiente del proveedor'}</em>}
            </li>
          ))}
        </ul>
        <p className="hint">En esta demo los documentos son solo un registro de estado; todavía no hay archivos adjuntos.</p>
      </div>
    </Modal>
  );
}
