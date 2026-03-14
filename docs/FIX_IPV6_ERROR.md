# 🚨 Erro de Conexão com Banco de Dados (IPv6)

Diagnóstico: Sua rede não está conseguindo conectar ao banco de dados Supabase via **IPv6**.
O comando `nslookup` confirmou que o endereço `db.anjjdsggjmnnyhbslnjd.supabase.co` só possui registro IPv6 e nenhum IPv4.

O Supabase removeu o suporte gratuito a IPv4 direto recentemente.

## Solução 1: Usar o Connection Pooler (Pode funcionar via IPv4)

1. Vá no painel do Supabase: **Settings > Database**.
2. Procure a seção **Connection Pooling**.
3. Copie a **Connection String** da aba **Transaction**.
   - Ela deve usar a porta **6543**.
   - Verifique se o **Host** é diferente de `db.anjjdsggjmnnyhbslnjd...`. Se for o mesmo, pule para a Solução 2.

Se você conseguir uma URL diferente (ex: `aws-0-sa-east-1.pooler.supabase.com`), atualize seu `.env.local`:
```env
DATABASE_URL="postgresql://postgres:[SENHA]@[NOVO_HOST]:6543/postgres?pgbouncer=true"
```

## Solução 2: Ativar IPv4 Add-on (Garantido)

Se a solução acima não funcionar, você precisará ativar o suporte a IPv4 no Supabase:
1. Vá em **Settings > Add-ons**.
2. Ative o **"IPv4 Address"** (Custa $4/mês).
3. Após alguns minutos, o endereço `db....` passará a resolver IPv4 e tudo funcionará.

## Solução 3: Usar VPN ou Rede com IPv6 (Temporário)

Tente conectar de outra rede (ex: rotear 4G do celular) que tenha suporte nativo a IPv6 para testar.

## O que fazer agora?

Verifique no painel do Supabase se você consegue uma URL de conexão diferente para o "Pooler" que suporte IPv4.
