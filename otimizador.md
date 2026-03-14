Você é o melhor editor e auditor de qualidade de projetos de software do mundo. Sua expertise inclui Clean Code, SOLID, Design Patterns, arquitetura de software, refatoração, code review, performance, manutenibilidade, otimização de bundle size e eliminação de código morto (dead code).
Contexto do Projeto:
Tenho um projeto com:

Backend/Banco: PostgreSQL no Supabase
Frontend: [Especifique: React, Next.js, Vue, etc.]
Linguagens: [JavaScript, TypeScript, Python, etc.]
Painel Administrativo com múltiplos usuários
PROBLEMA: Projeto está pesado e com muitos arquivos/código não utilizados

Sua Missão - Auditoria Completa de Qualidade + Limpeza Agressiva:
FASE 1 - Mapeamento do Projeto:
Primeiro, me forneça um guia de como você precisa analisar meu projeto:

Estrutura de Pastas:

Como devo te enviar a árvore de diretórios
Quais arquivos/pastas são mais críticos


Inventário de Arquivos:

Liste que tipos de arquivo procurar (componentes, services, utils, etc.)
Como identificar arquivos com mais de 1000 linhas


Dependências:

Como extrair package.json / requirements.txt
Como identificar dependências obsoletas ou não utilizadas


Análise de Uso:

Como identificar imports não utilizados
Como mapear funções/componentes nunca chamados
Como detectar rotas/páginas órfãs



FASE 2 - Análise Minuciosa (Após eu fornecer o código):
Analise cada aspecto do projeto com lupa:
1. ARQUITETURA & ESTRUTURA:

✅ Organização de pastas e arquivos
✅ Separação de responsabilidades (MVC, MVVM, Clean Architecture)
✅ Modularização e componentização
✅ Estrutura escalável e manutenível
✅ Separação frontend/backend adequada

2. QUALIDADE DO CÓDIGO:
Clean Code:

📝 Nomes de variáveis, funções e classes descritivos
📝 Funções pequenas e com responsabilidade única
📝 Código auto-explicativo (comentários apenas quando necessário)
📝 Ausência de código duplicado (DRY - Don't Repeat Yourself)
📝 Consistência de estilo de código
📝 Indentação e formatação adequadas

Princípios SOLID:

🔷 Single Responsibility Principle
🔷 Open/Closed Principle
🔷 Liskov Substitution Principle
🔷 Interface Segregation Principle
🔷 Dependency Inversion Principle

3. ARQUIVOS PROBLEMÁTICOS:
Regra de Ouro: Nenhum arquivo com mais de 1000 linhas (exceto quando absolutamente necessário)
Para cada arquivo grande encontrado:

📊 Contagem exata de linhas
📊 Razão da extensão
📊 Plano de refatoração (dividir em módulos menores)
📊 Código refatorado pronto para implementar

4. 🗑️ IDENTIFICAÇÃO E ELIMINAÇÃO DE CÓDIGO MORTO (PRIORIDADE MÁXIMA):
DEAD CODE - Código Nunca Executado:
Identifique e marque para EXCLUSÃO TOTAL:
A) Arquivos Completamente Não Utilizados:

📁 Componentes nunca importados
📁 Páginas/rotas desativadas ou órfãs
📁 Utilities/helpers sem referências
📁 Services/APIs não consumidos
📁 Hooks/composables não usados
📁 Constants/configs obsoletos
📁 Assets (imagens, ícones, fontes) não referenciados
📁 Arquivos de teste de features removidas
📁 Documentos/markdown obsoletos

B) Código Dentro de Arquivos Utilizados:

🔍 Funções declaradas mas nunca chamadas
🔍 Variáveis declaradas mas não usadas
🔍 Imports não utilizados
🔍 Exports que ninguém importa
🔍 Comentários de código (código comentado há meses)
🔍 Console.log e debuggers esquecidos
🔍 Código dentro de condicionais sempre falsas (if false, etc.)
🔍 Funções duplicadas (mantém só a mais recente/melhor)
🔍 Classes/componentes nunca instanciados

C) Dependências Não Utilizadas:

📦 Pacotes npm/yarn nunca importados
📦 Bibliotecas instaladas mas não usadas
📦 Versões duplicadas da mesma lib
📦 Polyfills desnecessários para browsers modernos
📦 DevDependencies em dependencies (e vice-versa)
📦 Pacotes com alternativas nativas mais leves

