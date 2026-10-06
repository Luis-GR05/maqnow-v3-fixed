export const eur = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always' }).format(n || 0);

export const toISO = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
export const todayISO = () => toISO(new Date());
const at = (iso) => new Date(iso + 'T12:00:00');
export const addDays = (iso, n) => {
  const d = at(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
export const daysBetween = (a, b) => Math.round((at(b) - at(a)) / 864e5);
export const fmtDate = (iso) =>
  iso ? at(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const fmtDay = (iso) => (iso ? at(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '—');
export const monthKey = (iso) => iso.slice(0, 7);
export const monthLabel = (key) =>
  new Date(key + '-15T12:00:00').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
export const fmtMin = (m) => (m < 60 ? `${Math.round(m)} min` : `${(m / 60).toFixed(1).replace('.', ',')} h`);

export function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
