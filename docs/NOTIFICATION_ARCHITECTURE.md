# Arquitetura do Módulo de Notificações WhatsApp (SaaS Multi-Empresa)

## 1. Visão Geral

Este módulo gerencia o ciclo de vida das comunicações entre as Arenas e seus Clientes.

### Estratégia de Sender (Remetente)
1.  **Modelo MVP (Shared Sender)**: Um único número de WhatsApp Business API verificado para o SaaS (ex: "SaaS Quadras Notificações").
    *   *Prós*: Setup imediato para novas arenas, custo menor de infra, verificação única na Meta.
    *   *Contras*: O cliente recebe msg de "SaaS Quadras" dizendo "Sua reserva na Arena X...". O contato de resposta deve ser um link `wa.me/numerodaarena`.
2.  **Modelo Pro (BYO-Number)**: A arena conecta o próprio número via WABA (WhatsApp Business Account) Oauth ou API Key.
    *   O SaaS armazena `phone_number_id` e `access_token` criptografados daquele tenant.

## 2. Componentes de Software

1.  **Notification Orchestrator (Service)**: Recebe gatilhos do sistema (ex: `booking.created`) e decide quais mensagens agendar.
2.  **Job Scheduler (BullMQ/Redis)**: Gerencia filas de execução imediata e agendada (Delayed Jobs).
3.  **WhatsApp Adapter (Interface)**: Pattern Adapter para abstrair o provedor (Meta Cloud API, Twilio, Z-API, Gupshup). Facilita troca futura.
4.  **Worker Processor**: Consome a fila, verifica regras de "cancelamento" (se a reserva ainda existe) e dispara o envio.
5.  **Webhook Handler**: Recebe status `sent`, `delivered`, `read`, `failed` e atualiza o histórico.

## 3. Modelagem de Dados

```sql
-- Configuração de Notificações por Empresa
CREATE TABLE company_notification_settings (
    company_id UUID PRIMARY KEY REFERENCES companies(id),
    enable_whatsapp BOOLEAN DEFAULT TRUE,
    enable_reminder_24h BOOLEAN DEFAULT TRUE,
    enable_reminder_2h BOOLEAN DEFAULT TRUE,
    enable_confirmation BOOLEAN DEFAULT TRUE,
    
    -- Para plano PRO (Custom Sender)
    waba_provider VARCHAR(50) DEFAULT 'SAAS_SHARED', -- ou 'META_WABA_OWN'
    waba_phone_number_id VARCHAR(255),
    waba_access_token TEXT, -- Criptografado
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Jobs de Notificação
CREATE TABLE notification_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    customer_id UUID NOT NULL, -- Link para user
    reservation_id UUID REFERENCES reservations(id),
    
    type VARCHAR(50) NOT NULL, 
    -- RESERVATION_CONFIRMED, PAYMENT_CONFIRMED, REMINDER_24H, REMINDER_2H
    
    channel VARCHAR(20) DEFAULT 'WHATSAPP',
    template_name VARCHAR(100) NOT NULL,
    variables_json JSONB NOT NULL, -- Variáveis compiladas para o template
    
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED', 
    -- SCHEDULED, SENT, DELIVERED, READ, FAILED, CANCELED (se reserva cancelada)
    
    provider_message_id VARCHAR(255), -- ID retornado pela API do WhatsApp
    attempts INT DEFAULT 0,
    last_error TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Logs de Eventos (Delivery Receipts)
CREATE TABLE notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES notification_jobs(id),
    status VARCHAR(20) NOT NULL, -- DELIVERED, READ, FAILED
    raw_payload JSONB,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. Templates de Mensagem (HSM)

Como o WhatsApp exige aprovação de templates para iniciar conversas, usaremos templates genéricos com variáveis.

**Importante**: No modelo **Shared Sender**, o template DEVE começar identificando a Arena, pois o nome no topo do chat será o do SaaS.

### A) Confirmacao de Reserva (`booking_confirmation_v1`)
> Olá! Sua reserva na *{{1}}* está confirmada.
> 📅 Data: {{2}} às {{3}}
> 🏟️ Quadra: {{4}}
> 📍 Local: {{5}}
>
> Dúvidas? Fale com a arena aqui: {{6}}

### B) Lembrete (`booking_reminder_v1`)
> Lembrete de Jogo ⚽
> Sua partida na *{{1}}* é em breve!
> 📅 Hoje, {{2}} às {{3}}
>
> Chegue com 10 min de antecedência. Bom jogo!

## 5. Fluxos Detalhados

### 5.1. Gatilho: Pagamento Confirmado
1.  **PaymentService** detecta status `PAID`.
2.  Chama `NotificationService.trigger('PAYMENT_CONFIRMED', reservation)`.
3.  **NotificationService**:
    *   Busca settings da `company_id`. Se `enable_whatsapp` == false, aborta.
    *   Cria Job 1: `RESERVATION_CONFIRMED` (delay: 0, imediato).
    *   Cria Job 2: `REMINDER_24H` (delay: `start_at` - 24h). Se `now` > `start_at - 24h`, não cria.
    *   Cria Job 3: `REMINDER_2H` (delay: `start_at` - 2h).
4.  Persiste jobs com status `SCHEDULED` na tabela `notification_jobs`.
5.  Adiciona jobs na fila do Redis (BullMQ) com o respectivo `delay`.

### 5.2. Worker Execution
1.  BullMQ processa o job no horário agendado.
2.  **Verificação Final**:
    *   Busca o registro na tabela `notification_jobs`.
    *   Verifica se `status` ainda é `SCHEDULED`. Se for `CANCELED`, aborta.
    *   Verifica na tabela `reservations` se o status da reserva é `CONFIRMED`. Se a reserva foi cancelada e o job não, aborta e marca job como `CANCELED`.
3.  **Seleção de Provider**:
    *   Se `settings.waba_provider` == 'SAAS_SHARED': Usa credenciais de env do SaaS.
    *   Se `settings.waba_provider` == 'META_WABA_OWN': Descriptografa token da company.
4.  **Envio**:
    *   Chama API do WhatsApp.
    *   Sucesso: Atualiza job para `SENT`, salva `provider_message_id`.
    *   Erro: Lança exceção para o BullMQ tentar novamente (Backoff exponential). Se erro for 4xx (número inválido), não retenta e marca `FAILED`.

### 5.3. Gatilho: Cancelamento de Reserva
1.  User/Admin cancela reserva.
2.  `NotificationService.onReservationCancelled(reservationId)` é chamado.
3.  Busca todos `notification_jobs` onde `reservation_id = X` e `status = SCHEDULED`.
4.  Update status para `CANCELED`.
5.  (Opcional) Remove da fila do Redis se tiver o Job ID mapeado, ou deixa o worker falhar na "Verificação Final".
6.  Cria novo Job: `RESERVATION_CANCELED` (envio imediato).

## 6. Segurança e Compliance

1.  **Opt-in**: Apenas enviar se o usuário aceitou termos (campo `whatsapp_opt_in_at` na tabela customers).
2.  **Janela de 24h**: O sistema usará Templates (HSM) para todas as notificações de agendamento, pois elas ocorrem fora da janela de conversação livre.
3.  **Rate Limiting**: Configurar limiter na fila para não exceder TPS (Transactions Per Second) do número do SaaS.
