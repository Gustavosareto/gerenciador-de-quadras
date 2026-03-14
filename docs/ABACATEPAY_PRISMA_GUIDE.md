# 🥑 Guia de Integração - AbacatePay + Prisma

## 📋 Visão Geral

Sistema completo de pagamento PIX integrado com **AbacatePay** e banco de dados gerenciado pelo **Prisma ORM**.

### Stack Implementada
- ✅ **AbacatePay** - Gateway de pagamento brasileiro
- ✅ **Prisma** - ORM TypeScript-first
- ✅ **Supabase** - PostgreSQL gerenciado
- ✅ **Next.js 15** - Framework React

## 🚀 Configuração Rápida

### 1️⃣ AbacatePay - Criar Conta

1. Acesse: https://app.abacatepay.com/
2. Crie uma conta gratuita
3. Complete o cadastro

### 2️⃣ Obter Chave de API

1. Faça login no painel AbacatePay
2. Vá em **Configurações** → **API Keys**
3. Copie sua **API Key**

### 3️⃣ Configurar Banco de Dados

Seu Supabase já tem a DATABASE_URL. Para obter:

1. Acesse o painel do Supabase
2. Vá em **Settings** → **Database**
3. Copie a **Connection String** (Modo: Session)

### 4️⃣ Variáveis de Ambiente

Crie `.env.local` na raiz do projeto:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Database URL (do Supabase)
DATABASE_URL=postgresql://postgres:[senha]@db.[projeto].supabase.co:5432/postgres

# AbacatePay
ABACATEPAY_API_KEY=sua_chave_api
ABACATEPAY_DEV_MODE=true

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5️⃣ Gerar Prisma Client

```bash
npx prisma generate
```

### 6️⃣ Sincronizar Schema com Banco

```bash
# Se o banco já tem tabelas (do schema.sql)
npx prisma db pull

# Ou se for criar as tabelas do zero
npx prisma db push
```

### 7️⃣ Iniciar Aplicação

```bash
npm run dev
```

## 🏗️ Estrutura do Prisma

### Schema Principal

```prisma
model Customer {
  id              String
  name            String
  phone           String?
  cpf             String?
  reservations    Reservation[]
}

model Company {
  id              String
  name            String
  slug            String?
  courts          Court[]
  reservations    Reservation[]
  payments        Payment[]
}

model Reservation {
  id              String
  companyId       String
  customerId      String
  courtId         String
  startAt         DateTime
  endAt           DateTime
  status          String
  totalPrice      Decimal
  payments        Payment[]
}

model Payment {
  id                  String
  reservationId       String
  companyId           String
  totalAmount         Decimal
  serviceFee          Decimal
  provider            String
  providerChargeId    String?
  pixCopyPaste        String?
  status              String
}
```

## 🔌 API AbacatePay

### Criar Cobrança PIX

```typescript
POST /api/payments/create-pix

Body:
{
  "amount": 50.00,
  "customerName": "João Silva",
  "customerDocument": "12345678900",
  "customerPhone": "(11) 99999-9999",
  "description": "Reserva Quadra 1 - 29/01/2026 às 19:00",
  "companyId": "uuid-da-empresa"
}

Response:
{
  "paymentId": "uuid-do-payment",
  "pixChargeId": "pix_char_123456",
  "pixCode": "00020126580014br.gov.bcb.pix...",
  "qrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAA...",
  "amount": 50.00,
  "status": "PENDING",
  "expiresAt": "2026-01-29T20:30:00.000Z",
  "platformFee": 0.98,
  "devMode": true
}
```

### Webhook

```typescript
POST /api/payments/webhook

Body (AbacatePay envia):
{
  "event": "pixQrCode.paid",
  "data": {
    "id": "pix_char_123456",
    "amount": 5000,
    "status": "PAID",
    "brCode": "00020126580014br.gov.bcb.pix...",
    "brCodeBase64": "data:image/png;base64,...",
    "platformFee": 98,
    "expiresAt": "2026-01-29T20:30:00.000Z",
    ...
  }
}

Eventos:
- pixQrCode.paid - Pagamento confirmado ✅
- pixQrCode.expired - PIX expirado ⏰
```

## 🧪 Testando

### Modo Desenvolvimento (Dev Mode)

Com `ABACATEPAY_DEV_MODE=true`, os pagamentos são simulados:

1. Crie uma reserva
2. Veja o PIX gerado
3. No painel do AbacatePay, simule o pagamento
4. O webhook será chamado automaticamente

