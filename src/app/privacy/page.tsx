import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 antialiased selection:bg-accent-500/30">
      <Navbar />

      <main className="container mx-auto px-6 py-24 max-w-4xl">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-accent-500 hover:text-accent-400 mb-12 transition-colors group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Voltar para o cadastro
        </Link>

        <article className="prose prose-invert prose-zinc max-w-none">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-accent-500/10 rounded-2xl">
              <Shield size={32} className="text-accent-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase italic mb-0">
              Privacidade
            </h1>
          </div>

          <p className="text-xl text-zinc-400 mb-12 leading-relaxed">
            Como cuidamos dos seus dados e dos dados da sua arena.
          </p>

          <section className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                1. Coleta de Informação
              </h2>
              <p className="leading-relaxed">
                Coletamos informações necessárias para a prestação do serviço,
                como: nome da arena, dados de contato, emails dos usuários
                administradores e informações de agendamento de seus clientes
                finais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                2. Uso dos Dados
              </h2>
              <p className="leading-relaxed mb-4">
                Seus dados são utilizados para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gerenciar sua conta e acessos à Plataforma.</li>
                <li>Processar pagamentos através do Stripe.</li>
                <li>
                  Enviar notificações relacionadas aos seus agendamentos via
                  WhatsApp.
                </li>
                <li>
                  Melhorar a experiência da Plataforma através de análises de
                  uso anônimas.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                3. Proteção e Segurança
              </h2>
              <p className="leading-relaxed">
                Utilizamos o Supabase para armazenamento seguro de dados e
                autenticação, seguindo padrões rigorosos de criptografia e
                proteção contra acesso não autorizado. Não vendemos seus dados
                para terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                4. Processamento de Pagamentos
              </h2>
              <p className="leading-relaxed">
                Todas as transações financeiras são processadas pelo Stripe
                (stripe.com). O Agendouu não armazena dados de cartão de crédito
                em seus próprios servidores.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                5. Direitos do Usuário (LGPD)
              </h2>
              <p className="leading-relaxed">
                Você tem o direito de solicitar a exclusão de sua conta e de
                todos os dados associados a ela, bem como solicitar a correção
                de dados incorretos a qualquer momento através do nosso suporte.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Cookies</h2>
              <p className="leading-relaxed">
                Utilizamos cookies apenas para manter sua sessão ativa e
                garantir o funcionamento correto das funcionalidades
                administrativas.
              </p>
            </section>
          </section>

          <div className="mt-20 pt-10 border-t border-white/10 text-center">
            <p className="text-zinc-500 italic">
              Preocupado com sua privacidade? Fale conosco em
              privacidade@agendouu.com
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
