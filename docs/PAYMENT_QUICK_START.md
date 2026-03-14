# 🚀 Quick Start - Pagamento PIX Real

## Opção 1: Testar com Simulação (Desenvolvimento)

Sem configurar nada, o sistema já funciona com PIX simulado para você testar o fluxo.

## Opção 2: PIX Real com Asaas (Recomendado)

### 1️⃣ Criar conta grátis
https://www.asaas.com

### 2️⃣ Pegar sua chave de API
https://www.asaas.com/config/api

### 3️⃣ Criar arquivo `.env.local` na raiz do projeto

```bash
PAYMENT_GATEWAY=asaas
ASAAS_API_KEY=$aact_SUA_CHAVE_AQUI
```

### 4️⃣ Reiniciar o servidor

```bash
npm run dev
```

### 5️⃣ Configurar Webhook (após deploy)

No painel Asaas → Configurações → Webhook:
- URL: `https://seudominio.com/api/payments/webhook`
- Eventos: `PAYMENT_RECEIVED` e `PAYMENT_CONFIRMED`

## 🧪 Ambiente de Testes (Sandbox)

Use esta chave para testar sem cobrar de verdade:

```bash
ASAAS_API_KEY=$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwMDAwMDA6OiRhYWNoXzAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMA==
```

## 💰 Taxas

- **Asaas**: 1,99% por PIX
- **Mercado Pago**: 0,99% por PIX

## 📚 Documentação Completa

Veja o guia completo em: [docs/PAYMENT_INTEGRATION_GUIDE.md](./PAYMENT_INTEGRATION_GUIDE.md)

## ❓ Problemas?

1. Verifique se o `.env.local` existe na raiz
2. Reinicie o servidor após criar o `.env.local`
3. Veja o console para mensagens de erro
4. Leia o guia completo na pasta `docs/`