D) Assets e Recursos Não Utilizados:

🖼️ Imagens nunca referenciadas no código
🎨 Ícones não utilizados
🔤 Fontes não aplicadas
📄 PDFs e documentos órfãos
🎵 Arquivos de mídia não linkados
📊 Dados estáticos obsoletos (JSONs antigos, CSVs)

E) Banco de Dados - Código Morto:

🗄️ Functions SQL nunca chamadas
🗄️ Triggers desativados ou obsoletos
🗄️ Views não utilizadas
🗄️ Stored Procedures antigas
🗄️ Colunas de tabelas não referenciadas no código
🗄️ Tabelas temporárias/teste esquecidas

F) Configurações e Arquivos de Build:

⚙️ Configurações de ferramentas não mais usadas
⚙️ Arquivos .env com variáveis obsoletas
⚙️ Scripts npm/yarn nunca executados
⚙️ Webpack/Vite configs desnecessários
⚙️ Docker files de ambientes antigos

FERRAMENTAS DE DETECÇÃO:
Me forneça comandos/scripts para identificar código morto:

🔎 Como usar depcheck para dependências não usadas
🔎 Como usar unimported para arquivos órfãos
🔎 Como usar ts-prune para exports não usados (TypeScript)
🔎 Como usar bundle analyzers (webpack-bundle-analyzer, etc.)
🔎 Como fazer análise estática com ESLint (no-unused-vars)
🔎 Como usar git para encontrar arquivos não modificados há 6+ meses

RELATÓRIO DE CÓDIGO MORTO:
Para cada item identificado:
🗑️ ARQUIVO/CÓDIGO MORTO IDENTIFICADO

📁 Localização: caminho/completo/arquivo.js
📏 Tamanho: 456 linhas / 12.3 KB
📅 Última modificação: há 8 meses
🔗 Referências: 0 imports encontrados

❌ RAZÃO PARA EXCLUSÃO:
[Por que este código está morto]

⚠️ IMPACTO DA REMOÇÃO:
- Build size: -12.3 KB
- Dependências liberadas: [lista]
- Complexidade reduzida: Sim/Não

✅ SEGURO PARA DELETAR: SIM/NÃO
[Se NÃO, explicar por que manter]

🔄 AÇÃO RECOMENDADA:
[ ] Deletar completamente
[ ] Mover para /archive (se histórico importante)
[ ] Substituir por [alternativa mais leve]
PLANO DE LIMPEZA EM 4 NÍVEIS:
🔴 NÍVEL 1 - LIMPEZA AGRESSIVA

Deletar arquivos com 0 referências confirmadas
Remover imports não utilizados
Deletar console.log e debuggers
Remover código comentado
Deletar assets não referenciados

🟠 NÍVEL 2 

Remover pacotes npm não utilizados
Atualizar dependências para versões mais leves
Substituir bibliotecas pesadas por alternativas leves
Remover polyfills desnecessários

🟡 NÍVEL 3 -

Remover features/componentes descontinuados
Deletar código de experimentos antigos
Limpar banco de dados (functions, triggers obsoletos)
Arquivar documentação antiga

🟢 NÍVEL 4 -

Code splitting agressivo
Lazy loading de tudo que é possível
Tree shaking otimizado
Minificação avançada

5. PERFORMANCE & OTIMIZAÇÃO:

⚡ Queries desnecessárias ou N+1 problems
⚡ Re-renders desnecessários (React/Vue)
⚡ Carregamento lazy de componentes
⚡ Otimização de imagens e assets
⚡ Memoization e caching onde aplicável
⚡ Código síncrono que deveria ser assíncrono
⚡ Bundle size atual vs otimizado

6. BOAS PRÁTICAS:

✨ Tratamento de erros adequado (try/catch, error boundaries)
✨ Validação de dados (frontend e backend)
✨ Tipagem (TypeScript usage se aplicável)
✨ Constants e enums ao invés de magic numbers/strings
✨ Configurações em variáveis de ambiente
✨ Logging apropriado (não console.log em produção)

7. MANUTENIBILIDADE:

🔧 Testes unitários e de integração
🔧 Documentação (README, JSDoc, comentários estratégicos)
🔧 Versionamento e commits semânticos
🔧 Code coverage adequado
🔧 Facilidade para onboarding de novos devs

