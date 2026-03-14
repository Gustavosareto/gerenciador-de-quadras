-- BANCO DE DADOS SUPABASE (PostgreSQL)
-- Extensões recomendadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. USERS & CUSTOMERS
-- -----------------------------------------------------------------------------
-- Clientes do SaaS (podem ou não ter login)
-- Se tiverem login, vinculamos ao auth.users
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id), -- Link opcional com usuário logado
    name TEXT NOT NULL,
    phone TEXT UNIQUE, -- E.164 formatação
    email TEXT,
    cpf TEXT,
    whatsapp_opt_in_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ativar RLS para Customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Política: Usuário vê seu próprio perfil de cliente
CREATE POLICY "Users can view own customer profile" 
ON public.customers FOR SELECT 
USING (auth.uid() = auth_user_id);

-- -----------------------------------------------------------------------------
-- 2. COMPANIES (ARENAS)
-- -----------------------------------------------------------------------------
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id), -- Dono da Arena (Admin)
    name TEXT NOT NULL,
    slug TEXT UNIQUE, -- URL amigável (ex: /arena-top)
    plan_type TEXT DEFAULT 'FREE', -- FREE, PRO
    
    -- Configurações Financeiras
    convenience_fee_mode TEXT DEFAULT 'FIXED', -- FIXED, PERCENTAGE, ABSORB
    convenience_fee_value NUMERIC(10, 2) DEFAULT 2.00,
    payout_schedule TEXT DEFAULT 'WEEKLY_MONDAY',
    payout_pix_key_type TEXT,
    payout_pix_key TEXT,
    
    -- Configurações de Notificação
    notification_settings JSONB DEFAULT '{"enable_whatsapp": true}'::jsonb,
    
    -- Saldos (Cache)
    balance_available NUMERIC(12, 2) DEFAULT 0.00,
    balance_pending NUMERIC(12, 2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ativar RLS para Companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Politica: Qualquer um pode ver dados públicos da empresa (para reservar)
CREATE POLICY "Public read access for companies" 
ON public.companies FOR SELECT 
USING (true);

-- Politica: Apenas o dono pode editar
CREATE POLICY "Owner can update company" 
ON public.companies FOR UPDATE 
USING (auth.uid() = owner_id);

-- -----------------------------------------------------------------------------
-- 3. RESERVATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    court_id UUID NOT NULL, -- Deveria referenciar tabela de quadras (não inclusa aqui)
    
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    status TEXT NOT NULL CHECK (status IN ('CREATED', 'HOLD', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELED', 'EXPIRED', 'COMPLETED', 'NO_SHOW')),
    
    total_price NUMERIC(10, 2) NOT NULL,
    hold_expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reservations_company_dates ON public.reservations(company_id, start_at, end_at);
CREATE INDEX idx_reservations_customer ON public.reservations(customer_id);

-- Ativar RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Permitir criação anônima (ou autenticada) de reservas
CREATE POLICY "Enable insert for authenticated users only" 
ON public.reservations FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Realtime: Notificar frontend quando status muda
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;

-- -----------------------------------------------------------------------------
-- 4. PAYMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID REFERENCES public.reservations(id) NOT NULL,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    
    -- Valores
    total_amount NUMERIC(10, 2) NOT NULL,
    base_amount NUMERIC(10, 2) NOT NULL,
    service_fee NUMERIC(10, 2) NOT NULL,
    
    -- Custos e Margem
    gateway_fee NUMERIC(10, 2) DEFAULT 0.00,
    platform_net_revenue NUMERIC(10, 2) DEFAULT 0.00,
    
    -- Gateway Info
    provider TEXT DEFAULT 'ABACATE_PAY',
    provider_charge_id TEXT,
    pix_copy_paste TEXT,
    pix_qr_code_url TEXT,
    
    status TEXT NOT NULL CHECK (status IN ('CREATED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    
    expires_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;

-- -----------------------------------------------------------------------------
-- 5. WEBHOOK EVENTS (Idempotência)
-- -----------------------------------------------------------------------------
CREATE TABLE public.webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'PENDING',
    processed_at TIMESTAMP WITH TIME ZONE,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Geralmente acessado apenas via Service Role (backend), então RLS padrão deny-all serve.

-- -----------------------------------------------------------------------------
-- 6. FINANCEIRO (Ledger & Payouts)
-- -----------------------------------------------------------------------------
CREATE TABLE public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    payment_id UUID REFERENCES public.payments(id),
    payout_id UUID, 
    
    type TEXT NOT NULL, -- CREDIT_RESERVATION, DEBIT_FEE...
    amount NUMERIC(12, 2) NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('IN', 'OUT')),
    
    balance_before NUMERIC(12, 2),
    balance_after NUMERIC(12, 2),
    
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.payout_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheduled_date DATE NOT NULL,
    status TEXT DEFAULT 'SCHEDULED',
    total_amount NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES public.payout_batches(id),
    company_id UUID REFERENCES public.companies(id),
    
    amount NUMERIC(12, 2) NOT NULL,
    fee_amount NUMERIC(10, 2) DEFAULT 0.00,
    
    status TEXT DEFAULT 'PENDING',
    bank_account_info JSONB,
    provider_transfer_id TEXT,
    
    attempts INT DEFAULT 0,
    last_error TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. NOTIFICATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE public.notification_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id),
    customer_id UUID REFERENCES public.customers(id),
    reservation_id UUID REFERENCES public.reservations(id),
    
    type TEXT NOT NULL, -- RESERVATION_CONFIRMED, REMINDER_24H...
    channel TEXT DEFAULT 'WHATSAPP',
    template_name TEXT NOT NULL,
    variables_json JSONB,
    
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'SCHEDULED',
    
    provider_message_id TEXT,
    attempts INT DEFAULT 0,
    last_error TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notify_schedule ON public.notification_jobs(status, scheduled_at);

CREATE TABLE public.notification_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES public.notification_jobs(id),
    status TEXT NOT NULL,
    raw_payload JSONB,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);