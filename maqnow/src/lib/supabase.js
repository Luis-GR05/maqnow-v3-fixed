import { createClient } from '@supabase/supabase-js';

// Read configuration from Vite env or local overrides
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check localStorage for user-provided runtime credentials
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('maqnow_supabase_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('maqnow_supabase_key') : null;

const activeUrl = storedUrl || envUrl || '';
const activeKey = storedKey || envKey || '';

export const isSupabaseConfigured = Boolean(
  activeUrl &&
  activeKey &&
  !activeUrl.includes('your-project') &&
  !activeKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(activeUrl, activeKey)
  : null;

// Initial rich seed data for immediate offline / demo responsiveness
const SEED_DATA = {
  profiles: [
    {
      id: 'c1111111-1111-1111-1111-111111111111',
      email: 'carlos@mediterranea.es',
      role: 'client',
      company_name: 'Constructora Mediterránea S.A.',
      cif_nif: 'A-29182374',
      phone: '+34 952 10 20 30',
      contact_person: 'Carlos Morales',
      city: 'Málaga',
      postal_code: '29004',
      verified_status: 'gold',
      rating: 4.9,
      avatar: 'CM'
    },
    {
      id: 'p1111111-1111-1111-1111-111111111111',
      email: 'malaga@gamrentals.com',
      role: 'provider',
      company_name: 'GAM España Alquileres S.A.',
      cif_nif: 'A-33291827',
      phone: '+34 902 42 67 25',
      contact_person: 'Javier Peña',
      city: 'Málaga',
      postal_code: '29006',
      verified_status: 'gold',
      rating: 4.9,
      avatar: 'GAM'
    },
    {
      id: 'p2222222-2222-2222-2222-222222222222',
      email: 'antequera@mateco.es',
      role: 'provider',
      company_name: 'mateco Alquiler de Maquinaria',
      cif_nif: 'B-61928374',
      phone: '+34 952 70 80 90',
      contact_person: 'Raúl Gómez',
      city: 'Antequera',
      postal_code: '29200',
      verified_status: 'gold',
      rating: 4.9,
      avatar: 'MTC'
    },
    {
      id: 'l1111111-1111-1111-1111-111111111111',
      email: 'despacho@transur.es',
      role: 'logistics',
      company_name: 'Transportes Especiales Sur S.L.',
      cif_nif: 'B-29102938',
      phone: '+34 622 88 12 94',
      contact_person: 'Manuel Ramos',
      city: 'Málaga',
      postal_code: '29004',
      verified_status: 'gold',
      rating: 5.0,
      avatar: 'TES'
    },
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      email: 'central@maqnow.es',
      role: 'admin',
      company_name: 'MAQNOW Central Operations',
      cif_nif: 'B-99887766',
      phone: '+34 900 83 40 20',
      contact_person: 'Beatriz Campos',
      city: 'Madrid',
      postal_code: '28001',
      verified_status: 'gold',
      rating: 5.0,
      avatar: 'MQN'
    }
  ],
  projects: [
    {
      id: 'pr111111-1111-1111-1111-111111111111',
      name: 'Promoción Málaga Centro — 42 Viviendas',
      location: 'Paseo de Reding 14, Málaga',
      postal_code: '29016',
      site_manager: 'Andrés Varela',
      manager_phone: '+34 611 234 567',
      active_machines_count: 3,
      coverage_pct: 78
    },
    {
      id: 'pr222222-2222-2222-2222-222222222222',
      name: 'Obra Residencial Marbella Golden Mile',
      location: 'Av. Bulevar Príncipe Alfonso von Hohenlohe',
      postal_code: '29602',
      site_manager: 'Lucía Garrido',
      manager_phone: '+34 622 345 678',
      active_machines_count: 2,
      coverage_pct: 54
    },
    {
      id: 'pr333333-3333-3333-3333-333333333333',
      name: 'Ampliación Polígono Industrial Estepona',
      location: 'C/ Herreros s/n, Estepona',
      postal_code: '29680',
      site_manager: 'Jorge Sanz',
      manager_phone: '+34 633 456 789',
      active_machines_count: 1,
      coverage_pct: 91
    }
  ],
  machines: [
    {
      id: 'm1111111-1111-1111-1111-111111111111',
      provider_id: 'p1111111-1111-1111-1111-111111111111',
      provider_name: 'GAM España',
      category: 'excavator',
      name: 'Miniexcavadora de cadenas 3.5t',
      brand: 'Caterpillar',
      model: 'CAT 303.5 CR Next Gen',
      year: 2024,
      serial_number: 'CAT3035-ES-2024-8842',
      daily_rate: 115.00,
      weekly_rate: 580.00,
      deposit_amount: 600.00,
      status: 'available',
      location: 'Base GAM Málaga (Pol. Guadalhorce)',
      postal_code: '29004',
      three_d_model: 'excavator',
      ce_marked: true,
      specs: {
        weight: '3.520 kg',
        depth: '3.11 m',
        power: '18.4 kW (24.7 hp)',
        bucket_width: '500 mm',
        blade: 'Hoja dozer delantera flotante',
        tracks: 'Goma reforzada con tacos de tracción'
      }
    },
    {
      id: 'm2222222-2222-2222-2222-222222222222',
      provider_id: 'p2222222-2222-2222-2222-222222222222',
      provider_name: 'mateco Alquiler',
      category: 'boomlift',
      name: 'Plataforma Articulada Diésel 16m',
      brand: 'JLG',
      model: '450AJ Serie II 4x4',
      year: 2023,
      serial_number: 'JLG450AJ-ES-9102-MTC',
      daily_rate: 138.00,
      weekly_rate: 690.00,
      deposit_amount: 800.00,
      status: 'rented',
      location: 'Obra Residencial Marbella Golden Mile',
      postal_code: '29602',
      three_d_model: 'boomlift',
      ce_marked: true,
      specs: {
        height: '15.72 m',
        outreach: '7.47 m',
        capacity: '250 kg (2 operarios)',
        drive: '4WD todoterreno con eje oscilante',
        jib: 'Plumín articulado 1.24 m 140°'
      }
    },
    {
      id: 'm3333333-3333-3333-3333-333333333333',
      provider_id: 'p1111111-1111-1111-1111-111111111111',
      provider_name: 'GAM España',
      category: 'forklift',
      name: 'Manipulador Telescópico 3.5t / 14m',
      brand: 'Manitou',
      model: 'MT 1440 Easy Stage V',
      year: 2024,
      serial_number: 'MAN1440-ES-4829-GAM',
      daily_rate: 165.00,
      weekly_rate: 820.00,
      deposit_amount: 900.00,
      status: 'available',
      location: 'Base GAM Málaga (Pol. Guadalhorce)',
      postal_code: '29004',
      three_d_model: 'forklift',
      ce_marked: true,
      specs: {
        capacity: '4.000 kg',
        lift_height: '13.53 m',
        reach: '9.46 m',
        power: '55.4 kW Deutz',
        stabilizers: 'Estabilizadores hidráulicos delanteros'
      }
    },
    {
      id: 'm4444444-4444-4444-4444-444444444444',
      provider_id: 'p2222222-2222-2222-2222-222222222222',
      provider_name: 'mateco Alquiler',
      category: 'generator',
      name: 'Grupo Electrógeno Insonorizado 60 kVA',
      brand: 'Atlas Copco',
      model: 'QAS 60 Stage V',
      year: 2023,
      serial_number: 'AC-QAS60-ES-5831-MTC',
      daily_rate: 86.00,
      weekly_rate: 430.00,
      deposit_amount: 500.00,
      status: 'rented',
      location: 'Promoción Málaga Centro — 42 Viviendas',
      postal_code: '29016',
      three_d_model: 'generator',
      ce_marked: true,
      specs: {
        power_prime: '60 kVA / 48 kW',
        voltage: '400V / 230V Trifásico',
        fuel_tank: '170 L (Autonomía 14h)',
        sound_level: '65 dB(A) a 7m',
        lifting: 'Cáncamo central y paso de carretilla'
      }
    },
    {
      id: 'm5555555-5555-5555-5555-555555555555',
      provider_id: 'p1111111-1111-1111-1111-111111111111',
      provider_name: 'RentAlis Equipos',
      category: 'roller',
      name: 'Rodillo Compactador Tándem 2.5t',
      brand: 'Bomag',
      model: 'BW 120 AD-5',
      year: 2024,
      serial_number: 'BOM120-ES-3829-RLS',
      daily_rate: 98.00,
      weekly_rate: 490.00,
      deposit_amount: 500.00,
      status: 'available',
      location: 'Parque RentAlis Marbella',
      postal_code: '29601',
      three_d_model: 'roller',
      ce_marked: true,
      specs: {
        weight: '2.700 kg',
        drum_width: '1.200 mm',
        centrifugal_force: '36 kN',
        vibration: 'Doble tambor con vibración seleccionable',
        water_tank: '220 L presurizado'
      }
    }
  ],
  digital_passports: {
    'm1111111-1111-1111-1111-111111111111': {
      machine_code: 'RM-MQN-000318',
      ce_certificate: 'VERIFICADO · Conformidad 2006/42/CE',
      itv_inspection_date: '15/06/2026',
      itv_expiry_date: '15/06/2027',
      insurance_policy: 'POL-MAPFRE-RC-9842109 (5.000.000 €)',
      insurance_expiry: '30/04/2027',
      hours_meter: 312,
      last_service: '10/08/2026',
      next_service_hours: 500,
      status: '100% AUDITADO',
      service_history: [
        { date: '10/08/2026', desc: 'Revisión oficial 250h. Sustitución aceite motor y filtros hidráulicos.', tech: 'Caterpillar Oficial' },
        { date: '15/06/2026', desc: 'Inspección periódica reglamentaria OCA favorable.', tech: 'TÜV Rheinland' }
      ]
    },
    'm2222222-2222-2222-2222-222222222222': {
      machine_code: 'RM-MQN-000482',
      ce_certificate: 'VERIFICADO · Conformidad UNE-EN 280',
      itv_inspection_date: '12/09/2026',
      itv_expiry_date: '12/09/2027',
      insurance_policy: 'POL-ALLIANZ-RC-8812734 (3.000.000 €)',
      insurance_expiry: '15/05/2027',
      hours_meter: 495,
      last_service: '10/09/2026',
      next_service_hours: 750,
      status: '100% AUDITADO',
      service_history: [
        { date: '10/09/2026', desc: 'Prueba de carga dinámica y calibración de célula de pesaje de cesta.', tech: 'JLG Iberia' },
        { date: '12/09/2026', desc: 'Revisión anual obligatoria de aparatos de elevación de personas.', tech: 'Applus+ IDIADA' }
      ]
    },
    'm3333333-3333-3333-3333-333333333333': {
      machine_code: 'RM-MQN-000512',
      ce_certificate: 'VERIFICADO · Directiva Maquinaria 2006/42/CE',
      itv_inspection_date: '20/05/2026',
      itv_expiry_date: '20/05/2027',
      insurance_policy: 'POL-MAPFRE-RC-9842110',
      insurance_expiry: '30/04/2027',
      hours_meter: 210,
      last_service: '22/07/2026',
      next_service_hours: 500,
      status: '100% AUDITADO',
      service_history: [
        { date: '22/07/2026', desc: 'Engrase general y comprobación de estabilizadores hidráulicos.', tech: 'GAM Taller' }
      ]
    },
    'm4444444-4444-4444-4444-444444444444': {
      machine_code: 'RM-MQN-000194',
      ce_certificate: 'VERIFICADO · Emisiones acústicas 2000/14/CE',
      itv_inspection_date: '18/04/2026',
      itv_expiry_date: '18/04/2027',
      insurance_policy: 'POL-ALLIANZ-RC-8812735',
      insurance_expiry: '15/05/2027',
      hours_meter: 840,
      last_service: '30/08/2026',
      next_service_hours: 1000,
      status: '100% AUDITADO',
      service_history: [
        { date: '30/08/2026', desc: 'Prueba de alternador con banco resistivo y cambio de filtros.', tech: 'Atlas Copco Service' }
      ]
    },
    'm5555555-5555-5555-5555-555555555555': {
      machine_code: 'RM-MQN-000628',
      ce_certificate: 'VERIFICADO · Certificado CE Bomag GmbH',
      itv_inspection_date: '02/07/2026',
      itv_expiry_date: '02/07/2027',
      insurance_policy: 'POL-AXA-EMPRESAS-4491029',
      insurance_expiry: '30/06/2027',
      hours_meter: 140,
      last_service: '15/07/2026',
      next_service_hours: 250,
      status: '100% AUDITADO',
      service_history: [
        { date: '15/07/2026', desc: 'Inspección de sistema de riego y rascadores de tambor.', tech: 'RentAlis Taller' }
      ]
    }
  },
  rental_requests: [
    {
      id: 'rq111111-1111-1111-1111-111111111111',
      reference_code: 'REQ-2026-0841',
      category: 'boomlift',
      machine_type_requested: 'Plataforma Articulada Diésel 16 m',
      quantity: 2,
      location: 'Marbella Obra Residencial (Golden Mile)',
      postal_code: '29602',
      start_date: '10 OCT 2026',
      end_date: '20 OCT 2026',
      duration_days: 10,
      status: 'quoted', // quotes ready
      quotes_count: 3,
      notes: 'Trabajo en fachadas. Imprescindible tracción 4x4 y ruedas que no manchen.'
    },
    {
      id: 'rq222222-2222-2222-2222-222222222222',
      reference_code: 'REQ-2026-0842',
      category: 'excavator',
      machine_type_requested: 'Miniexcavadora 3,5 t con cazo y martillo',
      quantity: 1,
      location: 'Málaga Centro (Paseo de Reding 14)',
      postal_code: '29016',
      start_date: '15 OCT 2026',
      end_date: '25 OCT 2026',
      duration_days: 10,
      status: 'pending',
      quotes_count: 0,
      notes: 'Zanja para acometida eléctrica. Necesaria entrega a primera hora (8:00 AM).'
    },
    {
      id: 'rq333333-3333-3333-3333-333333333333',
      reference_code: 'REQ-2026-0790',
      category: 'generator',
      machine_type_requested: 'Grupo Electrógeno Insonorizado 60 kVA',
      quantity: 1,
      location: 'Málaga Centro (Paseo de Reding 14)',
      postal_code: '29016',
      start_date: '10 SEP 2026',
      end_date: '25 SEP 2026',
      duration_days: 15,
      status: 'accepted',
      quotes_count: 2,
      notes: 'Alimentación temporal de grúa torre.'
    }
  ],
  quotes: [
    {
      id: 'qu111111-1111-1111-1111-111111111111',
      request_id: 'rq111111-1111-1111-1111-111111111111',
      provider_name: 'GAM España',
      provider_verified: 'gold',
      machine_name: 'JLG 450AJ Serie II 4x4 (15.7 m)',
      machine_id: 'm2222222-2222-2222-2222-222222222222',
      daily_rate: 128,
      total_price: '1.280 €',
      transport: '150 €',
      deposit: '600 €',
      delivery: '10 OCT 2026',
      score: 96,
      distance: 'Málaga (12 km)',
      tag: 'Mejor equilibrio · Verificado Gold',
      notes: 'Equipo revisado recientemente. Entrega a las 8:30 AM con góndola propia.',
      status: 'submitted'
    },
    {
      id: 'qu222222-2222-2222-2222-222222222222',
      request_id: 'rq111111-1111-1111-1111-111111111111',
      provider_name: 'mateco Alquiler',
      provider_verified: 'gold',
      machine_name: 'Genie Z-45/25J RT 4WD (16.0 m)',
      machine_id: 'm2222222-2222-2222-2222-222222222222',
      daily_rate: 134,
      total_price: '1.340 €',
      transport: 'Incluido (0 €)',
      deposit: '700 €',
      delivery: '10 OCT 2026',
      score: 93,
      distance: 'Antequera (35 km)',
      tag: 'Transporte gratuito · Alta valoración',
      notes: 'Transporte bonificado al contratar 10 días o más. Seguro a todo riesgo sin franquicia.',
      status: 'submitted'
    },
    {
      id: 'qu333333-3333-3333-3333-333333333333',
      request_id: 'rq111111-1111-1111-1111-111111111111',
      provider_name: 'RentAlis Local',
      provider_verified: 'silver',
      machine_name: 'Haulotte HA16 RTJ Pro (16.0 m)',
      machine_id: 'm2222222-2222-2222-2222-222222222222',
      daily_rate: 118,
      total_price: '1.180 €',
      transport: '100 €',
      deposit: '500 €',
      delivery: '11 OCT 2026',
      score: 89,
      distance: 'Marbella (24 km)',
      tag: 'Precio directo más económico',
      notes: 'Disponibilidad desde el día 11 OCT. Tarifa reducida directa de parque.',
      status: 'submitted'
    }
  ],
  rentals: [
    {
      id: 'rn111111-1111-1111-1111-111111111111',
      contract_ref: 'CTR-MQN-2026-00481',
      machine_id: 'm4444444-4444-4444-4444-444444444444',
      machine_name: 'Grupo Electrógeno Atlas Copco QAS 60',
      provider_name: 'GAM España',
      project_name: 'Promoción Málaga Centro',
      location: 'Paseo de Reding 14, Málaga',
      start_date: '10 SEP 2026',
      end_date: '25 SEP 2026',
      daily_rate: '86 €/día',
      total_amount: '860 €',
      deposit: '500 €',
      status: 'active',
      hours_used: '854 h (42h en esta obra)',
      telemetry: '● Operativo en red · 400V 50Hz estable'
    },
    {
      id: 'rn222222-2222-2222-2222-222222222222',
      contract_ref: 'CTR-MQN-2026-00492',
      machine_id: 'm2222222-2222-2222-2222-222222222222',
      machine_name: 'Plataforma Articulada JLG 450AJ 16m',
      provider_name: 'mateco Alquiler',
      project_name: 'Obra Residencial Marbella',
      location: 'Bulevar Alfonso von Hohenlohe',
      start_date: '01 SEP 2026',
      end_date: '30 SEP 2026',
      daily_rate: '138 €/día',
      total_amount: '2.450 €',
      deposit: '800 €',
      status: 'active',
      hours_used: '495 h (68h en esta obra)',
      telemetry: '● Operativo en red · Batería/Motor 98%'
    }
  ],
  logistics: [
    {
      id: 'lg111111-1111-1111-1111-111111111111',
      machine_name: 'Plataforma Articulada JLG 450AJ',
      carrier: 'Transportes Especiales Sur S.L.',
      truck: 'Camión Góndola Rebajada 3 Ejes (G-8821)',
      driver: 'Manuel Ramos (+34 622 881 294)',
      origin: 'Base mateco Antequera (Pol. La Azucarera)',
      destination: 'Obra Marbella Golden Mile (Av. Bulevar Príncipe)',
      scheduled_date: '10 OCT 2026 · 08:30 h',
      status: 'scheduled', // 'scheduled', 'in_transit', 'delivered'
      signed_by: null
    },
    {
      id: 'lg222222-2222-2222-2222-222222222222',
      machine_name: 'Grupo Electrógeno Atlas Copco 60 kVA',
      carrier: 'Transportes Especiales Sur S.L.',
      truck: 'Camión Pluma 26t con Cabrestante',
      driver: 'Antonio Salmerón (+34 611 902 341)',
      origin: 'Base GAM Málaga (Pol. Guadalhorce)',
      destination: 'Promoción Málaga Centro (Paseo de Reding 14)',
      scheduled_date: '10 SEP 2026 · 09:15 h',
      status: 'delivered',
      signed_by: 'Andrés Varela (Jefe de Obra)'
    }
  ],
  incidents: [
    {
      id: 'in111111-1111-1111-1111-111111111111',
      machine_name: 'Grupo Electrógeno 60 kVA (RM-MQN-000194)',
      title: 'Aviso nivel combustible auxiliar bajo',
      severity: 'low',
      status: 'resolved',
      date: '14 SEP 2026',
      resolution: 'Repostado en obra por servicio móvil GAM.'
    }
  ]
};

// Local storage persistent repository helper
function loadStore() {
  if (typeof window === 'undefined') return SEED_DATA;
  try {
    const raw = localStorage.getItem('maqnow_database_v2');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading local database store', e);
  }
  // Initialize with seed data
  saveStore(SEED_DATA);
  return SEED_DATA;
}

function saveStore(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('maqnow_database_v2', JSON.stringify(data));
  } catch (e) {
    console.warn('Error saving local database store', e);
  }
}

