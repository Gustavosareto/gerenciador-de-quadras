# 🚀 Quick Start - AbacatePay + Prisma

## ✅ O que foi implementado?

### Tecnologias
- ✅ **AbacatePay** - Gateway de pagamento PIX
- ✅ **Prisma ORM** - Banco de dados TypeScript-first  
- ✅ **Supabase** - PostgreSQL gerenciado
- ✅ **Next.js 15** - Framework React

### APIs Criadas
- ✅ `POST /api/payments/create-pix` - Gera PIX real
- ✅ `POST /api/payments/webhook` - Recebe confirmação automática

### Banco de Dados
- ✅ 9 tabelas modeladas no Prisma
- ✅ Idempotência de webhooks
- ✅ Sistema de ledger financeiro
- ✅ Histórico completo de pagamentos

## 📋 Configuração (5 minutos)

### 1. Criar conta no AbacatePay

https://app.abacatepay.com/

### 2. Pegar chave de API

1. Faça login
2. Vá em **Configurações** → **API Keys**
3. Copie a chave

### 3. Obter DATABASE_URL do Supabase

1. Acesse seu projeto no Supabase
2. **Settings** → **Database**
3. Copie a **Connection String** (Session Mode)
4. Substitua `[YOUR-PASSWORD]` pela senha real

### 4. Criar `.env.local`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Database (Prisma)
DATABASE_URL=postgresql://postgres:[senha]@db.[projeto].supabase.co:5432/postgres

# AbacatePay
ABACATEPAY_API_KEY=sua_chave_api
ABACATEPAY_DEV_MODE=true

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Gerar Prisma Client

```bash
npx prisma generate
```

### 6. Sincronizar Banco

**Opção A:** Se já tem tabelas do `schema.sql`:
```bash
npx prisma db pull
```

**Opção B:** Criar tabelas do zero:
```bash
npx prisma db push
```

### 7. Iniciar

```bash
npm run dev
```

## 🧪 Testar

### Modo Desenvolvimento
Com `ABACATEPAY_DEV_MODE=true`, você pode:

1. Fazer uma reserva
2. Ver o PIX gerado
3. No painel do AbacatePay, simular o pagamento
4. Webhook é chamado automaticamente!

### Pagamento Real
```bash
ABACATEPAY_DEV_MODE=false
```

Use a chave de API de produção.

## 📊 Ver Dados (Prisma Studio)

```bash
npx prisma studio
```

Interface web abre em `http://localhost:5555`

## 🔄 Fluxo Completo

```
Cliente preenche dados
    ↓
/api/payments/create-pix
    ↓
Cria Customer + Payment (Prisma)
    ↓
Chama AbacatePay
    ↓
Retorna QR Code
    ↓
Cliente paga
    ↓
Webhook recebe notificação
    ↓
Atualiza Payment + Reservation
    ↓
Cria LedgerEntry
    ↓
Atualiza saldo Company
    ↓
✅ Confirmado!
```

## 📁 Estrutura de Arquivos

```
prisma/
  schema.prisma          # Modelos do banco
  migrations/            # Histórico de mudanças
prisma.config.ts         # Config do Prisma 7

src/
  lib/
    prisma.ts           # Cliente Prisma
    supabase.ts         # Cliente Supabase
  
  app/
    api/
      payments/
        create-pix/
          route.ts      # Gera PIX
        webhook/
          route.ts      # Recebe pagamento

docs/
  ABACATEPAY_PRISMA_GUIDE.md  # Guia completo
```

## 💰 Taxas

- **AbacatePay PIX**: 1,99%
- **Sem mensalidade**
- Recebe em 1 dia útil

## 🛠️ Comandos Úteis

```bash
# Gerar cliente após alterar schema
npx prisma generate

# Criar migration
npx prisma migrate dev --name nome

# Abrir Prisma Studio
npx prisma studio

# Ver status das migrations
npx prisma migrate status
```

## 🔗 Links Importantes

- **AbacatePay**: https://app.abacatepay.com/
- **Docs AbacatePay**: https://docs.abacatepay.com
- **Prisma Docs**: https://www.prisma.io/docs
- **Guia Completo**: [docs/ABACATEPAY_PRISMA_GUIDE.md](./ABACATEPAY_PRISMA_GUIDE.md)

## ⚡ Deploy

### Vercel

```bash
vercel

# Adicionar variáveis
vercel env add DATABASE_URL
vercel env add ABACATEPAY_API_KEY
vercel env add ABACATEPAY_DEV_MODE
```

**Webhook URL:**  
`https://seu-projeto.vercel.app/api/payments/webhook`

Configure no painel do AbacatePay!

## 🆘 Problemas Comuns

**Erro: "Prisma Client not generated"**
```bash
npx prisma generate
```

**Erro: "Can't reach database"**  
Verifique `DATABASE_URL` no `.env.local`

**Webhook não funciona localmente?**  
Use [ngrok](https://ngrok.com):
```bash
ngrok http 3000
```

---

**Sistema profissional pronto! 🥑💰**
