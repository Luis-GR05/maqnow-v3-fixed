-- ==============================================================================
-- MAQNOW — B2B Machinery Rental Marketplace Schema
-- PostgreSQL / Supabase Migration Script
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('client', 'provider', 'logistics', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE machine_category AS ENUM (
        'excavator',   -- Movimiento de tierras
        'boomlift',    -- Elevación de personas
        'forklift',    -- Manutención y telescópicos
        'generator',   -- Energía y grupos electrógenos
        'roller',      -- Compactación y pequeña maquinaria
        'tools'        -- Herramientas auxiliares
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE machine_status AS ENUM ('available', 'rented', 'maintenance', 'reserved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('draft', 'pending', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quote_status AS ENUM ('submitted', 'accepted', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE rental_status AS ENUM ('pending_delivery', 'active', 'return_pending', 'completed', 'disputed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE logistics_status AS ENUM ('scheduled', 'in_transit', 'delivered', 'return_scheduled', 'returned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 2. CORE TABLES
-- ------------------------------------------------------------------------------

-- User Profiles (extends auth.users or standalone B2B identity)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    company_name VARCHAR(255) NOT NULL,
    cif_nif VARCHAR(20) NOT NULL,
    phone VARCHAR(30),
    contact_person VARCHAR(120),
    address VARCHAR(255),
    city VARCHAR(100) NOT NULL DEFAULT 'Málaga',
    postal_code VARCHAR(10) NOT NULL DEFAULT '29004',
    verified_status VARCHAR(20) NOT NULL DEFAULT 'gold', -- 'pending', 'silver', 'gold'
    rating NUMERIC(3, 1) DEFAULT 4.9,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Construction Projects / Job Sites (Obras del cliente)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    site_manager VARCHAR(120),
    manager_phone VARCHAR(30),
    active_machines_count INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Machinery Fleet (Parque de maquinaria de alquiladores)
CREATE TABLE IF NOT EXISTS public.machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category machine_category NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL DEFAULT 2024,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    daily_rate NUMERIC(10, 2) NOT NULL,
    weekly_rate NUMERIC(10, 2),
    deposit_amount NUMERIC(10, 2) DEFAULT 500.00,
    status machine_status NOT NULL DEFAULT 'available',
    location VARCHAR(255) NOT NULL,
    postal_code VARCHAR(10) NOT NULL DEFAULT '29004',
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    three_d_model VARCHAR(50) NOT NULL DEFAULT 'excavator',
    specs JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    ce_marked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digital Machine Passports (Pasaporte digital y trazabilidad técnica)
CREATE TABLE IF NOT EXISTS public.digital_passports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
    machine_code VARCHAR(50) UNIQUE NOT NULL,
    ce_certificate_url TEXT,
    itv_inspection_date DATE NOT NULL,
    itv_expiry_date DATE NOT NULL,
    insurance_policy_number VARCHAR(100) NOT NULL,
    insurance_expiry_date DATE NOT NULL,
    insurance_company VARCHAR(100) NOT NULL DEFAULT 'Mapfre Empresas',
    hours_meter INT NOT NULL DEFAULT 420,
    last_service_date DATE NOT NULL,
    next_service_hours INT NOT NULL DEFAULT 500,
    service_history JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(30) DEFAULT 'verified_100',
    qr_code_token VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rental Requests (Solicitudes unificadas de clientes)
CREATE TABLE IF NOT EXISTS public.rental_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    reference_code VARCHAR(30) UNIQUE NOT NULL,
    category machine_category NOT NULL,
    machine_type_requested VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    location VARCHAR(255) NOT NULL,
    postal_code VARCHAR(10) NOT NULL DEFAULT '29004',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INT NOT NULL,
    budget_max NUMERIC(10, 2),
    notes TEXT,
    status request_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes / Offers from Providers (Ofertas cotizadas por alquiladores)
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.rental_requests(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
    daily_rate NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    transport_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    deposit_amount NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    delivery_date DATE NOT NULL,
    distance_km INT NOT NULL DEFAULT 15,
    renting_score INT NOT NULL DEFAULT 94,
    tag VARCHAR(100) DEFAULT 'Recomendado MAQNOW',
    notes TEXT,
    status quote_status NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active Rental Contracts (Contratos de alquiler formalizados)
CREATE TABLE IF NOT EXISTS public.rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    request_id UUID REFERENCES public.rental_requests(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    deposit_amount NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL, -- Comisión MAQNOW (3.5%)
    status rental_status NOT NULL DEFAULT 'active',
    current_hours INT DEFAULT 420,
    digital_signature_client TEXT,
    digital_signature_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logistics & Transport Orders (Órdenes de transporte)
CREATE TABLE IF NOT EXISTS public.logistics_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id UUID NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
    carrier_company VARCHAR(255) NOT NULL DEFAULT 'Transportes Especiales Sur S.L.',
    truck_type VARCHAR(100) NOT NULL DEFAULT 'Camión Góndola Rebajada 3 Ejes',
    driver_name VARCHAR(120) DEFAULT 'Manuel Ramos',
    driver_phone VARCHAR(30) DEFAULT '+34 622 881 294',
    pickup_address VARCHAR(255) NOT NULL,
    delivery_address VARCHAR(255) NOT NULL,
    scheduled_pickup TIMESTAMPTZ NOT NULL,
    scheduled_delivery TIMESTAMPTZ NOT NULL,
    actual_delivery TIMESTAMPTZ,
    status logistics_status NOT NULL DEFAULT 'scheduled',
    delivery_signed_by VARCHAR(120),
    delivery_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Technical Incidents & Maintenance (Partes de incidencia y avería en obra)
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id UUID REFERENCES public.rentals(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity incident_severity NOT NULL DEFAULT 'medium',
    status VARCHAR(30) NOT NULL DEFAULT 'open', -- 'open', 'technician_dispatched', 'resolved'
    assigned_technician VARCHAR(120),
    technician_eta VARCHAR(50),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Reviews & Ratings (Valoraciones de servicio)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id UUID REFERENCES public.rentals(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_machines_category ON public.machines(category);
CREATE INDEX IF NOT EXISTS idx_machines_status ON public.machines(status);
CREATE INDEX IF NOT EXISTS idx_machines_provider ON public.machines(provider_id);
CREATE INDEX IF NOT EXISTS idx_requests_client ON public.rental_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.rental_requests(status);
CREATE INDEX IF NOT EXISTS idx_quotes_request ON public.quotes(request_id);
CREATE INDEX IF NOT EXISTS idx_quotes_provider ON public.quotes(provider_id);
CREATE INDEX IF NOT EXISTS idx_rentals_client ON public.rentals(client_id);
CREATE INDEX IF NOT EXISTS idx_rentals_provider ON public.rentals(provider_id);
CREATE INDEX IF NOT EXISTS idx_passports_machine ON public.digital_passports(machine_id);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read of verified machines, passports, and public profiles
CREATE POLICY "Public machines viewable" ON public.machines FOR SELECT USING (true);
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public passports viewable" ON public.digital_passports FOR SELECT USING (true);
CREATE POLICY "Public requests viewable" ON public.rental_requests FOR SELECT USING (true);
CREATE POLICY "Public quotes viewable" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "Public rentals viewable" ON public.rentals FOR SELECT USING (true);
CREATE POLICY "Public logistics viewable" ON public.logistics_orders FOR SELECT USING (true);
CREATE POLICY "Public incidents viewable" ON public.incidents FOR SELECT USING (true);

-- Allow authenticated insert/update (or permissive during demo/development)
CREATE POLICY "Allow all machine management" ON public.machines FOR ALL USING (true);
CREATE POLICY "Allow all requests management" ON public.rental_requests FOR ALL USING (true);
CREATE POLICY "Allow all quotes management" ON public.quotes FOR ALL USING (true);
CREATE POLICY "Allow all rentals management" ON public.rentals FOR ALL USING (true);
CREATE POLICY "Allow all logistics management" ON public.logistics_orders FOR ALL USING (true);
CREATE POLICY "Allow all incidents management" ON public.incidents FOR ALL USING (true);
CREATE POLICY "Allow all projects management" ON public.projects FOR ALL USING (true);

-- ------------------------------------------------------------------------------
-- 5. REALISTIC SEED DATA (SPAIN MARKET B2B)
-- ------------------------------------------------------------------------------

-- A. Profiles (Constructoras, Alquiladores, Logística, Admin)
INSERT INTO public.profiles (id, email, role, company_name, cif_nif, phone, contact_person, city, postal_code, verified_status, rating)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'carlos@mediterranea.es', 'client', 'Constructora Mediterránea S.A.', 'A-29182374', '+34 952 10 20 30', 'Carlos Morales', 'Málaga', '29004', 'gold', 4.9),
    ('c2222222-2222-2222-2222-222222222222', 'obras@ferrocosta.es', 'client', 'Ferrocosta Obras y Estructuras S.L.', 'B-29472910', '+34 951 88 44 22', 'Elena Rivas', 'Marbella', '29600', 'gold', 4.8),
    ('p1111111-1111-1111-1111-111111111111', 'malaga@gamrentals.com', 'provider', 'GAM España Alquileres S.A.', 'A-33291827', '+34 902 42 67 25', 'Javier Peña', 'Málaga', '29006', 'gold', 4.9),
    ('p2222222-2222-2222-2222-222222222222', 'antequera@mateco.es', 'provider', 'mateco Alquiler de Maquinaria S.L.U.', 'B-61928374', '+34 952 70 80 90', 'Raúl Gómez', 'Antequera', '29200', 'gold', 4.9),
    ('p3333333-3333-3333-3333-333333333333', 'contacto@rentalis.es', 'provider', 'RentAlis Equipos y Flotas del Sur', 'B-93827162', '+34 952 44 33 22', 'Marcos Ortiz', 'Marbella', '29601', 'silver', 4.7),
    ('l1111111-1111-1111-1111-111111111111', 'despacho@transur.es', 'logistics', 'Transportes Especiales Sur S.L.', 'B-29102938', '+34 622 88 12 94', 'Manuel Ramos', 'Málaga', '29004', 'gold', 5.0),
    ('a1111111-1111-1111-1111-111111111111', 'central@maqnow.es', 'admin', 'MAQNOW Central Operations', 'B-99887766', '+34 900 83 40 20', 'Beatriz Campos', 'Madrid', '28001', 'gold', 5.0)
ON CONFLICT (id) DO NOTHING;

-- B. Projects (Obras)
INSERT INTO public.projects (id, client_id, name, location, postal_code, site_manager, manager_phone, active_machines_count)
VALUES
    ('pr111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Promoción Málaga Centro — 42 Viviendas', 'Paseo de Reding 14, Málaga', '29016', 'Andrés Varela', '+34 611 234 567', 3),
    ('pr222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Obra Residencial Marbella Golden Mile', 'Av. Bulevar Príncipe Alfonso von Hohenlohe', '29602', 'Lucía Garrido', '+34 622 345 678', 2),
    ('pr333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Ampliación Polígono Industrial Estepona', 'C/ Herreros s/n, Estepona', '29680', 'Jorge Sanz', '+34 633 456 789', 1)
ON CONFLICT (id) DO NOTHING;

-- C. Machines (Inventario 3D con especificaciones reales)
INSERT INTO public.machines (id, provider_id, category, name, brand, model, year, serial_number, daily_rate, weekly_rate, deposit_amount, status, location, postal_code, three_d_model, specs)
VALUES
    (
        'm1111111-1111-1111-1111-111111111111',
        'p1111111-1111-1111-1111-111111111111',
        'excavator',
        'Miniexcavadora de cadenas 3.5t',
        'Caterpillar',
        'CAT 303.5 CR Next Gen',
        2024,
        'CAT3035-ES-2024-8842',
        115.00,
        580.00,
        600.00,
        'available',
        'Base GAM Málaga (Pol. Guadalhorce)',
        '29004',
        'excavator',
        '{"weight": "3.520 kg", "depth": "3.11 m", "power": "18.4 kW (24.7 hp)", "bucket_width": "500 mm", "tracks": "Goma con zapatas reforzadas", "blade": "Hoja dozer delantera con flotación", "aux_hydraulics": "Doble efecto con caudal proporcional"}'::jsonb
    ),
    (
        'm2222222-2222-2222-2222-222222222222',
        'p2222222-2222-2222-2222-222222222222',
        'boomlift',
        'Plataforma Articulada Diésel 16m',
        'JLG',
        '450AJ Serie II 4x4',
        2023,
        'JLG450AJ-ES-9102-MTC',
        138.00,
        690.00,
        800.00,
        'rented',
        'Obra Residencial Marbella Golden Mile',
        '29602',
        'boomlift',
        '{"height": "15.72 m", "outreach": "7.47 m", "capacity": "250 kg (2 operarios)", "drive": "4WD todoterreno con eje oscilante", "jib": "Plumín articulado 1.24 m 140°", "basket_size": "0.76 x 1.83 m con rodapié y cuadro proporcional"}'::jsonb
    ),
    (
        'm3333333-3333-3333-3333-333333333333',
        'p1111111-1111-1111-1111-111111111111',
        'forklift',
        'Manipulador Telescópico 3.5t / 14m',
        'Manitou',
        'MT 1440 Easy Stage V',
        2024,
        'MAN1440-ES-4829-GAM',
        165.00,
        820.00,
        900.00,
        'available',
        'Base GAM Málaga (Pol. Guadalhorce)',
        '29004',
        'forklift',
        '{"capacity": "4.000 kg", "lift_height": "13.53 m", "reach": "9.46 m", "power": "55.4 kW (75 hp) Deutz", "transmission": "Hidrostática 4x4x4", "stabilizers": "Estabilizadores delanteros hidráulicos", "equipment": "Horquillas flotantes y cuchara"}'::jsonb
    ),
    (
        'm4444444-4444-4444-4444-444444444444',
        'p2222222-2222-2222-2222-222222222222',
        'generator',
        'Grupo Electrógeno Insonorizado 60 kVA',
        'Atlas Copco',
        'QAS 60 Stage V',
        2023,
        'AC-QAS60-ES-5831-MTC',
        86.00,
        430.00,
        500.00,
        'rented',
        'Promoción Málaga Centro — 42 Viviendas',
        '29016',
        'generator',
        '{"power_prime": "60 kVA / 48 kW", "voltage": "400V / 230V Trifásico", "engine": "Kubota V3800-CR-T", "fuel_tank": "170 litros (Autonomía 14h al 75%)", "sound_level": "65 dB(A) a 7m", "sockets": "CETAC 63A 3P+N+T, 32A, 16A + 2x Schuko 16A con diferenciales", "lifting": "Cáncamo central y paso para carretilla"}'::jsonb
    ),
    (
        'm5555555-5555-5555-5555-555555555555',
        'p3333333-3333-3333-3333-333333333333',
        'roller',
        'Rodillo Compactador Tándem 2.5t',
        'Bomag',
        'BW 120 AD-5',
        2024,
        'BOM120-ES-3829-RLS',
        98.00,
        490.00,
        500.00,
        'available',
        'Parque RentAlis Marbella',
        '29601',
        'roller',
        '{"weight": "2.700 kg", "drum_width": "1.200 mm", "centrifugal_force": "36 kN", "vibration": "Doble tambor con vibración seleccionable", "water_tank": "220 litros presurizado con rascadores", "rops": "Arco de seguridad antivuelco plegable"}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- D. Digital Passports (Conexión 3D y marcado CE verificado)
INSERT INTO public.digital_passports (id, machine_id, machine_code, ce_certificate_url, itv_inspection_date, itv_expiry_date, insurance_policy_number, insurance_expiry_date, hours_meter, last_service_date, next_service_hours, status, qr_code_token)
VALUES
    (
        'dp111111-1111-1111-1111-111111111111',
        'm1111111-1111-1111-1111-111111111111',
        'RM-MQN-000318',
        '/docs/ce-cat3035.pdf',
        '2026-06-15',
        '2027-06-15',
        'POL-MAPFRE-RC-9842109',
        '2027-04-30',
        312,
        '2026-08-10',
        500,
        'verified_100',
        'MAQNOW-PASSPORT-CAT3035-9842'
    ),
    (
        'dp222222-2222-2222-2222-222222222222',
        'm2222222-2222-2222-2222-222222222222',
        'RM-MQN-000482',
        '/docs/ce-jlg450aj.pdf',
        '2026-09-12',
        '2027-09-12',
        'POL-ALLIANZ-RC-8812734',
        '2027-05-15',
        495,
        '2026-09-10',
        750,
        'verified_100',
        'MAQNOW-PASSPORT-JLG450AJ-9102'
    ),
    (
        'dp333333-3333-3333-3333-333333333333',
        'm3333333-3333-3333-3333-333333333333',
        'RM-MQN-000512',
        '/docs/ce-manitou1440.pdf',
        '2026-05-20',
        '2027-05-20',
        'POL-MAPFRE-RC-9842110',
        '2027-04-30',
        210,
        '2026-07-22',
        500,
        'verified_100',
        'MAQNOW-PASSPORT-MAN1440-4829'
    ),
    (
        'dp444444-4444-4444-4444-444444444444',
        'm4444444-4444-4444-4444-444444444444',
        'RM-MQN-000194',
        '/docs/ce-atlasqas60.pdf',
        '2026-04-18',
        '2027-04-18',
        'POL-ALLIANZ-RC-8812735',
        '2027-05-15',
        840,
        '2026-08-30',
        1000,
        'verified_100',
        'MAQNOW-PASSPORT-ACQAS60-5831'
    ),
    (
        'dp555555-5555-5555-5555-555555555555',
        'm5555555-5555-5555-5555-555555555555',
        'RM-MQN-000628',
        '/docs/ce-bomag120.pdf',
        '2026-07-02',
        '2027-07-02',
        'POL-AXA-EMPRESAS-4491029',
        '2027-06-30',
        140,
        '2026-07-15',
        250,
        'verified_100',
        'MAQNOW-PASSPORT-BOM120-3829'
    )
ON CONFLICT (id) DO NOTHING;

-- E. Rental Requests (Solicitudes activas)
INSERT INTO public.rental_requests (id, client_id, project_id, reference_code, category, machine_type_requested, quantity, location, postal_code, start_date, end_date, duration_days, budget_max, status, notes)
VALUES
    (
        'rq111111-1111-1111-1111-111111111111',
        'c1111111-1111-1111-1111-111111111111',
        'pr222222-2222-2222-2222-222222222222',
        'REQ-2026-0841',
        'boomlift',
        'Plataforma Articulada Diésel 16 m',
        2,
        'Marbella Obra Residencial (Golden Mile)',
        '29602',
        '2026-10-10',
        '2026-10-20',
        10,
        3000.00,
        'quoted',
        'Trabajo en fachadas de villa residencial. Imprescindible tracción 4x4 y ruedas que no manchen o protegidas.'
    ),
    (
        'rq222222-2222-2222-2222-222222222222',
        'c1111111-1111-1111-1111-111111111111',
        'pr111111-1111-1111-1111-111111111111',
        'REQ-2026-0842',
        'excavator',
        'Miniexcavadora 3,5 t con cazo y martillo',
        1,
        'Málaga Centro (Paseo de Reding 14)',
        '29016',
        '2026-10-15',
        '2026-10-25',
        10,
        1400.00,
        'pending',
        'Excavación de zanja para acometida eléctrica y saneamiento. Necesaria entrega a primera hora (8:00 AM).'
    ),
    (
        'rq333333-3333-3333-3333-333333333333',
        'c1111111-1111-1111-1111-111111111111',
        'pr111111-1111-1111-1111-111111111111',
        'REQ-2026-0790',
        'generator',
        'Grupo Electrógeno Insonorizado 60 kVA',
        1,
        'Málaga Centro (Paseo de Reding 14)',
        '29016',
        '2026-09-10',
        '2026-09-25',
        15,
        1200.00,
        'accepted',
        'Suministro de energía temporal para grúa torre y casetas de obra.'
    )
ON CONFLICT (id) DO NOTHING;

-- F. Quotes for Request REQ-2026-0841 (Ofertas listas para comparar)
INSERT INTO public.quotes (id, request_id, provider_id, machine_id, daily_rate, total_amount, transport_cost, deposit_amount, delivery_date, distance_km, renting_score, tag, notes, status)
VALUES
    (
        'qu111111-1111-1111-1111-111111111111',
        'rq111111-1111-1111-1111-111111111111',
        'p1111111-1111-1111-1111-111111111111',
        'm2222222-2222-2222-2222-222222222222',
        128.00,
        1280.00,
        150.00,
        600.00,
        '2026-10-10',
        12,
        96,
        'Mejor equilibrio · Verificado Gold',
        'Equipo JLG 450AJ 2023 con revisión completa reciente. Entrega garantizada el 10 OCT a las 08:30 h con camión góndola propio.',
        'submitted'
    ),
    (
        'qu222222-2222-2222-2222-222222222222',
        'rq111111-1111-1111-1111-111111111111',
        'p2222222-2222-2222-2222-222222222222',
        'm2222222-2222-2222-2222-222222222222',
        134.00,
        1340.00,
        0.00,
        700.00,
        '2026-10-10',
        35,
        93,
        'Transporte gratuito · Alta valoración',
        'Transporte incluido para alquileres superiores a 7 días. Seguro a todo riesgo sin franquicia incluido en la cotización.',
        'submitted'
    ),
    (
        'qu333333-3333-3333-3333-333333333333',
        'rq111111-1111-1111-1111-111111111111',
        'p3333333-3333-3333-3333-333333333333',
        'm2222222-2222-2222-2222-222222222222',
        118.00,
        1180.00,
        100.00,
        500.00,
        '2026-10-11',
        24,
        89,
        'Precio directo más económico',
        'Disponibilidad a partir del 11 OCT. Tarifa con descuento especial para clientes de la red MAQNOW.',
        'submitted'
    )
ON CONFLICT (id) DO NOTHING;

-- G. Active Rentals (Contratos en obra)
INSERT INTO public.rentals (id, contract_number, quote_id, request_id, client_id, provider_id, machine_id, start_date, end_date, total_amount, deposit_amount, platform_fee, status, current_hours)
VALUES
    (
        'rn111111-1111-1111-1111-111111111111',
        'CTR-MQN-2026-00481',
        'qu111111-1111-1111-1111-111111111111',
        'rq333333-3333-3333-3333-333333333333',
        'c1111111-1111-1111-1111-111111111111',
        'p1111111-1111-1111-1111-111111111111',
        'm4444444-4444-4444-4444-444444444444',
        '2026-09-10',
        '2026-09-25',
        860.00,
        500.00,
        30.10,
        'active',
        854
    ),
    (
        'rn222222-2222-2222-2222-222222222222',
        'CTR-MQN-2026-00492',
        NULL,
        NULL,
        'c1111111-1111-1111-1111-111111111111',
        'p2222222-2222-2222-2222-222222222222',
        'm2222222-2222-2222-2222-222222222222',
        '2026-09-01',
        '2026-09-30',
        2450.00,
        800.00,
        85.75,
        'active',
        495
    )
ON CONFLICT (id) DO NOTHING;

-- H. Logistics Transport Orders (Despacho de portes)
INSERT INTO public.logistics_orders (id, rental_id, carrier_company, truck_type, driver_name, driver_phone, pickup_address, delivery_address, scheduled_pickup, scheduled_delivery, actual_delivery, status, delivery_signed_by)
VALUES
    (
        'lg111111-1111-1111-1111-111111111111',
        'rn111111-1111-1111-1111-111111111111',
        'Transportes Especiales Sur S.L.',
        'Camión Pluma 26t con Cabrestante',
        'Manuel Ramos',
        '+34 622 881 294',
        'Base GAM Málaga (Pol. Guadalhorce, C/ Esteban Salazar Chapela)',
        'Promoción Málaga Centro — Paseo de Reding 14',
        '2026-09-10 07:30:00+02',
        '2026-09-10 09:15:00+02',
        '2026-09-10 09:20:00+02',
        'delivered',
        'Andrés Varela (Jefe de Obra)'
    ),
    (
        'lg222222-2222-2222-2222-222222222222',
        'rn222222-2222-2222-2222-222222222222',
        'Transportes Especiales Sur S.L.',
        'Camión Góndola Rebajada 3 Ejes',
        'Antonio Salmerón',
        '+34 611 902 341',
        'Base mateco Antequera (Pol. La Azucarera)',
        'Obra Residencial Marbella — Av. Bulevar Príncipe Alfonso',
        '2026-09-01 08:00:00+02',
        '2026-09-01 10:45:00+02',
        '2026-09-01 10:40:00+02',
        'delivered',
        'Lucía Garrido (Encargada)'
    )
ON CONFLICT (id) DO NOTHING;

-- I. Incidents (Partes de avería y mantenimiento)
INSERT INTO public.incidents (id, rental_id, machine_id, reporter_id, title, description, severity, status, assigned_technician, technician_eta)
VALUES
    (
        'in111111-1111-1111-1111-111111111111',
        'rn111111-1111-1111-1111-111111111111',
        'm4444444-4444-4444-4444-444444444444',
        'c1111111-1111-1111-1111-111111111111',
        'Aviso de nivel bajo en depósito auxiliar de combustible',
        'Alarma preventiva en pantalla DSE indicando 18% de capacidad de diésel restante. Requiere cuba de repostaje en obra.',
        'low',
        'resolved',
        'Paco Benítez (Servicio Móvil GAM)',
        'Resuelto en obra'
    )
ON CONFLICT (id) DO NOTHING;