// ==============================================================================
// MAQNOW UNIFIED DATA API (Dual-Mode: Remote Supabase / Local Mock Store)
// ==============================================================================

export const MaqnowAPI = {
  getConnectionStatus() {
    return {
      isConfigured: isSupabaseConfigured,
      activeUrl: activeUrl || '(Modo Local Simulador Activo)',
      provider: isSupabaseConfigured ? 'Supabase Live PostgreSQL' : 'Local Mock Store con Persistencia'
    };
  },

  saveCredentials(url, key) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('maqnow_supabase_url', url.trim());
    localStorage.setItem('maqnow_supabase_key', key.trim());
    window.location.reload();
  },

  clearCredentials() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('maqnow_supabase_url');
    localStorage.removeItem('maqnow_supabase_key');
    window.location.reload();
  },

  // 1. MACHINES / FLEET
  async getMachines() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('machines').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Fallback to local machines', e);
      }
    }
    const store = loadStore();
    return store.machines;
  },

  async addMachine(machineData) {
    const newMachine = {
      id: 'm' + Date.now(),
      created_at: new Date().toISOString(),
      status: 'available',
      ce_marked: true,
      provider_name: machineData.provider_name || 'GAM España Alquileres',
      ...machineData
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('machines').insert([newMachine]).select();
        if (!error && data) return data[0];
      } catch (e) {
        console.warn('Remote machine insert failed, saving locally', e);
      }
    }

    const store = loadStore();
    store.machines.unshift(newMachine);

    // Also register a verified passport for this new machine
    store.digital_passports[newMachine.id] = {
      machine_code: 'RM-MQN-' + Math.floor(100000 + Math.random() * 900000),
      ce_certificate: 'VERIFICADO · Marcado CE Oficial ' + newMachine.brand,
      itv_inspection_date: new Date().toLocaleDateString('es-ES'),
      itv_expiry_date: new Date(Date.now() + 365*24*3600*1000).toLocaleDateString('es-ES'),
      insurance_policy: 'POL-SEGURO-MAQ-' + Math.floor(1000000 + Math.random() * 9000000),
      insurance_expiry: '31/12/2027',
      hours_meter: 0,
      last_service: new Date().toLocaleDateString('es-ES'),
      next_service_hours: 250,
      status: '100% AUDITADO',
      service_history: [
        { date: new Date().toLocaleDateString('es-ES'), desc: 'Puesta en marcha e incorporación al parque MAQNOW.', tech: 'Técnico Oficial' }
      ]
    };

    saveStore(store);
    return newMachine;
  },

  // 2. DIGITAL PASSPORTS
  async getDigitalPassport(machineId) {
    const store = loadStore();
    if (store.digital_passports[machineId]) {
      return store.digital_passports[machineId];
    }
    // Default passport template for any machine
    return {
      machine_code: 'RM-MQN-000' + Math.floor(100 + Math.random() * 900),
      ce_certificate: 'VERIFICADO · Marcado CE Oficial',
      itv_inspection_date: '15/06/2026',
      itv_expiry_date: '15/06/2027',
      insurance_policy: 'POL-MAPFRE-RC-EMPRESAS',
      insurance_expiry: '30/06/2027',
      hours_meter: 320,
      last_service: '01/08/2026',
      next_service_hours: 500,
      status: '100% AUDITADO',
      service_history: [
        { date: '01/08/2026', desc: 'Mantenimiento preventivo oficial y sustitución de filtros.', tech: 'Taller Central' }
      ]
    };
  },

  // 3. RENTAL REQUESTS
  async getRequests() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('rental_requests').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Fallback to local requests', e);
      }
    }
    const store = loadStore();
    return store.rental_requests;
  },

  async createRequest(reqData) {
    const store = loadStore();
    const newReq = {
      id: 'rq' + Date.now(),
      reference_code: 'REQ-2026-0' + Math.floor(850 + Math.random() * 150),
      created_at: new Date().toISOString(),
      status: 'pending',
      quotes_count: 0,
      ...reqData
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('rental_requests').insert([newReq]).select();
        if (!error && data) return data[0];
      } catch (e) {
        console.warn('Remote request insert failed, saving locally', e);
      }
    }

    store.rental_requests.unshift(newReq);
    saveStore(store);
    return newReq;
  },

  // 4. QUOTES & OFFERS
  async getQuotesForRequest(requestId) {
    const store = loadStore();
    return store.quotes.filter(q => q.request_id === requestId);
  },

  async getAllQuotes() {
    const store = loadStore();
    return store.quotes;
  },

  async submitQuote(quoteData) {
    const store = loadStore();
    const newQuote = {
      id: 'qu' + Date.now(),
      created_at: new Date().toISOString(),
      status: 'submitted',
      score: quoteData.score || 94,
      ...quoteData
    };

    store.quotes.unshift(newQuote);

    // Update request state to 'quoted'
    const targetReq = store.rental_requests.find(r => r.id === quoteData.request_id);
    if (targetReq) {
      targetReq.status = 'quoted';
      targetReq.quotes_count = (targetReq.quotes_count || 0) + 1;
    }

    saveStore(store);
    return newQuote;
  },

  async acceptQuote(quoteId, clientSignature = 'Carlos Morales (Constructora Mediterránea)') {
    const store = loadStore();
    const quote = store.quotes.find(q => q.id === quoteId);
    if (!quote) throw new Error('Cotización no encontrada');

    quote.status = 'accepted';

    // Find request
    const req = store.rental_requests.find(r => r.id === quote.request_id);
    if (req) {
      req.status = 'accepted';
    }

    // Create active rental contract
    const contractRef = 'CTR-MQN-2026-00' + Math.floor(500 + Math.random() * 200);
    const newRental = {
      id: 'rn' + Date.now(),
      contract_ref: contractRef,
      machine_id: quote.machine_id || 'm2222222-2222-2222-2222-222222222222',
      machine_name: quote.machine_name || 'Maquinaria en Alquiler',
      provider_name: quote.provider_name || 'Alquilador Verificado',
      project_name: req ? req.location : 'Obra del Cliente',
      location: req ? req.location : 'Málaga',
      start_date: req ? req.start_date : '15 OCT 2026',
      end_date: req ? req.end_date : '25 OCT 2026',
      daily_rate: `${quote.daily_rate || 120} €/día`,
      total_amount: quote.total_price || '1.200 €',
      deposit: quote.deposit || '500 €',
      status: 'active',
      hours_used: '0 h en obra',
      telemetry: '● Equipo despachado · Telemetría activa',
      signed_by: clientSignature,
      signed_date: new Date().toLocaleDateString('es-ES')
    };

    store.rentals.unshift(newRental);

    // Create logistics delivery order
    const newLogistics = {
      id: 'lg' + Date.now(),
      rental_id: newRental.id,
      machine_name: quote.machine_name,
      carrier: 'Transportes Especiales Sur S.L.',
      truck: 'Camión Góndola Rebajada 3 Ejes (G-9104)',
      driver: 'Manuel Ramos (+34 622 881 294)',
      origin: quote.distance ? `Base ${quote.provider_name} (${quote.distance})` : 'Base Alquilador',
      destination: req ? req.location : 'Obra del Cliente',
      scheduled_date: `${quote.delivery || '15 OCT 2026'} · 08:30 h`,
      status: 'scheduled',
      signed_by: null
    };

    store.logistics.unshift(newLogistics);

    saveStore(store);
    return { quote, rental: newRental, logistics: newLogistics };
  },

  // 5. ACTIVE RENTALS
  async getActiveRentals() {
    const store = loadStore();
    return store.rentals;
  },

  // 6. LOGISTICS ORDERS
  async getLogisticsOrders() {
    const store = loadStore();
    return store.logistics;
  },

  async updateLogisticsStatus(orderId, status, details = {}) {
    const store = loadStore();
    const order = store.logistics.find(l => l.id === orderId);
    if (order) {
      order.status = status;
      if (details.signed_by) order.signed_by = details.signed_by;
      if (details.delivery_notes) order.delivery_notes = details.delivery_notes;
      saveStore(store);
    }
    return order;
  },

  // 7. INCIDENTS
  async getIncidents() {
    const store = loadStore();
    return store.incidents;
  },

  async reportIncident(incidentData) {
    const store = loadStore();
    const newIncident = {
      id: 'in' + Date.now(),
      date: new Date().toLocaleDateString('es-ES'),
      status: 'open',
      ...incidentData
    };
    store.incidents.unshift(newIncident);
    saveStore(store);
    return newIncident;
  },

  async resolveIncident(incidentId, resolutionNotes = 'Resuelto satisfactoriamente por servicio móvil.') {
    const store = loadStore();
    const inc = store.incidents.find(i => i.id === incidentId);
    if (inc) {
      inc.status = 'resolved';
      inc.resolution = resolutionNotes;
      saveStore(store);
    }
    return inc;
  },

  // 8. PROJECTS
  async getProjects() {
    const store = loadStore();
    return store.projects;
  },

  // 9. STATS & ANALYTICS
  async getDbStats() {
    const store = loadStore();
    return {
      totalMachines: store.machines.length,
      availableMachines: store.machines.filter(m => m.status === 'available').length,
      activeRentals: store.rentals.length,
      activeRequests: store.rental_requests.length,
      totalQuotes: store.quotes.length,
      logisticsOrders: store.logistics.length,
      incidents: store.incidents.length,
      totalCompanies: store.profiles.length
    };
  },

  // Reset database to seed data
  resetDatabase() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('maqnow_database_v2');
      saveStore(SEED_DATA);
      window.location.reload();
    }
  }
};