### Pagamento Real

1. Configure `ABACATEPAY_DEV_MODE=false`
2. Use chave de API de produção
3. Faça um pagamento de teste (R$ 1,00)

## 📊 Prisma Studio

Para visualizar/editar dados:

```bash
npx prisma studio
```

Abre interface web em `http://localhost:5555`

## 🔄 Fluxo Completo

```
1. Cliente escolhe quadra e horário
   ↓
2. Frontend chama /api/payments/create-pix
   ↓
3. API cria Customer + Payment no Prisma
   ↓
4. API chama AbacatePay para gerar PIX
   ↓
5. Frontend exibe QR Code
   ↓
6. Cliente paga no banco
   ↓
7. AbacatePay chama /api/payments/webhook
   ↓
8. Webhook atualiza Payment e Reservation (Prisma)
   ↓
9. Cria LedgerEntry e atualiza saldo da Company
   ↓
10. Cliente recebe confirmação!
```

## 🔐 Segurança

### Validação de Webhook

```typescript
// Em webhook/route.ts
const signature = request.headers.get('x-abacatepay-signature');

// Validar assinatura (quando AbacatePay fornecer)
if (!isValidSignature(signature, body)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

### Idempotência

O webhook usa a tabela `WebhookEvent` para evitar processar o mesmo evento duas vezes:

```typescript
const existingEvent = await prisma.webhookEvent.findUnique({
    where: { eventId: `${body.kind}_${body.data.id}` },
});

if (existingEvent?.status === 'PROCESSED') {
    return NextResponse.json({ duplicate: true });
}
```

## 🛠️ Comandos Úteis

```bash
# Gerar cliente Prisma após alterar schema
npx prisma generate

# Criar migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Resetar banco (CUIDADO!)
npx prisma migrate reset

# Ver status das migrations
npx prisma migrate status

# Abrir Prisma Studio
npx prisma studio
```

## 📱 Configurar Webhook no AbacatePay

Após fazer deploy:

1. Acesse: https://app.abacatepay.com/
2. Vá em **Configurações** → **Webhooks**
3. Adicione: `https://seudominio.com/api/payments/webhook`
4. Selecione eventos:
   - ✅ `pixQrCode.paid` - Pagamento confirmado
   - ✅ `pixQrCode.expired` - PIX expirado

## 💰 Taxas

### AbacatePay
- **PIX**: 1,99% por transação
- **Sem mensalidade**
- Recebe em **1 dia útil**

## 🔄 Migrações Importantes

### Sincronizar Schema SQL → Prisma

Se você já tinha o `schema.sql` rodando no Supabase:

```bash
# Importar estrutura existente
npx prisma db pull

# Revisar schema.prisma gerado
# Fazer ajustes necessários

# Gerar cliente
npx prisma generate
```

### Criar Nova Tabela

```prisma
// Em schema.prisma
model NovaTabel {
  id        String   @id @default(uuid())
  campo     String
  createdAt DateTime @default(now())
}
```

```bash
npx prisma migrate dev --name adiciona_nova_tabela
npx prisma generate
```

## 📖 Documentação

- **AbacatePay**: https://docs.abacatepay.com
- **Prisma**: https://www.prisma.io/docs
- **Supabase**: https://supabase.com/docs

## 🐛 Troubleshooting

### Erro: "Prisma Client not generated"

```bash
npx prisma generate
```

### Erro: "Can't reach database server"

Verifique se `DATABASE_URL` está correto no `.env.local`

### Erro: "P2002: Unique constraint failed"

Já existe um registro com esse valor único (email, phone, slug, etc)

### Webhook não recebe notificação

1. URL do webhook está configurada no painel?
2. A URL é acessível publicamente?
3. Para testes locais, use [ngrok](https://ngrok.com)

```bash
ngrok http 3000
# Use a URL gerada no painel do AbacatePay
```

## 🚀 Deploy

### Vercel

```bash
vercel

# Adicionar variáveis
vercel env add DATABASE_URL
vercel env add ABACATEPAY_API_KEY
vercel env add ABACATEPAY_DEV_MODE
```

### Railway

```bash
railway login
railway init
railway up

# Adicionar variáveis no dashboard
```

### Render

1. Conecte repositório
2. Configure variáveis de ambiente
3. Deploy automático

---

**Sistema pronto para receber pagamentos reais via PIX com AbacatePay! 🥑💰**
