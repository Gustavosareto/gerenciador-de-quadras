# Arquitetura do Módulo de Pagamentos Pix (SaaS Multi-Empresa)

## 1. Visão Geral da Arquitetura

### Componentes Principais
1.  **Core API (Next.js)**: Recebe requisições de reserva, inicia pagamentos.
2.  **Payment Gateway Integration**: Adaptador para AbacatePay (ou outros).
3.  **Webhook Handler**: Endpoint público para receber callbacks do Gateway.
4.  **Transaction/Ledger Engine**: Lógica central para divisão de valores e atualização de saldos.
5.  **Background Workers (BullMQ/Redis)**:
    *   `ReservationExpirationJob`: Cancela reservas não pagas após 15min.
    *   `PayoutScheduler`: Gera lotes de pagamento semanalmente.
    *   `PayoutExecutor`: Executa as transferências Pix para as arenas.

### Fluxo de Dados
[Cliente] -> [Reserva (HOLD)] -> [Checkout Pix] -> [Gateway]
                                      |
                                  (Webhook)
                                      v
                                [SaaS Backend] -> [Ledger DB]
                                      v
                                [Confirm Reservation]

## 2. Modelagem de Dados (DDL Postgres)

```sql
-- Configurações das Arenas (Companies)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    plan_type VARCHAR(50) DEFAULT 'FREE', -- FREE, PRO
    
    -- Configurações Financeiras
    convenience_fee_mode VARCHAR(50) DEFAULT 'FIXED', -- FIXED, PERCENTAGE, ABSORB
    convenience_fee_value DECIMAL(10, 2) DEFAULT 2.00,
    
    payout_schedule VARCHAR(50) DEFAULT 'WEEKLY_MONDAY',
    payout_pix_key_type VARCHAR(20), -- CPF, CNPJ, EMAIL, PHONE, RANDOM
    payout_pix_key VARCHAR(255),
    
    -- Saldos (Snapshot atualizado por triggers ou aplicação)
    balance_available DECIMAL(12, 2) DEFAULT 0.00,
    balance_pending DECIMAL(12, 2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservas
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    customer_id UUID NOT NULL, -- Link para tabela de users
    court_id UUID NOT NULL, -- Link para tabela de courts
    
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    status VARCHAR(50) NOT NULL, 
    -- CREATED, HOLD, PENDING_PAYMENT, CONFIRMED, CANCELED, EXPIRED, COMPLETED, NO_SHOW
    
    total_price DECIMAL(10, 2) NOT NULL,
    hold_expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pagamentos (Entrada)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES reservations(id),
    company_id UUID REFERENCES companies(id),
    
    -- Valores
    total_amount DECIMAL(10, 2) NOT NULL,       -- O que o cliente pagou (ex: 52.00)
    base_amount DECIMAL(10, 2) NOT NULL,        -- Valor da quadra (ex: 50.00)
    service_fee DECIMAL(10, 2) NOT NULL,        -- Taxa do SaaS cobrada do cliente (ex: 2.00)
    
    -- Custos Internos (Calculados após confirmação para margem)
    gateway_fee DECIMAL(10, 2) DEFAULT 0.00,    -- Custo do AbacatePay (ex: 0.80)
    platform_net_revenue DECIMAL(10, 2) DEFAULT 0.00, -- (ServiceFee - GatewayFee)
    
    -- Controle Gateway
    provider VARCHAR(50) DEFAULT 'ABACATE_PAY',
    provider_charge_id VARCHAR(255),            -- ID no gateway
    pix_copy_paste TEXT,
    pix_qr_code_url TEXT,
    
    status VARCHAR(50) NOT NULL, 
    -- CREATED, PENDING, PAID, FAILED, REFUNDED
    
    expires_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Livro Razão (Ledger) - Auditoria Imutável
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    payment_id UUID REFERENCES payments(id), -- Nullable se for ajuste manual
    payout_id UUID, -- Nullable se for entrada
    
    type VARCHAR(50) NOT NULL, -- CREDIT_RESERVATION, DEBIT_SERVICE_FEE, DEBIT_PAYOUT, DEBIT_REFUND
    amount DECIMAL(12, 2) NOT NULL, -- Sempre positivo
    direction VARCHAR(10) NOT NULL, -- IN (Crédito para Arena), OUT (Débito da Arena)
    
    balance_before DECIMAL(12, 2),
    balance_after DECIMAL(12, 2),
    
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook Idempotency
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(255) UNIQUE NOT NULL, -- ID único vindo do Gateway
    provider VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSED, FAILED
    processed_at TIMESTAMP WITH TIME ZONE,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lotes de Repasse
CREATE TABLE payout_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- SCHEDULED, PROCESSING, COMPLETED
    total_amount DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repasses Individuais (Pix Saída)
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES payout_batches(id),
    company_id UUID REFERENCES companies(id),
    
    amount DECIMAL(12, 2) NOT NULL,
    fee_amount DECIMAL(10, 2) DEFAULT 0.00, -- Taxa de saque antecipado se houver
    
    status VARCHAR(50) DEFAULT 'PENDING', 
    -- PENDING, PROCESSING, SENT, CONFIRMED, FAILED, REJECTED
    
    bank_account_info JSONB, -- Chave Pix usada snapshot
    provider_transfer_id VARCHAR(255), -- ID da transação no banco
    
    attempts INT DEFAULT 0,
    last_error TEXT,
    
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Máquina de Estados e Transições

### Reservation
*   `CREATED` -> (User seleciona horário) -> `HOLD`
*   `HOLD` -> (User solicita checkout) -> `PENDING_PAYMENT`
*   `PENDING_PAYMENT` -> (Webhook Sucesso) -> `CONFIRMED`
*   `PENDING_PAYMENT` -> (Timeout 15m) -> `EXPIRED`
*   `HOLD` -> (Timeout 15m) -> `EXPIRED`
*   `CONFIRMED` -> (Data do jogo passou) -> `COMPLETED`
*   `CONFIRMED` -> (Admin/User cancela) -> `CANCELED`

### Payment
*   `CREATED` -> Gateway API Call -> `PENDING`
*   `PENDING` -> Webhook PAID -> `PAID`
*   `PENDING` -> Webhook EXPIRED/Worker -> `EXPIRED`
*   `PENDING` -> Webhook FAILED -> `FAILED`

## 4. Exemplo Numérico de Transação

**Cenário**: Cliente reserva quadra de R$ 50,00.
**Arena**: Config 'Fixed Fee' de R$ 2,00 (Taxa de Conveniência cobrada do cliente).
**Gateway**: AbacatePay (Custo R$ 0,80).

1.  **Valor Total Cobrado (Pix)**: R$ 52,00.
2.  **Entrada no Gateway**: R$ 52,00 (creditado na conta do SaaS).
3.  **Processamento Interno (Payment Created)**:
    *   `total_amount`: 52.00
    *   `base_amount`: 50.00 (Arena)
    *   `service_fee`: 2.00 (SaaS Revenue Bruta)
4.  **Conciliação (Payment Paid)**:
    *   `gateway_fee`: 0.80 (Custo)
    *   `platform_net_revenue`: 1.20 (2.00 - 0.80)
5.  **Ledger (Lançamentos)**:
    *   Entrada: `CREDIT_RESERVATION` | Amount: 50.00 | Direction: IN -> Balance Pending da Arena sobe 50.00.
    *   Nota: A taxa de 2.00 fica "invisível" para a arena no saldo, ou aparece como item separado dependendo da transparência desejada. Normalmente, a arena só vê os 50.00 que tem a receber.

## 5. Fluxos Detalhados

### A) Criação de Reserva (API `POST /reservations`)
1.  Valida disponibilidade (evita *double booking* no horário/quadra).
2.  Cria **Reservation** com status `HOLD`. `hold_expires_at` = now() + 15min.
3.  Calcula valores (base + taxas).
4.  Chama API AbacatePay -> Cria cobrança Pix.
5.  Cria **Payment** com status `PENDING` e salva `pix_copy_paste`.
6.  Retorna payload para frontend exibir QR Code.

### B) Webhook Recebido (API `POST /webhooks/abacatepay`)
1.  Recebe JSON. Verifica assinatura (HMAC header) do gateway.
2.  Busca ou cria registro em `webhook_events`. Se `event_id` já existe e status=PROCESSED, retorna 200 OK (Idempotência).
3.  Parseia payload. Identifica `chargeId`.
4.  Inicia Transação DB:
    *   Busca `Payment` pelo chargeId.
    *   Verifica valor pago == `total_amount`.
    *   Atualiza `Payment` -> `PAID`.
    *   Atualiza `Reservation` -> `CONFIRMED`.
    *   Insere linha em `ledger_entries` (Crédito Sandbox/Pending para Company).
    *   Atualiza `webhook_events` -> `PROCESSED`.
5.  Retorna 200 OK.

### C) Liberação de Saldo (Worker `ReservationCompletionJob`)
1.  Roda a cada hora.
2.  Busca reservas `CONFIRMED` onde `end_at` < NOW().
3.  Transação DB:
    *   Atualiza `Reservation` -> `COMPLETED`.
    *   Move valor correspondente no Ledger de `balance_pending` para `balance_available`.
    *   (Opcional) Dispara e-mail de avaliação para cliente.

### D) Repasse (Worker `PayoutScheduler`)
1.  Roda Segundas-feiras 08:00.
2.  Para cada Company com `balance_available` > R$ 10,00 (mínimo):
    *   Cria `payout_batch` se não houver.
    *   Cria `payout` com valor total disponível.
    *   Deduz valor de `balance_available` e lança débito `DEBIT_PAYOUT` no Ledger.
    *   Enfileira job para `PayoutExecutor`.
3.  `PayoutExecutor`:
    *   Consome fila.
    *   Chama API banco SaaS (ex: StarkBank, Cora, Inter Enterprise) para Pix de Saída.
    *   Atualiza `payout` -> `SENT`.
    *   Monitora webhook do banco para confirmar `CONFIRMED` ou tratar `FAILED` (estorno para ledger).

## 6. Segurança e Falhas
1.  **Race Conditions**: Ao confirmar reserva, usar `SELECT ... FOR UPDATE` no slot da quadra ou Unique Constraint `(court_id, start_at, end_at)` se a tabela de slots for normalizada.
2.  **Double Spend**: O `event_id` do webhook garante que não processamos o pagamento 2x.
3.  **Falha no Repasse**: Se o Pix de saída falhar (chave inválida), o sistema deve estornar o valor automaticamente para `balance_available` e notificar admin.
4.  **Logging**: Armazenar payload bruto do gateway em `webhook_events` para debug.

## 7. Estrutura de Diretórios Sugerida (Next.js)

```
src/
  lib/
    database/       # Prisma Client ou Kelysi
    queue/          # BullMQ setup
  modules/
    payments/
      services/
        abacate-pay.service.ts
        ledger.service.ts
        payment.service.ts
      types/
        payment.types.ts
      workers/
        payout.worker.ts
        expiration.worker.ts
    reservations/
      services/
        booking.service.ts
  app/
    api/
      webhooks/
        abacate/
          route.ts
```