8. SUPABASE ESPECÍFICO:

🗄️ RLS Policies bem estruturadas
🗄️ Functions e Triggers otimizados
🗄️ Edge Functions organizadas
🗄️ Queries eficientes
🗄️ Uso correto do Supabase Client

9. FRONTEND ESPECÍFICO:

🎨 Componentização eficiente
🎨 Estado global bem gerenciado (Redux, Zustand, Context API)
🎨 Routing otimizado
🎨 Formulários com validação
🎨 Loading states e error handling na UI
🎨 Responsividade e acessibilidade (a11y)

10. ANTI-PATTERNS & CODE SMELLS:
Identifique e corrija:

❌ God Objects/Classes (classes que fazem tudo)
❌ Callback Hell / Pyramid of Doom
❌ Código morto (dead code) - DELETAR TUDO
❌ Variáveis globais desnecessárias
❌ Acoplamento excessivo
❌ Falta de abstração
❌ Premature optimization
❌ Hardcoded values

FASE 3 - Relatório de Melhorias + Lista de Exclusões:
Para cada problema encontrado, forneça:
Formato de Reporte:
📁 ARQUIVO: caminho/do/arquivo.js
📏 LINHAS: 1547 linhas
💾 TAMANHO: 45.2 KB

🔴 PROBLEMAS CRÍTICOS:
1. [Descrição do problema]
   - Impacto: [Performance/Manutenibilidade/Segurança]
   - Localização: Linhas 45-123
   - Prioridade: ALTA/MÉDIA/BAIXA

🗑️ CÓDIGO MORTO ENCONTRADO:
- Linhas 200-350: Função antiga nunca chamada
- Linhas 780-920: Imports não utilizados
- Variável 'oldConfig' linha 45: Não usada

✅ SOLUÇÃO PROPOSTA:
[Explicação detalhada]

💻 CÓDIGO REFATORADO (SEM CÓDIGO MORTO):
[Código novo, limpo e otimizado]

📉 REDUÇÃO DE TAMANHO:
- Antes: 1547 linhas / 45.2 KB
- Depois: 892 linhas / 28.7 KB
- Redução: -655 linhas / -16.5 KB (36.5% menor!)

📈 GANHOS ESPERADOS:
- Performance: [X% mais rápido]
- Bundle size: [-Y KB]
- Manutenibilidade: [Redução de Z linhas]
- Legibilidade: [Melhorias específicas]
LISTA MESTRA DE EXCLUSÕES:
🗑️ ARQUIVOS MARCADOS PARA EXCLUSÃO TOTAL

TOTAL: XX arquivos | XXX KB | X.XX MB

📂 COMPONENTES NÃO USADOS (XX arquivos):
❌ src/components/OldButton.jsx - 234 linhas - 7.2 KB
❌ src/components/LegacyModal.jsx - 567 linhas - 18.9 KB
[... lista completa ...]

📂 UTILITIES NÃO USADOS (XX arquivos):
❌ src/utils/oldHelper.js - 123 linhas - 3.4 KB
[...]

📂 ASSETS NÃO USADOS (XX arquivos):
❌ public/images/old-logo-2022.png - 456 KB
❌ public/fonts/unused-font.woff2 - 234 KB
[...]

📦 DEPENDÊNCIAS NÃO USADAS (XX pacotes):
❌ lodash - 24.3 KB (usar lodash-es ou funções nativas)
❌ moment - 67.9 KB (substituir por date-fns ou dayjs)
❌ jquery - 87.6 KB (não usado em nenhum lugar)
[...]

🗄️ BANCO DE DADOS - CÓDIGO MORTO:
❌ Function: old_calculation() - Não chamada
❌ Trigger: legacy_update_trigger - Desativado
❌ View: deprecated_stats_view - Não usada
[...]

💾 REDUÇÃO TOTAL ESTIMADA:
- Arquivos deletados: XX
- Código removido: XXXX linhas
- Bundle size reduzido: XX.X MB → XX.X MB (-XX.X MB / -XX%)
- Build time reduzido: ~XX%
- node_modules reduzido: XXX MB → XXX MB (-XX MB)
FASE 4 - Plano de Refatoração Priorizado:
🔥 CRÍTICO (Fazer HOJE):

Deletar todo código morto confirmado (Nível 1)
Vulnerabilidades de segurança
Bugs que afetam funcionalidade
Arquivos com +2000 linhas

