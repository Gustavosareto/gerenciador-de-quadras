# Guia de Debug - Erro na Criação do PIX

## Problema Atual
A API retorna um erro vazio `{}` ao tentar criar um PIX.

## Passos para Debugar

### 1. Verificar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# AbacatePay Gateway
ABACATEPAY_API_KEY=sua_api_key_aqui
ABACATEPAY_DEV_MODE=true
```

**Checklist:**
- [ ] Arquivo `.env.local` existe?
- [ ] `DATABASE_URL` está configurado corretamente?
- [ ] `ABACATEPAY_API_KEY` está configurado?
- [ ] Reiniciou o servidor após criar/editar `.env.local`?

### 2. Verificar Conexão com o Banco de Dados

Execute o comando:
```bash
npx prisma db pull
```

Se der erro, sua `DATABASE_URL` está incorreta ou o banco não está acessível.

### 3. Verificar Tabelas do Banco

Execute:
```bash
npx prisma studio
```

Verifique se as tabelas `Customer`, `Payment`, `Reservation` existem.

Se não existirem, execute:
```bash
npx prisma db push
```

### 4. Testar API Key do AbacatePay

Execute este curl para testar sua API key:
```bash
curl -X POST https://api.abacatepay.com/v1/pixQrCode/create \
  -H "Authorization: Bearer SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "expiresIn": 1800,
    "customer": {
      "name": "Teste",
      "cellphone": "11999999999",
      "email": "teste@teste.com",
      "taxId": "12345678901"
    },
    "metadata": {
      "test": true
    }
  }'
```

Substitua `SUA_API_KEY` pela sua chave real.

### 5. Analisar Logs do Terminal

Com o servidor rodando (`npm run dev`), ao tentar criar um PIX, você verá logs no formato:

```
📥 Request recebido: { amount: 100, customerName: 'João', ... }
🔑 ABACATEPAY_API_KEY existe: true
💾 Conectando ao banco de dados...
👤 Buscando/criando cliente...
🥑 Chamando AbacatePay API...
📡 Response status: 200
✅ AbacatePay respondeu: { id: 'xxx', status: 'PENDING' }
💾 Salvando pagamento no banco...
✅ Pagamento salvo: xxx
🎉 PIX gerado com sucesso!
```

**Identifique onde o fluxo para:**

#### Se parar em 🔑 (API Key)
- Variável `ABACATEPAY_API_KEY` não está configurada
- Reinicie o servidor após configurar

#### Se parar em 💾 (Banco)
- `DATABASE_URL` incorreta
- Banco de dados inacessível
- Execute `npx prisma db push`

#### Se parar em 👤 (Cliente)
- Erro ao buscar/criar customer no Prisma
- Verifique tabela `Customer` existe
- Verifique campos do schema correspondem ao banco

#### Se parar em 🥑 (AbacatePay)
- API key inválida
- Erro no formato do request
- Teste com curl (passo 4)

#### Se parar em 📡 (Response)
- AbacatePay retornou erro
- Veja o log `❌ Erro AbacatePay:` com detalhes

### 6. Erros Comuns e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| "ABACATEPAY_API_KEY não configurada" | Variável de ambiente faltando | Adicione no `.env.local` |
| "Invalid API key" | API key errada | Verifique em app.abacatepay.com |
| "Connection refused" | Banco inacessível | Verifique DATABASE_URL |
| "Table 'Customer' does not exist" | Tabelas não criadas | Execute `npx prisma db push` |
| "devMode is not defined" | Modo dev não configurado | Adicione `ABACATEPAY_DEV_MODE=true` |

### 7. Como Ler os Logs do Erro

No **frontend (Console do Navegador)**:
```
Response status: 500
❌ Resposta com erro: { status: 500, statusText: "Internal Server Error" }
📋 Erro da API (JSON): { error: "Erro ao gerar código PIX", details: "..." }
```

No **backend (Terminal do Next.js)**:
```
💥 ERRO GERAL: Error: ...
Stack trace: at POST (/src/app/api/payments/create-pix/route.ts:X:Y)
Tipo do erro: Error
```

O **stack trace** mostra a linha exata onde o erro ocorreu!

### 8. Checklist Final

Antes de testar novamente:

- [ ] `.env.local` existe e está preenchido
- [ ] Servidor Next.js foi **reiniciado** após configurar `.env.local`
- [ ] `npx prisma generate` executado
- [ ] `npx prisma db push` executado (se tabelas não existem)
- [ ] API key testada com curl e funcionou
- [ ] Console do navegador aberto (F12)
- [ ] Terminal do Next.js visível para ver logs

### 9. Próximos Passos

Após identificar o problema através dos logs:

1. **Se for problema de configuração**: Configure as variáveis corretas
2. **Se for problema de banco**: Execute `npx prisma db push` e verifique conexão
3. **Se for problema de API key**: Obtenha uma nova key em app.abacatepay.com
4. **Se for bug no código**: Compartilhe o stack trace completo para análise

## Suporte

Se após seguir todos os passos o erro persistir, forneça:
1. Logs do terminal (backend)
2. Logs do console do navegador (frontend)
3. Resultado do teste curl do passo 4
4. Saída de `npx prisma studio` (printscreen das tabelas)