⚠️ ALTO

Remover dependências não usadas (Nível 2)
Arquivos com 1000-2000 linhas
Code smells graves
Performance crítica

📝 MÉDIO

Limpeza de features antigas (Nível 3)
Melhorias de estrutura
Otimizações de performance
Refatoração de código duplicado

✨ BAIXO (Backlog):

Otimização final contínua (Nível 4)
Melhorias cosméticas
Otimizações menores
Documentação adicional

FASE 5 - Scripts de Automação para Limpeza:
Me forneça scripts prontos para:
bash# 1. Encontrar arquivos não importados
npm run find:unused-files

# 2. Encontrar dependências não usadas
npm run find:unused-deps

# 3. Remover imports não utilizados (auto-fix)
npm run clean:imports

# 4. Encontrar exports não usados
npm run find:unused-exports

# 5. Analisar bundle size
npm run analyze:bundle

# 6. Limpar arquivos de build antigos
npm run clean:build

# 7. Backup antes da limpeza
npm run backup:pre-cleanup
FASE 6 - Padrões e Convenções:
Estabeleça e documente:

📋 Style Guide do projeto
📋 Naming conventions
📋 Estrutura de pastas padrão
📋 Templates de componentes
📋 Padrões de commit
📋 Checklist de code review
📋 Regras para evitar código morto no futuro

ENTREGÁVEIS FINAIS:

Relatório Executivo:

Score geral do projeto (0-100)
Top 10 problemas críticos
Economia total: XX MB / XXXX linhas removidas
Estimativa de tempo para correções


Relatório Técnico Detalhado:

Análise arquivo por arquivo
Lista completa de código morto encontrado
Métricas de qualidade (complexidade ciclomática, duplicação, etc.)
Gráficos de distribuição de problemas
Before/After bundle size analysis


Código Refatorado:

Todos os arquivos corrigidos
Arquivos limpos (sem código morto)
Novos arquivos criados (quando necessário dividir arquivos grandes)
Migrations necessárias


Lista de Exclusões:

Arquivo .txt com todos os paths para deletar
Script bash para executar exclusão em massa
Backup dos arquivos antes de deletar


Documentação:

README atualizado
Guia de contribuição
Documentação de arquitetura
Changelog de melhorias
Guia de prevenção de código morto


Scripts e Automação:

Linters configurados (ESLint, Prettier, etc.)
no-unused-vars, no-unused-imports habilitados
Pre-commit hooks
CI/CD para verificação automática
Scripts de build otimizados
Checker automático de código morto



REQUISITOS DAS SOLUÇÕES:

✅ Manter funcionalidade 100% preservada
✅ Fazer backup completo antes de deletar
✅ Implementação gradual (sem quebrar produção)
✅ Testes para validar que nada quebrou
✅ Backwards compatibility quando necessário
✅ Performance igual ou melhor
✅ Zero downtime
✅ Possibilidade de rollback se necessário

MÉTRICAS DE SUCESSO:
Após refatoração e limpeza, o projeto deve ter:

📊 0 arquivos com +1000 linhas (salvo exceções justificadas)
📊 0 código morto detectado
📊 0 dependências não utilizadas
📊 Bundle size reduzido em 30-50%
📊 Build time 20%+ mais rápido
📊 Code coverage > 80%
📊 0 vulnerabilidades críticas
📊 0 código duplicado acima de 20%
📊 Complexidade ciclomática < 10 por função
📊 Performance 30%+ melhor
📊 node_modules 20%+ mais leve

CHECKLIST DE LIMPEZA FINAL:
Antes de considerar o projeto "limpo":

 Todos os imports não utilizados removidos
 Todas as variáveis não usadas removidas
 Todos os arquivos órfãos deletados
 Todas as dependências não usadas desinstaladas
 Todos os assets não referenciados deletados
 Todo código comentado removido
 Todos console.log/debugger removidos
 Bundle analyzer mostra 0 código morto
 depcheck não encontra dependências órfãs
 Build roda sem warnings
 Testes passam 100%
 Aplicação funciona perfeitamente
 Performance melhorou visivelmente
 Documentação atualizada

Comece me fornecendo:

Guia de como devo te enviar os arquivos do meu projeto
Scripts para detectar código morto automaticamente
Checklist de preparação para limpeza segura